### 페이지 교체 알고리즘

---

> 페이지 폴트가 발생했고 빈 프레임이 없을 때, 어떤 페이지를 내보낼지 결정하는 정책

<br>

가상 메모리는 보통 **요구 페이징(demand paging)** 으로 동작한다. 즉, 필요한 페이지가 실제로 참조될 때 메모리에 올린다.

문제는 메모리가 가득 찼을 때다. 새로운 페이지를 올리려면 기존 페이지 하나를 내보내야 하며, 이때 쫓겨나는 페이지를 **victim page**라고 한다.

페이지 교체 정책의 핵심 목표는 "앞으로 당장 다시 쓸 가능성이 낮은 페이지"를 고르는 것이다.

> 참고
>
> 더티(dirty) 페이지는 내보낼 때 디스크 기록이 필요할 수 있어 비용이 더 크다. 다만 "깨끗한 페이지를 고르는 것"은 비용 최적화 요소이고, 교체 알고리즘의 본질은 미래 재사용 가능성을 얼마나 잘 추정하느냐에 있다.

<br>

##### Page Reference String

페이지 참조 문자열은 **프로세스가 어떤 페이지 번호를 어떤 순서로 참조했는지**를 나열한 것이다.

즉, 페이지 교체 알고리즘을 비교할 때 쓰는 분석용 입력 모델이지, "페이지 폴트가 안 난 부분을 생략한 표기" 그 자체를 뜻하는 것은 아니다.

<br>

1. ##### FIFO 알고리즘

   > First-In, First-Out. 메모리에 가장 먼저 들어온 페이지를 가장 먼저 내보낸다.

   구현이 단순하지만, 오래 메모리에 있었다는 이유만으로 아직도 자주 쓰이는 페이지를 내보낼 수 있다.

   또한 **Belady의 anomaly**처럼 프레임 수를 늘렸는데도 오히려 페이지 폴트가 증가하는 현상이 나타날 수 있다.

   <img src="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory&fname=https%3A%2F%2Fk.kakaocdn.net%2Fdn%2FVQCGK%2FbtquJuqRkyS%2FLb3NgwHkBve08YhZpLkq31%2Fimg.png">

<br>

2. ##### OPT 알고리즘

   > Optimal Page Replacement. **앞으로 가장 나중에 다시 참조될 페이지**를 내보낸다.

   이론적으로 가장 적은 페이지 폴트를 만든다. 그래서 실제 구현용이라기보다 **비교 기준(lower bound)** 으로 많이 사용된다.

   미래 참조를 정확히 알아야 하므로 일반적인 운영체제가 그대로 구현할 수는 없다.

   <img src="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory&fname=https%3A%2F%2Fk.kakaocdn.net%2Fdn%2FSvRs7%2FbtquHbeJLQX%2FWXmK7xdGUbIxl43t0JG6Qk%2Fimg.png">

<br>

3. ##### LRU 알고리즘

   > Least Recently Used. 가장 오랫동안 참조되지 않은 페이지를 내보낸다.

   과거에 오래 안 쓰인 페이지는 가까운 미래에도 안 쓰일 가능성이 높다는 **지역성(locality)** 가정에 기반한다.

   OPT를 완전히 따라가지는 못하지만, 실제 구현 가능한 알고리즘 계열 중 매우 중요한 기준이 된다.

   다만 **정확한 LRU**를 유지하려면 모든 참조 시점을 추적해야 해서 비용이 크다. 그래서 실제 커널은 대개 LRU를 근사한 방식으로 구현한다.

   <img src="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory&fname=https%3A%2F%2Fk.kakaocdn.net%2Fdn%2FnCgc3%2FbtquGW9VUrm%2FxTKnVKPOVQuSXmAuRehSw1%2Fimg.png">

<br>

##### 교체 범위

- Global 교체

  > 시스템 전체의 프레임 집합에서 victim을 고른다.

- Local 교체

  > 특정 프로세스에 할당된 프레임 범위 안에서만 victim을 고른다.

Global 방식은 전체 메모리 활용률을 높이기 쉽지만, 한 프로세스의 압력이 다른 프로세스의 working set을 무너뜨릴 수도 있다. 반대로 Local 방식은 격리는 쉽지만 유휴 메모리를 덜 유연하게 활용할 수 있다.

즉, 어느 한쪽이 무조건 더 좋다고 단정할 수는 없고, 실제 시스템은 전역 reclaim에 cgroup, 우선순위, working-set 추정 같은 정책을 함께 사용한다.

<br>

##### 현대 커널에서는?

교재의 FIFO, OPT, LRU는 핵심 개념을 설명하기 위한 모델이다. 실제 커널은 페이지 접근 비트, active/inactive list, working-set 추정, multigenerational LRU 같은 **근사적 page reclaim 기법**을 사용한다.

즉, 현대 운영체제의 페이지 교체는 "정확한 한 가지 알고리즘"보다는 여러 힌트를 조합한 메모리 회수 정책에 가깝다.
