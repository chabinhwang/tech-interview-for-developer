## PCB & Context Switching

<br>

#### Process Management

> 운영체제는 실행 중인 프로세스/스레드의 상태를 추적하고, CPU와 자원을 배분하면서 전체 시스템을 관리한다.

이를 위해 각 실행 단위에 대한 메타데이터가 필요하다. 전통적으로 이 개념을 **PCB(Process Control Block)** 이라고 부른다.

- Process Metadata 예시
  - PID / TGID
  - 현재 상태(running, runnable, blocked, zombie 등)
  - 스케줄링 정보(우선순위, time slice, 정책)
  - CPU 문맥(레지스터, PC, stack pointer)
  - 메모리 관리 정보(주소 공간, 페이지 테이블)
  - 열린 파일, 시그널, 권한 정보
  - 자원 사용량과 accounting 정보

<br>

#### PCB(Process Control Block)

> 프로세스나 스레드 관리에 필요한 커널 메타데이터를 담는 개념적 자료 구조

<img src="https://t1.daumcdn.net/cfile/tistory/25673A5058F211C224" width="400">

##### 다시 정리해보면?

```
프로그램 실행 -> 프로세스/스레드 생성 -> 주소 공간과 커널 자원 준비
-> 커널이 해당 실행 단위의 메타데이터를 PCB 계열 구조에 기록
```

##### PCB가 왜 필요한가요?

CPU는 한 번에 제한된 수의 태스크만 실행할 수 있다. 따라서 지금 멈춘 태스크를 나중에 다시 정확히 이어서 실행하려면, 현재 상태를 어딘가에 저장해야 한다.

PCB는 바로 그 정보를 담고 있어서 다음 일을 가능하게 한다.

- 스케줄러가 다음 실행 대상을 고르기
- blocked 태스크를 나중에 다시 깨우기
- 자원 사용량과 권한을 추적하기
- context switch 후 정확한 지점에서 실행을 재개하기

##### PCB는 어떻게 관리되나요?

"PCB를 단순 연결 리스트 하나로 관리한다"라고 외우면 부정확하다.

현대 커널은 목적에 따라 여러 자료 구조를 함께 사용한다.

- ready queue
- wait queue
- PID 테이블/해시
- 우선순위 큐나 트리
- 각종 리스트와 참조 카운트 구조

예를 들어 Linux에서는 PCB와 비슷한 대표 구조로 `task_struct`가 있으며, 메모리 정보(`mm_struct`)나 열린 파일 정보도 별도 구조와 연결된다.

<br>

#### Context Switching

> 현재 실행 중인 태스크의 CPU 문맥을 저장하고, 다음 태스크의 문맥을 복원해 실행을 전환하는 과정

보통 다음 상황에서 발생한다.

- 타임 슬라이스 만료
- 더 높은 우선순위 태스크가 runnable 상태가 됨
- 현재 태스크가 I/O나 lock을 기다리며 block됨
- 현재 태스크가 종료됨

`Ready -> Running`, `Running -> Ready`, `Running -> Waiting` 같은 전이는 대표적인 예시다.

> 참고
>
> 스레드 전환은 같은 프로세스 안에서 일어날 수도 있다. 이 경우 주소 공간은 그대로 두고 CPU 문맥만 주로 바꾸므로, 일반적인 프로세스 전환보다 더 가벼울 수 있다.

<br>

##### Context Switching의 Overhead

context switch가 느린 이유는 다음이 겹치기 때문이다.

- 레지스터 저장/복원
- 스케줄러 실행 비용
- 캐시/TLB/분기 예측기 지역성 손실
- 주소 공간 전환 비용(프로세스 전환인 경우)

즉, context switch는 CPU를 놀리지 않기 위해 필요한 작업이지만, 공짜는 아니다. 그래서 스케줄러는 응답성과 오버헤드 사이에서 균형을 맞춰야 한다.
