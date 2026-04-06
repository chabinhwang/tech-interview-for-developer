# Virtual Threads (Java 25 기준)

## 1. 개요 (Overview)
* **Virtual Threads(가상 스레드)**는 Java 19에서 프리뷰로 등장하여 Java 21에서 정식 기능으로 도입된 후, **Java 25**에 이르러 핵심 한계점들이 극복되고 관련 생태계(Structured Concurrency, Scoped Values)가 완성된 Project Loom의 초경량 스레드 모델입니다.
* OS가 아닌 **JVM이 직접 스케줄링하고 관리**하며, 기존의 플랫폼 스레드(OS 스레드)와 달리 매우 적은 메모리 풋프린트를 가집니다. 이를 통해 단일 애플리케이션 내에서 수백만 개의 스레드를 동시에 생성하고 유지하는 것이 가능해졌습니다.

## 2. 기존 OS 스레드 풀 모델과의 차이점

### 전통적인 플랫폼 스레드 (Platform Threads)
* **1:1 매핑 모델**: 기존 `java.lang.Thread`는 OS의 네이티브 스레드와 1:1로 매핑됩니다.
* **무거운 리소스 풋프린트**: OS 스레드는 생성 및 컨텍스트 스위칭(Context Switching)에 커널 모드 진입이 필요하여 시스템 콜(System Call) 비용이 높습니다. 기본적으로 스레드당 약 1MB~2MB의 고정된 스택(Stack) 메모리를 점유합니다.
* **스레드 풀(Thread Pool)의 한계와 병목**: 스레드 생성 비용이 높아 미리 생성해두는 '스레드 풀' 패턴을 강제합니다. 그러나 I/O 작업(DB 쿼리, 외부 API 호출, 파일 읽기 등) 시 스레드 전체가 블로킹(Blocking)되므로, 애플리케이션의 최대 동시 처리량(Throughput)이 스레드 풀 사이즈(보통 수백 개 수준)에 갇히게 되는 치명적인 한계(Little's Law에 따른 병목)가 발생합니다.

### 가상 스레드 (Virtual Threads)
* **M:N 매핑 모델**: 수백만 개의 가상 스레드(M)가 소수의 캐리어 스레드(Carrier Threads = OS 스레드, N) 위에서 실행됩니다. 기본적으로 캐리어 스레드 풀의 크기는 CPU 코어 수(`Runtime.getRuntime().availableProcessors()`)와 동일하게 설정됩니다.
* **초경량 저비용**: 가상 스레드는 생성 시 스택 메모리를 고정으로 할당하지 않고, **JVM 힙(Heap) 영역에 동적으로 확장 가능한 형태로 저장**됩니다. (초기 크기는 수백 바이트 수준)
* **스레드-퍼-리퀘스트(Thread-per-Request) 패러다임의 부활**: 동시성을 높이기 위해 억지로 도입해야 했던 WebFlux 등 리액티브(Reactive) 프로그래밍의 콜백 지옥이나 `CompletableFuture`의 복잡한 체이닝 없이, 요청 하나당 가상 스레드 하나를 할당하는 **직관적인 동기식(Synchronous) 블로킹 코드**만으로 압도적인 동시성과 처리량을 달성할 수 있습니다.

![Virtual Threads Architecture](https://docs.oracle.com/en/java/javase/21/core/img/virtual-threads-and-platform-threads.png)
*(참고: 수많은 가상 스레드가 소수의 플랫폼 스레드에 마운트/언마운트되는 아키텍처)*

## 3. 심층 원리: Continuation과 마운트/언마운트 메커니즘

가상 스레드의 핵심 동작 원리는 JVM 레벨에서 구현된 **Continuation (연속성)**에 있습니다.

* **마운트(Mount)**: 가상 스레드가 실행될 때, JVM은 해당 가상 스레드를 사용 가능한 캐리어 스레드(OS 스레드)에 할당합니다.
* **언마운트(Unmount) 및 스택 청킹(Stack Chunking)**: 가상 스레드 내에서 블로킹 I/O 작업(예: `Socket.read()`, `Thread.sleep()`)이 호출되면, 가상 스레드는 작업을 중지(Suspend)하고 현재 실행 중인 콜 스택(Call Stack) 프레임 정보를 **힙(Heap) 영역으로 복사(이동)**하여 보관합니다. 이 과정을 언마운트라고 합니다.
* **캐리어 스레드 재사용**: 언마운트가 완료되면 해당 캐리어 스레드는 자유로워지며(Non-blocking), 즉시 다른 대기 중인 가상 스레드를 마운트하여 실행을 이어갑니다.
* **실행 재개(Resume)**: I/O 작업의 응답이 도착하면(OS의 `epoll`, `kqueue` 등을 통해 JVM 이벤트 루프가 감지), 힙에 보관되어 있던 Continuation 스택 프레임을 다시 캐리어 스레드의 스택 영역으로 복사하여 블로킹되었던 지점부터 실행을 재개합니다.

이러한 일련의 과정은 커널의 개입 없이 **JVM 내부의 메모리 복사 작업**만으로 이루어지므로 컨텍스트 스위칭 비용이 전통적인 OS 스레드에 비해 비약적으로 낮습니다.

## 4. Java 25 기준 최신 동향 및 개선점 (Deep Dive)

### 4.1 모니터 피닝(Monitor Pinning)의 완전한 해결 (JEP 491)
Java 21의 가장 큰 한계점은 `synchronized` 블록이나 메서드 내부, 혹은 JNI(Java Native Interface) 호출 중 블로킹 작업이 발생하면 **가상 스레드가 캐리어 스레드를 언마운트하지 못하고 물고 늘어지는 현상(Pinning)**이었습니다. 이로 인해 레거시 DB 커넥션 풀이나 JDBC 드라이버 사용 시 심각한 성능 저하 및 데드락이 발생할 수 있었습니다.
**Java 25(및 24부터 도입된 개선) 기준**, JVM 내부의 객체 모니터(Object Monitor) 메커니즘이 대폭 개편되어 `synchronized` 구문 내부에서도 정상적으로 언마운트가 가능해졌습니다. 이로써 `ReentrantLock`으로 마이그레이션할 필요 없이 레거시 코드베이스에서도 가상 스레드를 안전하게 전면 도입할 수 있게 되었습니다.

### 4.2 구조적 동시성 (Structured Concurrency) 성숙
가상 스레드는 수백만 개가 생성될 수 있으므로, 이들의 생명주기 관리와 예외 전파(Error Propagation), 스레드 누수 방지가 매우 중요합니다. Java 25에서는 `StructuredTaskScope` API가 완성되어 부모-자식 스레드 관계를 명확히 정의합니다.
* 특정 작업이 실패하여 예외를 던지면, 관련된 다른 자식 가상 스레드들을 즉시 취소(Cancel)하여 불필요한 리소스 낭비를 막는 "Fail-fast" 동시성 패턴을 언어적 차원에서 완벽하게 지원합니다.

### 4.3 ThreadLocal의 대안: Scoped Values
가상 스레드 환경에서 기존 `ThreadLocal`을 사용하면 힙 메모리 누수가 발생하기 매우 쉽습니다(수백만 개의 스레드가 각각 ThreadLocal 맵을 가지게 되므로).
Java 25에서는 불변(Immutable) 상태로 데이터를 하위 스레드에 안전하고 가볍게 전달하는 **`ScopedValue`**가 표준으로 자리 잡았습니다. 이를 통해 인증 정보(Security Context)나 트랜잭션 ID 등을 가상 스레드 풀 전체에 효율적으로 전파할 수 있습니다.

## 5. 면접 핵심 요약 및 주의사항 (Trade-offs)

1. **가상 스레드는 CPU 바운드 작업용이 아닙니다.**
   * 암호화, 영상 처리, 대규모 수학 연산 등 CPU를 집중적으로 사용하는 작업(CPU-Bound Task)은 가상 스레드로 처리해도 빨라지지 않습니다. 오히려 컨텍스트 스위칭 오버헤드만 추가될 수 있습니다. **가상 스레드는 철저히 I/O 바운드 작업의 "동시 처리량(Throughput) 극대화"를 위한 도구**입니다.
2. **스레드 풀을 사용하지 마세요 (No Thread Pooling).**
   * 가상 스레드는 생성 비용이 0에 수렴하므로 `Executors.newVirtualThreadPerTaskExecutor()`를 사용하여 **작업마다 매번 새로 생성**하는 것이 올바른 패턴입니다. 풀링(Pooling)하는 것은 안티 패턴입니다.
3. **ThreadLocal 대신 ScopedValue를 지향합니다.**
   * 수백만 개의 스레드가 `ThreadLocal`에 큰 객체를 저장하면 심각한 OutOfMemoryError를 유발할 수 있으므로, 상태 전파 시에는 가급적 `ScopedValue`를 고려해야 합니다.
4. **결론**: 기존 스레드 풀 모델의 한계를 극복하고 리액티브 프로그래밍의 복잡성 없이 동기식 코드로 압도적인 성능을 내게 해주는 Java의 새로운 표준 동시성 모델입니다. Java 25에서는 초기 `synchronized` Pinning 문제까지 완전히 해소되어 완벽한 엔터프라이즈 실무 투입이 가능해졌습니다.