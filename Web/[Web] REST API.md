### REST API

REST는 Roy Fielding의 논문에서 제시된 `아키텍처 스타일`이다.

실무에서 흔히 "REST API"라고 부르는 것은, 엄밀한 의미의 REST를 완벽히 만족한다기보다 `HTTP의 자원 중심 설계 원칙을 따른 API`를 뜻하는 경우가 많다.

<br>

#### 기본 요소

##### 1. Resource

- URI로 식별되는 자원
- 보통 명사 형태로 표현한다.

예)

- `/users`
- `/users/1`
- `/orders/42/items`

##### 2. Method

HTTP 메서드로 의도를 표현한다.

| Method | 대표 의미 | Safe | Idempotent |
| ------ | --------- | ---- | ---------- |
| GET    | 조회      | Yes  | Yes        |
| HEAD   | 헤더 조회 | Yes  | Yes        |
| POST   | 생성/처리 | No   | No         |
| PUT    | 전체 교체 | No   | Yes        |
| PATCH  | 부분 수정 | No   | 구현에 따라 다름 |
| DELETE | 삭제 요청 | No   | Yes        |

`Idempotent`는 같은 요청을 여러 번 보내도 서버에 기대하는 최종 상태가 같다는 뜻이다.

##### 3. Representation

자원의 실제 전송 형식이다.

JSON, XML, HTML 등이 가능하며, 오늘날에는 JSON이 가장 흔하다.

```http
POST /users HTTP/1.1
Content-Type: application/json

{
  "name": "terry"
}
```

<br>

#### REST의 주요 제약

##### Client-Server

클라이언트와 서버의 책임을 분리한다.

##### Stateless

각 요청은 그 자체로 이해 가능해야 하며, 서버는 이전 요청의 애플리케이션 상태에 강하게 의존하지 않아야 한다.

이는 "인증 정보를 절대 저장하지 않는다"는 뜻이 아니라, `요청 처리를 위해 필요한 상태를 요청 또는 외부 저장소를 통해 일관되게 다룬다`는 의미에 가깝다.

##### Cacheable

가능한 응답은 캐시 가능해야 한다.

##### Uniform Interface

자원을 URI로 식별하고, 표준 HTTP 의미를 일관되게 사용한다.

여기에 self-descriptive messages, representation 기반 조작, HATEOAS 같은 개념이 포함된다.

##### Layered System

프록시, 게이트웨이, 로드 밸런서 같은 중간 계층을 둘 수 있다.

##### Code on Demand

선택적 제약이다. 서버가 클라이언트에 실행 코드를 전달할 수 있다는 개념이다.

<br>

#### 자주 하는 오해

##### REST = HTTP + JSON 인가?

아니다.

HTTP와 JSON은 RESTful한 시스템을 만드는 데 자주 쓰이는 조합일 뿐이다.

##### 모든 HTTP API가 REST인가?

아니다.

URI와 메서드를 쓴다고 자동으로 REST가 되는 것은 아니다. 상태 관리, 캐시, 자원 표현, 일관된 인터페이스 같은 제약을 얼마나 지키는지가 중요하다.

<br>

#### 실무 팁

- URI에는 동사보다 명사를 우선한다.
- 상태 변경 작업은 safe method인 `GET`으로 만들지 않는다.
- 성공/실패를 HTTP 상태 코드로 표현하고, 응답 본문은 일관된 포맷으로 유지한다.
