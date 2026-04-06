# NAT (Network Address Translation)

NAT(Network Address Translation, 네트워크 주소 변환)는 IP 패킷의 TCP/UDP 포트 숫자와 소스 및 목적지의 IP 주소 등을 재기록하면서 라우터를 통해 네트워크 트래픽을 주고받는 기술이다. 주로 사설 네트워크(Private Network)에 속한 여러 개의 호스트가 하나의 공인 IP 주소(Public IP Address)를 사용하여 인터넷에 접속하기 위해 사용된다.

![](https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/NAT_Concept-en.svg/512px-NAT_Concept-en.svg.png)

## 1. NAT의 등장 배경과 목적
- **IPv4 주소 고갈 문제 해결**: IPv4 주소는 약 43억 개로 제한되어 있어 모든 기기에 공인 IP를 할당할 수 없다. NAT를 사용하면 내부에서는 사설 IP를 사용하고 외부로 나갈 때만 공인 IP로 변환하여 주소 부족 문제를 완화할 수 있다.
- **보안성 향상**: 외부(인터넷)에서는 내부 네트워크의 사설 IP 구조나 개별 호스트를 직접적으로 알 수 없다. 외부의 직접적인 접근을 원천적으로 차단하여 일종의 방화벽 역할을 수행한다.

## 2. NAT의 동작 방식
1. 내부 네트워크의 호스트가 외부로 패킷을 전송할 때, 라우터(NAT 장비)는 패킷의 **출발지 사설 IP**를 라우터의 **공인 IP**로 변환한다.
2. 동시에 각 연결을 구분하기 위해 패킷의 **출발지 포트 번호**도 함께 변경할 수 있다(NAPT).
3. 라우터는 이 변환 정보를 **NAT Table(NAT 매핑 테이블)**에 저장한다.
4. 외부에서 응답 패킷이 돌아오면, 라우터는 NAT Table을 확인하여 목적지 공인 IP와 포트를 원래의 사설 IP와 포트로 변환하여 내부 호스트에게 전달한다.

## 3. NAT의 종류
- **Static NAT (정적 NAT)**: 사설 IP와 공인 IP를 1:1로 고정하여 매핑한다. 주로 내부 서버(웹 서버 등)를 외부에 공개할 때 사용한다.
- **Dynamic NAT (동적 NAT)**: 여러 개의 사설 IP와 여러 개의 공인 IP(Pool)를 동적으로 매핑한다. 가용한 공인 IP가 모두 사용 중이면 다른 호스트는 대기해야 한다.
- **NAPT (Network Address Port Translation) / PAT**: 하나의 공인 IP를 여러 사설 IP가 공유한다. 포트 번호를 다르게 설정하여 각각의 세션을 구분한다. 가장 널리 쓰이며 일반적인 가정용 공유기(Router)에서 사용하는 방식이다.