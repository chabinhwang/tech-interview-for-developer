## 로드 밸런싱(Load Balancing)

> 여러 서버 또는 컴퓨팅 자원에 트래픽과 작업을 분산하는 것

<br>

<img src="https://www.educative.io/api/collection/5668639101419520/5649050225344512/page/5747976207073280/image/5696459148099584.png">

요즘 시대에는 웹사이트에 접속하는 인원이 급격히 늘어나게 되었다.

따라서 이 사람들에 대해 모든 트래픽을 감당하기엔 1대의 서버로는 부족하다. 대응 방안으로 하드웨어의 성능을 올리거나(Scale-up) 여러대의 서버가 나눠서 일하도록 만드는 것(Scale-out)이 있다. 하드웨어 향상 비용이 더욱 비싸기도 하고, 서버가 여러대면 무중단 서비스를 제공하는 환경 구성이 용이하므로 Scale-out이 효과적이다. 이때 여러 서버에게 균등하게 트래픽을 분산시켜주는 것이 바로 **로드 밸런싱**이다.

<br>

**로드 밸런싱**은 여러 서버에 부하(Load)를 분산해 가용성과 확장성을 높이는 방식이다. 보통 클라이언트와 백엔드 서버 사이에 `Load Balancer`를 두고, 요청을 적절한 서버로 전달한다.

로드 밸런서는 보통 다음 기능도 함께 수행한다.

- 헬스 체크
- 장애 서버 제외
- SSL/TLS 종료(TLS termination)
- 세션 고정(Sticky Session)
- L4/L7 기반 라우팅

<br>

#### 로드 밸런서가 서버를 선택하는 방식

- 라운드 로빈(Round Robin) : CPU 스케줄링의 라운드 로빈 방식 활용
- Least Connections : 연결 개수가 가장 적은 서버 선택 (트래픽으로 인해 세션이 길어지는 경우 권장)
- Source IP Hash : 사용자 IP를 해싱하여 분배 (특정 사용자가 항상 같은 서버로 연결되도록 할 때 사용)
- Weighted 방식 : 서버 성능 차이를 반영해 가중치를 두고 분배

<br>

#### 로드 밸런서 장애 대비

로드 밸런서 자체가 단일 장애점(SPOF)이 될 수 있으므로 이중화가 필요하다.

- Active-Standby(Active-Passive)
- Active-Active

또한 DNS 기반 트래픽 분산, Anycast, 글로벌 로드 밸런싱(GSLB)처럼 더 넓은 범위의 분산 전략과 함께 사용되기도 한다.

<br>

##### [참고자료]

- [링크](<https://www.educative.io/courses/grokking-the-system-design-interview/3jEwl04BL7Q>)

- [링크](<https://nesoy.github.io/articles/2018-06/Load-Balancer>)
