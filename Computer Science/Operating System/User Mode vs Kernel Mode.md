---
title: User Mode vs Kernel Mode
---

## User Mode vs Kernel Mode

> CPU가 현재 실행 중인 코드에 어느 정도의 권한을 줄지 구분하는 **실행 권한 수준(privilege level)**

운영체제는 모든 프로그램이 하드웨어를 직접 건드리게 두지 않는다. 그렇게 하면 한 프로그램의 버그가 다른 프로세스나 운영체제 전체를 망가뜨릴 수 있기 때문이다.

그래서 현대 시스템은 보통 **사용자 코드가 실행되는 user mode**와, **운영체제 핵심 코드가 실행되는 kernel mode**를 구분한다.

많은 교재에서는 이를 단순히 "두 가지 모드"로 설명하지만, 실제 하드웨어는 더 세분화된 privilege level을 가질 수 있다. 예를 들어 x86은 ring 구조를 가지지만, 일반적인 운영체제 설명에서는 **user mode와 kernel mode의 대비**만 이해해도 충분하다.

<br>

#### 왜 나누는가?

권한을 나누는 핵심 이유는 **보호(protection)** 와 **격리(isolation)** 다.

- 사용자 프로그램이 커널 메모리를 직접 수정하지 못하게 함
- 임의의 I/O 명령이나 privileged instruction 실행을 제한함
- 프로세스끼리 서로의 메모리를 함부로 건드리지 못하게 함
- 프로그램이 죽더라도 운영체제 전체가 바로 무너지지 않게 함

즉, 운영체제는 CPU의 권한 모드를 이용해 "아무 코드나 최고 권한으로 실행되지 못하게" 막는다.

<br>

#### User Mode

> 일반 애플리케이션이 실행되는 제한된 권한의 모드

브라우저, 메신저, 게임, 웹 서버 프로세스 같은 대부분의 응용 프로그램은 user mode에서 실행된다.

이 모드에서는 보통 다음이 제한된다.

- 커널 주소 공간 직접 접근 불가
- 장치 레지스터나 I/O 포트 직접 접근 불가
- 페이지 테이블 변경, 인터럽트 제어 같은 privileged instruction 실행 불가
- 임의로 kernel mode로 점프 불가

대신 user mode 프로세스는 **자기에게 허용된 가상 주소 공간** 안에서 실행되고, 운영체제가 제공하는 **시스템 콜(system call)** 을 통해 필요한 기능을 요청한다.

예를 들어 파일 읽기, 소켓 생성, 프로세스 생성, 메모리 매핑 같은 작업은 애플리케이션이 직접 하드웨어를 제어하는 것이 아니라 커널에 요청해서 수행한다.

<br>

#### Kernel Mode

> 운영체제 핵심 코드가 실행되는 높은 권한의 모드

kernel mode에서는 CPU와 메모리, 장치에 대해 훨씬 더 강한 권한을 가진다.

대표적으로 다음 작업들이 가능하다.

- 스케줄링과 문맥 전환 관리
- 페이지 테이블 및 메모리 보호 설정
- 파일 시스템 처리
- 네트워크 스택 처리
- 디바이스 드라이버 실행
- 인터럽트/예외 처리

이 권한은 강력하지만 위험하기도 하다.

- user mode 프로그램이 잘못되면 보통 해당 프로세스만 죽는다.
- kernel mode 코드가 잘못되면 시스템 전체가 불안정해지거나 크래시할 수 있다.

그래서 커널 코드는 반드시 더 엄격하게 보호되고 검증되어야 한다.

<br>

#### User Mode에서 Kernel Mode로 언제 들어가는가?

보통 다음 세 경우가 핵심이다.

- **시스템 콜(System Call)**
  - 프로그램이 파일 읽기, 프로세스 생성, 네트워크 송수신 같은 커널 서비스를 요청할 때
- **예외(Exception / Fault)**
  - page fault, divide-by-zero 같은 문제가 발생했을 때
