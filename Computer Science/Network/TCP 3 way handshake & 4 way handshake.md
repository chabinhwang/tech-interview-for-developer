## [TCP] 3 way handshake & 4 way handshake

> 연결을 성립하고 해제하는 과정을 말한다

<br>

### 3 way handshake - 연결 성립

TCP는 연결 지향 프로토콜이므로 통신 전에 `3 way handshake`로 연결을 성립한다.

이 과정의 목적은 단순히 "연결 시작"만이 아니다.

- 양 끝이 서로 도달 가능한지 확인
- 초기 sequence number를 동기화
- MSS, Window Scale, SACK Permitted, Timestamp 같은 TCP 옵션 협상

<img src="https://media.geeksforgeeks.org/wp-content/uploads/TCP-connection-1.png">

1) 클라이언트가 서버에게 SYN 패킷을 보냄 (sequence : x)

2) 서버가 SYN(x)을 받고, 클라이언트로 받았다는 신호인 ACK와 SYN 패킷을 보냄 (sequence : y, ACK : x + 1)

3) 클라이언트는 서버의 응답은 ACK(x+1)와 SYN(y) 패킷을 받고, ACK(y+1)를 서버로 보냄

<br>

이렇게 3번의 통신이 완료되면 연결이 성립된다. (3번이라 3 way handshake인 것)

<br>

<br>

### 4 way handshake - 연결 해제

TCP는 양방향(full-duplex) 통신이므로, 연결 해제도 각 방향이 독립적으로 종료된다. 그래서 보통 `4 way handshake`가 된다.

<img src="https://media.geeksforgeeks.org/wp-content/uploads/CN.png">

1) 먼저 종료를 시작한 쪽(active closer)이 상대에게 `FIN`을 보낸다.

2) 상대는 이를 확인하는 `ACK`를 보낸다. 이때 상대는 남은 데이터를 더 보낼 수 있다. (예: `CLOSE_WAIT`)

3) 상대도 자신의 전송을 마치면 `FIN`을 보낸다.

4) active closer는 마지막 `ACK`를 보내고 `TIME_WAIT` 상태로 들어간다.

- 상대는 마지막 ACK를 받은 뒤 `CLOSED`로 간다.

- `TIME_WAIT` 시간이 끝나면 active closer도 `CLOSED`가 된다.

<br>

이렇게 4번의 통신이 완료되면 연결이 해제된다.

<br>

**참고: TIME_WAIT 상태**
- 마지막 ACK를 보낸 쪽은 바로 연결을 완전히 닫지 않고 `TIME_WAIT` 상태에서 일정 시간 대기한다.
- 흔히 `2MSL`이라고 설명하지만, 실제 대기 시간은 구현체마다 다를 수 있다.
- 이유:
  - 지연된 이전 세그먼트가 뒤늦게 도착하는 상황 방지
  - 마지막 ACK가 유실되었을 때 상대의 FIN 재전송에 다시 ACK로 응답하기 위함

<br>

**참고: 예외 상황**

- 경우에 따라 `RST`로 즉시 연결을 끊을 수 있다.
- 양쪽이 거의 동시에 `FIN`을 보내는 simultaneous close도 가능하다.
- `TIME_WAIT`에 들어가는 쪽은 항상 "클라이언트"가 아니라, `마지막 ACK를 보낸 active closer`이다.

<br>

<br>

##### [참고 자료]

[링크](<https://www.geeksforgeeks.org/tcp-connection-termination/>)
