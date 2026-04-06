# CORS (Cross-Origin Resource Sharing)

CORS(교차 출처 리소스 공유)는 한 출처(Origin)에서 실행 중인 웹 애플리케이션이 다른 출처의 선택한 자원에 접근할 수 있는 권한을 부여하도록 브라우저에 알려주는 체제이다.
기본적으로 브라우저는 보안상의 이유로 스크립트에서 시작한 교차 출처 HTTP 요청을 제한하는 **SOP(Same-Origin Policy, 동일 출처 정책)**를 따른다. 다른 출처의 리소스를 안전하게 사용하려면 서버가 허용(CORS 헤더)해야만 한다.

## 1. 출처 (Origin)의 기준
출처는 **프로토콜(Scheme)**, **호스트(Host)**, **포트(Port)** 세 가지의 조합으로 정의된다. 이 중 하나라도 다르면 교차 출처(Cross-Origin)로 간주된다.
- 예: `https://example.com`에서 `http://example.com`으로 요청 (프로토콜 다름 -> Cross-Origin)
- 예: `https://example.com:8080`에서 `https://example.com:3000`으로 요청 (포트 다름 -> Cross-Origin)
- 예: `https://api.example.com`에서 `https://example.com`으로 요청 (호스트 다름 -> Cross-Origin)

## 2. CORS 동작 방식

브라우저는 교차 출처 요청을 처리할 때 주로 다음 두 가지 방식(단순 요청, 프리플라이트 요청)으로 동작한다.

### Simple Request (단순 요청)
예비 요청 없이 바로 본 요청을 서버로 보내는 방식이다.
- **조건**: 
  - `GET`, `HEAD`, `POST` 메서드 중 하나여야 한다.
  - 헤더는 `Accept`, `Accept-Language`, `Content-Language`, `Content-Type` 등 안전한 헤더만 사용 가능.
  - `Content-Type`은 `application/x-www-form-urlencoded`, `multipart/form-data`, `text/plain`만 허용.
- **동작**: 브라우저가 본 요청을 보냄 -> 서버가 응답에 `Access-Control-Allow-Origin`을 포함하여 응답 -> 브라우저가 헤더를 검사해 허용 여부 결정.

### Preflight Request (예비 요청)
단순 요청 조건에 부합하지 않는 요청(`PUT`, `DELETE`, `application/json` 등)을 보낼 때, 브라우저는 본 요청을 보내기 전에 예비 요청(Preflight)을 보내 서버가 이를 허용하는지 먼저 확인한다.
1. 브라우저가 `OPTIONS` 메서드로 예비 요청을 전송. (요청 헤더에 `Origin`, `Access-Control-Request-Method`, `Access-Control-Request-Headers` 포함)
2. 서버는 허용 여부를 담아 응답. (`Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`, `Access-Control-Max-Age` 등)
3. 브라우저가 서버의 응답을 확인하고 허용되었다면 본 요청을 서버로 전송.
4. 서버는 본 요청에 대한 실제 데이터를 응답.

### Credentialed Request (인증된 요청)
쿠키, 인증 헤더, TLS 클라이언트 인증서 등의 자격 증명(Credential)을 포함한 요청이다.
- 클라이언트는 `credentials: 'include'` 옵션을 설정해야 한다.
- 서버 응답 헤더에 `Access-Control-Allow-Credentials: true`가 있어야 하며, `Access-Control-Allow-Origin: *`를 사용할 수 없고 반드시 명시적인 URL이어야 한다.

## 3. 해결 및 설정 방법
CORS 에러는 **클라이언트(브라우저)가 아닌 서버에서 설정**해주어야 해결할 수 있다. 서버 애플리케이션 프레임워크(예: Spring, Node.js, Django) 또는 웹 서버(Nginx, Apache) 단에서 응답 헤더에 적절한 `Access-Control-Allow-*` 헤더를 추가하여 허용할 출처와 메서드 등을 명시해야 한다.
