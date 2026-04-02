### TCP (흐름제어/혼잡제어)

---

#### 들어가기 전

- TCP 통신이란?
  - IP 위에서 동작하는 `연결 지향(connection-oriented)` 전송 계층 프로토콜
  - `신뢰성 있는 바이트 스트림(byte stream)` 전송을 제공
  - sequence number, ACK, 재전송, checksum, 흐름 제어, 혼잡 제어를 통해 안정적으로 데이터를 전달
- unreliable network 환경에서는 4가지 문제점 존재
  - 손실: packet이 유실될 수 있음
  - 순서 바뀜: packet 도착 순서가 바뀔 수 있음
  - 중복: 같은 데이터가 여러 번 전달될 수 있음
  - 혼잡/과부하: 네트워크 또는 수신 측이 감당 가능한 양을 넘길 수 있음
- 흐름제어/혼잡제어란?
  - 흐름제어 (endsystem 대 endsystem)
    - 송신측이 수신측 버퍼 용량을 초과하지 않도록 조절하는 것
    - 수신측이 sender에게 현재 받을 수 있는 양(`rwnd`, receive window)을 광고한다
  - 혼잡제어
    - 송신측이 네트워크 혼잡 상태를 고려해 전송 속도를 조절하는 것
    - 대표적으로 `cwnd`(congestion window)를 사용한다
- 전송의 전체 과정
  - 애플리케이션이 소켓에 데이터를 쓰면 TCP는 이를 바이트 스트림으로 다루고 세그먼트로 나누어 전송한다.
  - 수신 측 TCP는 세그먼트를 재조립하고, 순서를 맞춘 뒤 애플리케이션에 전달한다.
  - 이때 송신 측이 아무 제한 없이 보내면 수신 버퍼가 넘치거나 네트워크가 혼잡해질 수 있으므로 `흐름 제어`와 `혼잡 제어`가 필요하다.

#### 1. 흐름제어 (Flow Control)

- 수신측이 처리 가능한 속도보다 송신측이 너무 빨리 보내면 수신 버퍼가 넘칠 수 있다.
- 이를 막기 위해 수신측은 현재 더 받을 수 있는 양을 `advertised receive window(rwnd)`로 알려준다.

TCP의 송신 측은 일반적으로 다음 한도를 넘지 않도록 보낸다.

`실제 송신 가능량 = min(rwnd, cwnd)`

즉,

- `rwnd`: 수신 측이 버틸 수 있는 양
- `cwnd`: 네트워크가 버틸 수 있다고 송신 측이 추정한 양

##### Sliding Window

TCP는 `Stop-and-Wait`가 아니라 `Sliding Window`를 사용한다.

- ACK를 매 세그먼트마다 기다리지 않고 여러 바이트를 연속으로 보낼 수 있다.
- ACK가 도착하면 윈도우가 앞으로 이동(slide)한다.
- 송신 측은 아직 ACK되지 않은 바이트 수를 기준으로 추가 전송 가능 여부를 판단한다.

개념적으로는 다음과 같이 볼 수 있다.

`SND.NXT - SND.UNA <= usable window`

- `SND.NXT`: 다음에 보낼 시퀀스 번호
- `SND.UNA`: 아직 ACK되지 않은 가장 오래된 시퀀스 번호

##### ACK와 손실 복구

- 기본 ACK는 `cumulative ACK`다.
  - 예: ACK 1000은 `999번 바이트까지는 잘 받았다`는 의미
- 현대 TCP는 필요하면 `SACK(Selective Acknowledgment)` 옵션으로 `어느 구간을 받았고, 어느 구간이 비었는지` 더 정확히 알려줄 수 있다.

##### Window Scale

TCP 헤더의 기본 window field는 16비트라서 최대 65,535바이트만 직접 표현할 수 있다.

- 대역폭이 큰 환경에서는 이 크기가 너무 작을 수 있다.
- 그래서 `Window Scale` 옵션을 3-way handshake에서 협상해 더 큰 수신 윈도우를 사용할 수 있다.

##### 정리

- 흐름 제어의 핵심은 `수신 측 보호`
- TCP의 실제 구현은 `sliding window + advertised receive window` 방식
- handshake는 `send window를 receive window에 맞춘다`기보다, `MSS/Window Scale/SACK Permitted` 같은 옵션을 협상하는 과정이다

<br>

#### 2. 혼잡제어 (Congestion Control)

- 흐름 제어가 `수신 측 보호`라면, 혼잡 제어는 `네트워크 보호`다.
- 라우터나 링크가 감당 가능한 양을 넘으면 큐가 차고, 손실과 지연이 늘어나며, 재전송 때문에 상황이 더 나빠질 수 있다.

송신 측은 이를 피하기 위해 `congestion window(cwnd)`를 조절한다.

##### 대표 개념

- **Slow Start**
  - 시작 시 `cwnd`를 작게 두고, ACK를 받으면서 빠르게 키운다.
  - 일반적으로 RTT마다 거의 2배에 가깝게 증가한다.

- **Congestion Avoidance**
  - `ssthresh` 이후에는 급격히 늘리지 않고 완만하게 증가시킨다.
  - 고전적인 설명은 `AIMD(Additive Increase / Multiplicative Decrease)`다.

- **Fast Retransmit**
  - 보통 `중복 ACK 3개`를 손실 신호로 보고 타임아웃을 기다리지 않고 재전송한다.

- **Fast Recovery**
  - 손실이 감지되었을 때 매번 처음부터 다시 시작하지 않고, 구현에 따라 `cwnd`를 줄인 뒤 회복을 시도한다.

- **ECN(Explicit Congestion Notification)**
  - 손실이 나기 전에 네트워크가 혼잡 신호를 표시할 수 있다.
  - 지원되는 경우, 패킷 손실 없이도 혼잡을 감지할 수 있다.

##### 현대 TCP에서 주의할 점

- 교과서에는 `Tahoe`, `Reno`, `AIMD` 중심으로 많이 설명된다.
- 실제 운영체제는 `CUBIC`, `BBR` 등 다양한 혼잡 제어 알고리즘을 사용할 수 있다.
- 하지만 공통 목표는 같다.
  - 네트워크를 과도하게 밀어붙이지 않기
  - 가능한 한 높은 처리량 유지하기
  - 다른 흐름과 어느 정도 공정하게 공존하기

<br>

[ref]<br>

- RFC 9293
- RFC 5681
- RFC 7323
- RFC 2018
- RFC 6675
- RFC 8312
