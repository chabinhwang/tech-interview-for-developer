## [TCP] 3 way handshake & 4 way handshake

> 연결을 성립하고 해제하는 과정을 말한다

<br>

### 3 way handshake - 연결 성립

TCP는 정확한 전송을 보장해야 한다. 따라서 통신하기에 앞서, 논리적인 접속을 성립하기 위해 3 way handshake 과정을 진행한다.

<img src="https://media.geeksforgeeks.org/wp-content/uploads/TCP-connection-1.png">

1) 클라이언트가 서버에게 SYN 패킷을 보냄 (sequence : x)

2) 서버가 SYN(x)을 받고, 클라이언트로 받았다는 신호인 ACK와 SYN 패킷을 보냄 (sequence : y, ACK : x + 1)

3) 클라이언트는 서버의 응답은 ACK(x+1)와 SYN(y) 패킷을 받고, ACK(y+1)를 서버로 보냄

<br>

이렇게 3번의 통신이 완료되면 연결이 성립된다. (3번이라 3 way handshake인 것)

<br>

<br>

### 4 way handshake - 연결 해제

연결 성립 후, 모든 통신이 끝났다면 해제해야 한다.

<img src="https://media.geeksforgeeks.org/wp-content/uploads/CN.png">

1) 클라이언트는 서버에게 연결을 종료한다는 FIN 플래그를 보낸다.

2) 서버는 FIN을 받고, 확인했다는 ACK를 클라이언트에게 보낸다. (이때 모든 데이터를 보내기 위해 CLOSE_WAIT 상태가 된다)

3) 데이터를 모두 보냈다면, 연결이 종료되었다는 FIN 플래그를 클라이언트에게 보낸다.

4) 클라이언트는 FIN을 받고, 확인했다는 ACK를 서버에게 보낸다. (TIME_WAIT 상태로 전환하여 서버가 ACK를 정상적으로 수신했는지 확인하고, 네트워크에 남아있는 지연된 패킷을 처리하기 위해 일정 시간 대기한다.)

- 서버는 ACK를 받은 이후 소켓을 닫는다 (Closed)

- TIME_WAIT 시간이 끝나면 클라이언트도 닫는다 (Closed)

<br>

이렇게 4번의 통신이 완료되면 연결이 해제된다.

<br>

**참고: TIME_WAIT 상태**
- 클라이언트는 마지막 ACK를 보낸 뒤 바로 연결을 종료하지 않고, TIME_WAIT 상태에서 2MSL(Maximum Segment Lifetime) 동안 대기한다.
- 이유: (1) 지연된 패킷이 도착할 경우를 대비, (2) 마지막 ACK가 유실되었을 때 서버의 FIN 재전송에 응답하기 위함

<br>

<br>

##### [참고 자료]

[링크](<https://www.geeksforgeeks.org/tcp-connection-termination/>)
