# JWT (JSON Web Token)

JWT는 RFC 7519에 정의된 토큰 형식이다.

핵심은 "JSON 형태의 claim을 compact하고 URL-safe하게 전달하는 방법"이라는 점이다.

다만 JWT는 `로그인 방식`이나 `권한 위임 흐름` 자체를 정의하지 않는다. OAuth 2.0, OIDC 같은 흐름 안에서 access token 또는 ID token 형식으로 사용될 수 있다.

<br>

## 구조

실무에서 가장 흔한 JWT는 `서명된 JWT(JWS)`이며, 이 경우 아래처럼 3개 부분으로 이루어진다.

```text
header.payload.signature
```

각 부분은 `base64`가 아니라 `base64url`로 인코딩된다.

단, JWT가 `암호화된 JWT(JWE)`인 경우에는 5개 부분으로 표현된다. 따라서 "JWT는 항상 3부분"이라고 외우면 틀릴 수 있다.

<br>

### 1. Header

헤더에는 토큰 타입과 알고리즘 정보가 들어간다.

```json
{
  "typ": "JWT",
  "alg": "HS256"
}
```

- `typ`: 보통 `"JWT"`
- `alg`: 서명 또는 암호화에 사용되는 알고리즘

서버는 이 값을 그대로 신뢰하면 안 되고, 허용한 알고리즘만 검증해야 한다.

<br>

### 2. Payload

payload에는 claim이 들어간다.

대표적인 registered claim은 아래와 같다.

- `iss`: 발급자
- `sub`: 주제(subject)
- `aud`: 대상자(audience)
- `exp`: 만료 시각
- `nbf`: 이 시각 전에는 사용 불가
- `iat`: 발급 시각
- `jti`: 토큰 고유 ID

claim은 누구나 디코딩해 볼 수 있으므로, `서명`과 `가독성`은 별개라는 점을 기억해야 한다.

즉, 일반적인 JWT는 변조 방지는 가능하지만 `내용 숨김`은 하지 못한다.

<br>

### 3. Signature

signature는 header와 payload가 중간에 바뀌지 않았는지 검증하기 위해 사용한다.

예를 들어 HS256을 쓰면 개념적으로는 아래와 같은 방식이다.

```text
HMACSHA256(
  base64url(header) + "." + base64url(payload),
  secret
)
```

<br>

## JWT를 사용할 때 주의할 점

### 1. JWT는 기본적으로 암호화되지 않는다

서명된 JWT(JWS)는 payload를 숨기지 않는다.

민감한 개인정보를 토큰에 직접 넣는 것은 피하는 편이 안전하다.

### 2. Refresh Token은 반드시 JWT일 필요가 없다

실무에서 refresh token은 opaque token으로 두는 경우도 많다.

"Access Token + Refresh Token = 둘 다 JWT"라고 단정하면 틀릴 수 있다.

### 3. 서버 검증이 중요하다

JWT를 받았다고 끝이 아니다. 서버는 최소한 아래를 검증해야 한다.

- 서명 검증
- `alg` 허용 목록
- `iss`
- `aud`
- `exp`, `nbf`

필요하다면 토큰 폐기 목록, 키 회전(key rotation), refresh token 회전 전략도 함께 설계해야 한다.

<br>

## JWT의 장단점

### 장점

- claim을 토큰 자체에 담을 수 있다.
- 분산 시스템에서 토큰 검증이 비교적 단순해질 수 있다.
- 표준 형식이라 상호 운용성이 좋다.

### 단점

- 토큰이 커지기 쉽다.
- 발급 후 강제 무효화가 쉽지 않다.
- 잘못 설계하면 민감한 정보 노출, audience 혼동, 알고리즘 혼동 같은 보안 문제가 생길 수 있다.

<br>

## 요약

- JWT는 토큰 형식이다.
- 흔한 형태는 3부분 JWS지만, JWE는 5부분이다.
- 일반적인 JWT는 `서명`되어 있을 뿐 `암호화`되어 있지 않다.
- refresh token이 반드시 JWT인 것은 아니다.
