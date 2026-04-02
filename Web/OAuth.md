## OAuth

> Open Authorization

OAuth 2.0은 사용자의 비밀번호를 클라이언트 애플리케이션에 직접 넘기지 않고, 제한된 권한을 위임할 수 있게 하는 표준 프레임워크다.

즉, 핵심 목적은 `인증(authentication)` 자체보다 `인가(authorization)`에 있다.

<br>

### 핵심 역할

- `Resource Owner`: 보호된 자원의 소유자. 보통 사용자다.
- `Client`: 사용자를 대신해 권한을 요청하는 애플리케이션이다.
- `Authorization Server`: 사용자 로그인, 동의, 토큰 발급을 담당한다.
- `Resource Server`: 실제 API와 데이터를 제공한다.

인가 서버와 리소스 서버는 같은 시스템일 수도, 분리된 시스템일 수도 있다.

<br>

### 토큰

- `Access Token`: 리소스 서버 호출에 사용한다.
- `Refresh Token`: 만료된 access token을 재발급받는 데 사용한다.

중요한 점은 refresh token은 보통 `인가 서버`에만 보내고, `리소스 서버`에는 보내지 않는다는 것이다.

또한 access token의 형식은 OAuth가 규정하지 않는다. JWT일 수도 있고, opaque token일 수도 있다.

<br>

### 현재 권장되는 흐름

실무에서 브라우저 앱, 모바일 앱, 데스크톱 앱 같은 `public client`는 보통 `Authorization Code Grant + PKCE`를 사용한다.

1. 클라이언트가 사용자를 인가 서버의 authorization endpoint로 보낸다.
2. 사용자가 로그인하고, 앱이 요청한 scope에 동의한다.
3. 인가 서버가 클라이언트의 redirect URI로 `authorization code`를 돌려준다.
4. 클라이언트가 code와 `code_verifier`를 token endpoint로 보내 access token을 발급받는다.
5. 클라이언트는 access token으로 resource server를 호출한다.
6. access token이 만료되면 refresh token으로 새 access token을 받을 수 있다.

PKCE는 authorization code 탈취 위험을 줄이기 위한 확장이다.

<br>

### 자주 헷갈리는 점

#### 1. OAuth는 로그인 표준인가?

정확히는 아니다. OAuth는 권한 위임 표준이다.

소셜 로그인처럼 "누구인지"까지 표준화해서 받고 싶다면 `OpenID Connect (OIDC)`를 OAuth 2.0 위에 올려서 사용한다.

#### 2. OAuth 2.0에도 Request Token이 있나?

아니다. `Request Token -> Access Token` 흐름은 OAuth 1.0에서 보던 개념이다.

OAuth 2.0의 대표 흐름은 `Authorization Code -> Access Token`이다.

#### 3. Implicit Grant는 아직 추천되나?

새 시스템에서는 일반적으로 추천되지 않는다.

현재는 브라우저 기반 앱도 보통 `Authorization Code + PKCE`를 사용한다.

<br>

### 요약

- OAuth 2.0은 제3자 앱에 권한을 위임하는 표준이다.
- 비밀번호 대신 토큰 기반으로 접근 권한을 전달한다.
- 현대적인 기본 선택은 `Authorization Code + PKCE`다.
- 로그인/사용자 식별이 목적이면 `OIDC`까지 함께 이해해야 한다.
