# JVM 메모리 구조 심화

## 1. 개요
JVM (Java Virtual Machine)은 자바 바이트코드(.class)를 운영체제가 이해할 수 있는 기계어로 변환하고 실행하는 가상 머신입니다. JVM은 메모리 관리(Garbage Collection)를 수행하며, 프로그램 실행 시 운영체제로부터 메모리를 할당받아 이를 용도에 맞게 나누어 관리합니다. 이 영역을 **Runtime Data Areas**라고 합니다.

## 2. JVM 구조
JVM은 크게 다음 세 가지 주요 구성 요소로 나뉩니다.

1. **Class Loader (클래스 로더)**
   - 자바 소스코드(.java)를 컴파일한 바이트코드(.class) 파일을 메모리(Runtime Data Areas)에 로드합니다.
   - 로딩(Loading), 링크(Linking), 초기화(Initialization)의 세 단계를 거쳐 메모리에 클래스 메타데이터를 저장합니다.
2. **Execution Engine (실행 엔진)**
   - 메모리에 적재된 클래스(바이트코드)를 기계어로 번역하여 명령어 단위로 실행합니다.
   - **인터프리터(Interpreter)**: 바이트코드를 명령어 단위로 하나씩 읽고 실행합니다.
   - **JIT 컴파일러(Just-In-Time Compiler)**: 인터프리터 방식의 단점(실행 속도 저하)을 보완하기 위해 반복되는 코드를 네이티브 코드로 변환하여 빠르게 실행하도록 돕습니다.
   - **Garbage Collector(가비지 컬렉터)**: 더 이상 사용되지 않는 객체를 회수하여 메모리를 관리합니다.
3. **Runtime Data Areas (런타임 데이터 영역)**
   - 프로그램 실행 중 JVM이 운영체제로부터 할당받은 메모리 공간입니다.

---

## 3. Runtime Data Areas (메모리 구조)
JVM의 메모리 구조는 크게 **스레드(Thread) 공유 영역**과 **스레드(Thread) 고유 영역**으로 구분됩니다.

![](https://upload.wikimedia.org/wikipedia/commons/d/dd/JvmSpec7.png)

### 3.1. 모든 스레드가 공유하는 영역 (Thread Shared)
JVM이 시작될 때 생성되고 종료될 때까지 유지됩니다.

#### 1) Method Area (메서드 영역 / Class Area)
- JVM이 읽어 들인 클래스와 인터페이스 메타데이터를 저장합니다.
- 클래스 정보, 정적 변수(`static`), 상수 풀(Constant Pool), 메서드의 바이트코드 등이 포함됩니다.
- Java 8 이전에는 **PermGen**(Permanent Generation) 영역에 속했으나, 클래스 메타데이터가 증가하면서 메모리 누수가 발생해 Java 8부터는 **Metaspace**라는 네이티브 메모리 영역으로 분리되었습니다.

#### 2) Heap Area (힙 영역)
- 프로그램 실행 중에 생성되는 **모든 객체(인스턴스)와 배열**이 동적으로 할당되는 공간입니다.
- 가비지 컬렉션(GC)의 주요 대상이 되는 영역이며, GC는 이 영역에서 접근 불가능한(Unreachable) 객체를 찾아 메모리를 회수합니다.
- 내부적으로 객체의 생존 주기에 따라 **Young Generation** (Eden, Survivor)과 **Old Generation**으로 나뉘어 관리됩니다. (참고: [Garbage Collection 동작 원리])

---

### 3.2. 각 스레드마다 개별적으로 생성되는 영역 (Thread-Local)
각 스레드가 생성될 때마다 개별적으로 할당되며, 스레드가 종료되면 함께 소멸합니다.

#### 1) Stack Area (스택 영역)
- 메서드가 호출될 때마다 해당 메서드의 실행 정보를 담은 **스택 프레임(Stack Frame)** 이 생성되어 Stack 영역에 Push되고, 메서드 종료 시 Pop되어 제거됩니다.
- 스택 프레임에는 지역 변수(Local Variable), 매개변수, 리턴 값, 연산 중 발생하는 임시 데이터가 저장됩니다.
- 기본 타입(Primitive Type) 변수는 스택 영역에 직접 값을 저장하며, 참조 타입(Reference Type) 변수는 Heap 영역에 생성된 객체의 메모리 주소를 저장합니다.
- 재귀 호출이 깊어져 스택 공간을 초과하면 `StackOverflowError`가 발생합니다.

#### 2) PC Register (PC 레지스터)
- 현재 스레드가 실행 중인 JVM 명령어(바이트코드)의 주소를 가리킵니다.
- 스레드가 컨텍스트 스위칭(Context Switching)될 때 현재 실행하던 위치를 기억하기 위해 사용됩니다.
- 만약 네이티브(Native) 메서드를 실행 중이라면, PC Register의 값은 `Undefined`가 됩니다.

#### 3) Native Method Stack (네이티브 메서드 스택)
- 자바 코드가 아닌 C나 C++ 등 다른 언어로 작성된 네이티브 코드(JNI, Java Native Interface)를 실행하기 위한 스택 공간입니다.
- 예를 들어, `Thread.currentThread()`와 같이 시스템 콜이 필요한 경우 네이티브 메서드 스택을 통해 운영체제의 기능을 활용하게 됩니다.
