# DNS (Domain Name System)

DNS는 사람이 읽기 쉬운 도메인 이름을 네트워크에서 사용할 수 있는 정보로 바꿔주는 `계층형 분산 이름 시스템`이다.

가장 흔한 예시는 도메인 이름을 IP 주소(`A`, `AAAA` 레코드)로 바꾸는 것이지만, DNS는 그 외에도 `CNAME`, `MX`, `TXT`, `NS` 같은 다양한 리소스 레코드(Resource Record)를 제공한다.

## 도메인 주소가 IP로 변환되는 과정

1. 애플리케이션은 먼저 로컬의 `stub resolver`에게 이름 해석을 요청한다.
   - 이 단계에서 `hosts` 파일이나 OS 캐시가 먼저 사용될 수 있다.

2. 로컬에 답이 없으면, stub resolver는 설정된 `recursive resolver`(예: 회사 DNS, ISP DNS, 공용 DNS)에 질의한다.

3. recursive resolver는 자신의 캐시를 확인한다.
   - 캐시에 있으면 TTL이 유효한 동안 바로 응답한다.

4. 캐시에 없으면 recursive resolver가 `root name server`부터 차례대로 질의한다.
   - Root는 보통 최종 IP를 주지 않고, 해당 TLD(`.com`, `.net`, `.kr`)를 담당하는 네임서버 정보로 `위임(delegation)`한다.

5. recursive resolver는 TLD 서버에 질의한다.
   - TLD 서버는 해당 도메인을 관리하는 `authoritative name server` 정보를 돌려준다.

6. recursive resolver는 authoritative name server에 질의해 최종 답을 얻는다.
   - 예: `A`, `AAAA`, `CNAME`

7. recursive resolver는 결과를 TTL에 따라 캐시하고, 클라이언트에게 응답한다.

## 용어 정리

- `Stub Resolver`: 애플리케이션 또는 OS에 붙어 있는 간단한 질의자
- `Recursive Resolver`: 최종 답을 대신 찾아오는 재귀 질의 서버
- `Authoritative Name Server`: 특정 zone에 대한 원본 데이터를 가진 서버
- `Zone`: 관리 권한 단위로 나뉜 DNS 데이터 영역

## DNS transport

- 전통적인 DNS 질의는 주로 `UDP/53`을 사용한다.
- 하지만 `TCP/53`도 여전히 중요하며, 오늘날의 일반적인 DNS 구현은 UDP와 TCP를 모두 지원해야 한다.
- `EDNS(0)`를 사용하면 UDP에서 512바이트보다 큰 메시지도 다룰 수 있다.
- 응답이 너무 크거나 잘린 경우(`TC` 비트), 또는 `AXFR/IXFR` 같은 zone transfer에는 TCP가 사용된다.

현대 환경에서는 다음과 같은 보호된 DNS 전송 방식도 있다.

- `DoT(DNS over TLS)` : 보통 853/TCP
- `DoH(DNS over HTTPS)` : 보통 443/TCP

추가로, `DNSSEC`은 응답의 무결성과 출처 인증을 강화하지만, 내용을 암호화해 주는 기술은 아니다.
