# CPU Scheduling

<br>

### 1. 스케줄링

> ready 상태의 실행 단위를 어떤 CPU에 언제 배정할지 결정하는 것

현대 운영체제에서 실제 스케줄링 단위는 "프로세스"보다 **스레드 또는 태스크(task)** 인 경우가 많다.

- 조건: 오버헤드 감소 / CPU 사용률 향상 / 기아 현상 감소 / 공정성 확보
- 목표
  1. `Batch System`: 처리량(throughput) 중시
  2. `Interactive System`: 빠른 응답 시간과 낮은 지연 시간 중시
  3. `Real-time System`: 마감 시간(deadline) 보장 중시

### 2. 선점 / 비선점 스케줄링

- 선점(preemptive): 운영체제가 실행 중인 태스크의 CPU를 빼앗을 수 있음
- 비선점(non-preemptive): 태스크가 스스로 CPU를 내놓거나 종료할 때까지 계속 실행

현대 범용 OS는 보통 선점형이다. 그래야 응답성을 유지하고, 긴 작업이 CPU를 독점하지 못하게 만들 수 있다.

### 3. 프로세스/스레드 상태

![download (5)](https://user-images.githubusercontent.com/13609011/91695344-f2dfae80-eba8-11ea-9a9b-702192316170.jpeg)

대표적인 상태는 다음과 같다.

- `New`: 생성됨
- `Ready` 또는 `Runnable`: 실행 가능한 상태로 CPU를 기다림
- `Running`: CPU에서 실행 중
- `Waiting` 또는 `Blocked`: I/O, lock, event 등을 기다림
- `Terminated`: 종료됨

---

**상태 전이**

✓ **Admitted**: 프로세스가 생성되어 시스템에 등록됨

✓ **Scheduler Dispatch**: ready queue에서 태스크를 골라 CPU에 올림

✓ **Preemption**: 타임 슬라이스 만료, 더 높은 우선순위 태스크의 등장, 스케줄링 정책 판단 등에 의해 running 태스크가 CPU를 양보함

✓ **I/O or Event Wait**: 실행 중인 태스크가 I/O나 이벤트를 기다리며 blocked 상태로 감

✓ **I/O or Event Completion**: I/O나 이벤트가 끝나 ready 상태로 돌아옴

✓ **Exit**: 태스크가 종료됨

> 참고
>
> 인터럽트가 발생했다고 해서 항상 현재 프로세스가 곧바로 ready 상태로 돌아가는 것은 아니다. 예를 들어 장치 인터럽트를 처리한 뒤 그대로 원래 태스크로 복귀할 수도 있고, 타이머 인터럽트처럼 스케줄링을 촉발하는 경우도 있다.

### 4. CPU 스케줄링의 종류

- 비선점 스케줄링
  1. FCFS (First Come First Served)
     - 먼저 도착한 작업을 먼저 실행
     - 구현은 단순하지만, 긴 작업이 앞에 오면 convoy effect가 발생할 수 있음
  2. SJF (Shortest Job First)
     - 예상 CPU burst가 가장 짧은 작업을 먼저 실행
     - 평균 대기 시간을 줄이는 데 유리
     - 선점 버전은 SRTF(Shortest Remaining Time First)
     - 실제 시스템에서는 다음 CPU burst를 정확히 알 수 없으므로 "예측 기반"의 이상적 모델에 가깝다
  3. HRN (Highest Response Ratio Next)
     - 우선순위 = `(대기시간 + 서비스시간) / 서비스시간`
     - SJF가 긴 작업을 계속 뒤로 미루는 문제를 완화

- 선점 스케줄링
  1. Priority Scheduling
     - 우선순위가 높은 태스크를 먼저 처리
     - 선점형과 비선점형 모두 가능
     - 낮은 우선순위 태스크가 무한히 기다리는 starvation이 생길 수 있음
     - aging으로 완화 가능
  2. Round Robin
     - 각 태스크에 같은 크기의 `Time Quantum`을 부여
     - quantum이 너무 크면 FCFS에 가까워지고, 너무 작으면 context switch 오버헤드가 커짐
  3. Multilevel Queue
     - 태스크를 성격별로 여러 큐로 나누고, 큐마다 다른 정책을 적용
     - 큐 사이 이동은 일반적으로 허용되지 않음
     - 상위 큐가 CPU를 독점하면 하위 큐 starvation이 생길 수 있어 별도 정책이 필요
  4. Multilevel Feedback Queue
     - 태스크가 여러 큐 사이를 이동할 수 있는 방식
     - CPU를 오래 쓰는 태스크는 아래 큐로 내려가고, 짧게 끝나거나 I/O 중심인 태스크는 높은 우선순위를 유지하도록 설계하는 경우가 많다
     - 실제 정책은 시스템마다 다르며, starvation 방지를 위해 주기적인 priority boost를 넣기도 한다

### 5. 현대 커널에서는?

교재의 FCFS, SJF, RR 같은 알고리즘은 핵심 개념 설명용이다. 실제 커널은 이를 그대로 하나만 쓰지 않는다.

- Linux는 일반 태스크에 대해 공정성 중심의 scheduler 계열(CFS에서 최근 EEVDF 방향으로 발전)을 사용한다.
- 실시간 태스크에는 `SCHED_FIFO`, `SCHED_RR`, `SCHED_DEADLINE`처럼 별도 정책을 둔다.

즉, 현대 커널 스케줄러는 "하나의 간단한 알고리즘"이라기보다 **우선순위, 공정성, 대화형 응답성, 실시간 요구를 함께 다루는 정책 집합**에 가깝다.

### 6. CPU 스케줄링 척도

1. Response Time
   - 작업이 도착한 뒤 처음 CPU를 배정받거나 첫 응답을 얻기까지 걸린 시간
2. Turnaround Time
   - 작업이 도착한 시점부터 완료될 때까지 걸린 전체 시간
3. Waiting Time
   - ready queue 등에서 CPU를 기다린 총 시간

---

### 출처

- 스케줄링 목표 : [링크](https://jhnyang.tistory.com/29?category=815411)
- 프로세스 전이도 그림 출처 : [링크](https://rebas.kr/852)