- **하드웨어 인터럽트(Interrupt)**
  - 타이머, 디스크, 네트워크 카드 같은 장치가 CPU에 사건을 알릴 때

중요한 점은 **사용자 프로그램이 마음대로 커널 모드로 진입하는 것이 아니라**, CPU가 정해진 진입점과 규칙을 통해서만 커널 쪽 처리 루틴으로 넘어간다는 것이다.

<br>

#### 동작 흐름

<img src="https://learn.microsoft.com/en-us/windows-hardware/drivers/gettingstarted/images/userandkernelmode01.png" alt="User mode and kernel mode communication diagram">

예를 들어 애플리케이션이 `read()` 같은 시스템 콜을 호출하면 대략 다음 순서로 동작한다.

1. 애플리케이션은 user mode에서 실행된다.
2. 시스템 콜 명령을 통해 커널 서비스 요청을 보낸다.
3. CPU는 정해진 진입 절차에 따라 privilege level을 올리고 kernel mode로 들어간다.
4. 커널은 인자와 권한을 검사한 뒤 실제 작업을 수행한다.
5. 작업 결과를 정리한 뒤 다시 user mode로 돌아간다.

즉, 시스템 콜은 "애플리케이션이 커널 함수를 그냥 직접 호출하는 것"이 아니라, **권한 전환을 동반한 통제된 진입 메커니즘**이다.

<br>

#### User Mode vs Kernel Mode와 User Space vs Kernel Space

이 둘은 비슷하게 보이지만 완전히 같은 말은 아니다.

- **User Mode / Kernel Mode**
  - CPU의 현재 실행 권한 수준
- **User Space / Kernel Space**
  - 가상 주소 공간 관점에서 나눈 메모리 영역

실무나 면접에서는 두 표현을 섞어 쓰는 경우가 많지만, 엄밀히 말하면 하나는 **CPU 권한 모드**, 다른 하나는 **메모리 주소 공간 구분**에 더 가깝다.

<br>

#### 자주 하는 오해

- **1. user mode → kernel mode 전환은 곧 context switch다?**

  아니다. 시스템 콜이나 예외로 인해 **모드만 바뀌는 것**과, 스케줄러가 다른 프로세스/스레드로 **실행 주체를 바꾸는 context switch**는 구분해야 한다.

  예를 들어 같은 프로세스가 시스템 콜을 수행하고 다시 복귀하면 mode switch는 있었지만, 다른 태스크로 바뀌지 않았다면 context switch는 아닐 수 있다.

- **2. kernel mode면 무조건 빠르다?**

  아니다. 권한이 더 높을 뿐이지, 항상 더 빠르다는 뜻은 아니다. 오히려 커널 진입/복귀 자체에도 비용이 있고, 보호 검증과 복잡한 처리 때문에 단순하지 않다.

- **3. user mode 프로그램은 하드웨어를 전혀 못 쓴다?**

  직접 제어는 못 하지만, 운영체제가 제공하는 시스템 콜과 드라이버 경유로 하드웨어 기능을 사용할 수 있다.

<br>

#### 정리

- **User mode**는 제한된 권한으로 응용 프로그램을 안전하게 실행하기 위한 모드다.
- **Kernel mode**는 운영체제가 자원 관리와 하드웨어 제어를 수행하기 위한 높은 권한의 모드다.
- 둘을 나누는 이유는 **보호, 격리, 안정성 확보**다.
- user mode에서 필요한 작업은 **시스템 콜, 예외, 인터럽트**를 통해 통제된 방식으로 kernel mode에 진입해 처리된다.
- **mode switch와 context switch는 같은 개념이 아니다.**

<br>

##### [참고 자료]

- Microsoft Learn - User Mode and Kernel Mode  
  https://learn.microsoft.com/en-us/windows-hardware/drivers/gettingstarted/user-mode-and-kernel-mode
- Warren Toomey - Introduction to Operating Systems  
  https://minnie.tuhs.org/CompArch/Lectures/week07.html
