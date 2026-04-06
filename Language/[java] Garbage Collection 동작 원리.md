# Garbage Collection 동작 원리

## 1. 개요
가비지 컬렉션(Garbage Collection, GC)은 자바 프로그램 실행 시 JVM(Java Virtual Machine)의 Heap 영역에서 동적으로 할당된 메모리 중 더 이상 사용되지 않는 객체(Unreachable Object)를 찾아 자동으로 메모리를 회수하는 프로세스입니다. 
개발자가 직접 메모리를 해제할 필요 없이 메모리 누수(Memory Leak)를 방지할 수 있습니다.

## 2. GC의 핵심 알고리즘: Mark and Sweep
가비지 컬렉션의 가장 기본적인 알고리즘은 **Mark and Sweep** 방식으로 이루어집니다.

![](https://upload.wikimedia.org/wikipedia/commons/4/4a/Animation_of_the_Naive_Mark_and_Sweep_Garbage_Collector_Algorithm.gif)

1. **Mark (식별)**: GC Root(Stack의 로컬 변수, Method 영역의 정적 변수 등)에서 출발하여 연결된 모든 객체를 탐색하고, 사용 중인 객체(Reachable)를 식별(Mark)합니다.
2. **Sweep (제거)**: Mark되지 않은 객체(Unreachable)를 식별하여 메모리에서 제거합니다.
3. **Compact (압축, 옵션)**: Sweep 이후 흩어져 있는 여유 메모리 공간을 한곳으로 모아 단편화(Fragmentation)를 방지하는 과정을 거치는 GC 알고리즘도 존재합니다.

## 3. 세대별 가비지 컬렉션 (Generational GC)
JVM은 "대부분의 객체는 금방 접근 불가능 상태(Unreachable)가 된다"는 **Weak Generational Hypothesis(약한 세대 가설)** 를 기반으로 Heap 영역을 두 개의 주요 세대(Generation)로 나누어 관리합니다.

### 3.1. Young Generation
- 새롭게 생성된 객체가 할당되는 영역입니다.
- **Eden 영역**과 2개의 **Survivor 영역**(Survivor 0, Survivor 1)으로 구성됩니다.
- 이곳에서 발생하는 GC를 **Minor GC**라고 부르며, 비교적 빈번하게 발생하고 속도가 매우 빠릅니다.
- **동작 방식**: 
  1. 객체가 처음 생성되면 Eden 영역에 할당됩니다.
  2. Eden 영역이 꽉 차면 Minor GC가 발생하고, 살아남은 객체는 Survivor 영역 중 하나로 이동합니다.
  3. 이 과정에서 살아남은 횟수(Age)가 기록되며, 일정한 임계값을 넘긴 객체는 Old Generation으로 승격(Promotion)됩니다.

### 3.2. Old Generation
- Young Generation에서 살아남아 승격(Promotion)된 오래된 객체들이 저장되는 영역입니다.
- Young 영역보다 크기가 크게 할당되며, 객체가 상대적으로 적게 소멸됩니다.
- 이곳에서 발생하는 GC를 **Major GC** (또는 Full GC)라고 부릅니다.
- **Stop-The-World**: Major GC가 발생하면 GC 쓰레드를 제외한 모든 애플리케이션 쓰레드가 일시 정지(Stop-The-World)되며, 이는 애플리케이션 성능에 직접적인 영향을 미칩니다.

## 4. 다양한 GC 방식
성능 향상과 Stop-The-World 시간을 최소화하기 위해 JVM은 다양한 GC 알고리즘을 지원합니다.

- **Serial GC**: 단일 스레드로 GC를 처리합니다. 성능이 낮아 주로 싱글 코어 환경이나 매우 작은 애플리케이션에 사용됩니다.
- **Parallel GC**: 다중 스레드로 Minor GC를 수행하여 속도를 향상시킵니다. (Java 8의 기본 GC)
- **CMS (Concurrent Mark Sweep) GC**: Stop-The-World 시간을 줄이기 위해 애플리케이션 스레드와 GC 스레드가 동시에 실행되도록 한 방식입니다. (현재는 Deprecated)
- **G1 (Garbage First) GC**: Heap을 일정한 크기의 논리적 단위(Region)로 나누어, 쓰레기가 가장 많은(가비지가 가장 많은) Region부터 우선적으로 수거합니다. (Java 9 이상부터 기본 GC)
- **ZGC / Shenandoah GC**: 초저지연(Ultra-low latency)을 목표로 하며 10ms 이하의 매우 짧은 Stop-The-World 시간을 보장합니다. (대용량 Heap 메모리 환경에 적합)
