# [Network] Blocking/Non-blocking & Synchronous/Asynchronous

`Blocking/Non-blocking`과 `Synchronous/Asynchronous`는 서로 다른 축이다.

- `Blocking/Non-blocking`은 `호출 시점에 제어권이 언제 돌아오는가`
- `Synchronous/Asynchronous`는 `완료를 어떤 방식으로 확인하고 다음 단계를 이어가는가`

이 둘을 같은 개념으로 보면 I/O 모델이나 이벤트 처리 방식을 설명할 때 자주 헷갈리게 된다.

<br>

<img src="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fda50Yz%2Fbtq0Dsje4ZV%2FlGe8H8nZgdBdgFvo7IczS0%2Fimg.png">

<br>

## Blocking / Non-blocking

함수 A가 함수 B를 호출한다고 하자.

- **Blocking**: A가 B의 작업 결과가 준비될 때까지 반환되지 않는다. 즉, A는 그 자리에서 기다린다.
- **Non-blocking**: B가 아직 일을 끝내지 않았더라도 A에게 즉시 제어권을 돌려준다. A는 다른 일을 계속할 수 있다.

핵심은 `호출한 쪽이 바로 돌아오느냐, 기다리느냐`이다.

<br>

## Synchronous / Asynchronous

이번에는 `결과를 언제, 어떻게 소비하는가`를 보자.

- **Synchronous**: A가 B의 결과를 직접 확인한 뒤 다음 단계로 진행한다. 결과가 준비되었는지 기다리거나, 직접 다시 확인하는 흐름이 A 쪽에 있다.
- **Asynchronous**: A는 B를 호출한 뒤 자신의 일을 계속하고, B의 완료 시점은 callback, promise, future, event, message 등으로 나중에 전달받는다.

핵심은 `완료 통지와 결과 처리 책임이 어디에 있느냐`이다.

즉,

- `동기`는 결과를 호출한 쪽이 직접 맞춰가며 사용하고
- `비동기`는 완료 사실이 나중에 통지된다.

`비동기 = 무조건 non-blocking`, `동기 = 무조건 blocking`은 아니다. 실제로는 4가지 조합이 모두 가능하다.

<br>

## 네 가지 조합

```
상황: 치킨집에 직접 치킨을 사러 감
```

<br>

### 1) Blocking & Synchronous

```
나 : 치킨 한 마리 포장해주세요
사장님 : 금방 되니까 잠시만요
나 : 네
-- 치킨 조리 중 --
나 : (그 자리에서 기다리며 진행 상황도 신경씀)
```

- 자리를 떠나지 못하므로 `blocking`
- 결과를 내가 직접 기다리고 확인하므로 `synchronous`

<br>

### 2) Blocking & Asynchronous

```
나 : 치킨 한 마리 포장해주세요
사장님 : 금방 되니까 잠시만요
나 : 네
-- 치킨 조리 중 --
나 : (그 자리에서 기다리지만, 언제 끝나는지는 사장님이 알려주길 기다림)
```

- 자리를 떠나지 못하므로 `blocking`
- 완료 시점을 내가 계속 확인하지 않고 상대가 알려주므로 `asynchronous`

<br>

### 3) Non-blocking & Synchronous

```
나 : 치킨 한 마리 포장해주세요
사장님 : 시간 좀 걸리니 볼일 보시다 오세요
나 : 네
-- 치킨 조리 중 --
(5분 뒤) 나 : 제 거 나왔나요?
사장님 : 아직이요
(10분 뒤) 나 : 제 거 나왔나요?
사장님 : 아직이요
```

- 바로 다른 일을 하러 갈 수 있으므로 `non-blocking`
- 완료 여부를 내가 직접 반복 확인하므로 `synchronous`

<br>

### 4) Non-blocking & Asynchronous

```
나 : 치킨 한 마리 포장해주세요
사장님 : 시간 좀 걸리니 볼일 보시다 오세요
나 : 네
-- 치킨 조리 중 --
나 : (다른 일 하는 중)
...
사장님 : 치킨 나왔습니다
나 : 감사합니다
```

- 기다리지 않고 다른 일을 할 수 있으므로 `non-blocking`
- 완료 시점은 사장님이 알려주므로 `asynchronous`

<br>

#### 참고 사항

- [링크](http://homoefficio.github.io/2017/02/19/Blocking-NonBlocking-Synchronous-Asynchronous/)
- [링크](https://musma.github.io/2019/04/17/blocking-and-synchronous.html)
