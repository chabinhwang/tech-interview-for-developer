# Spring Security - Authentication and Authorization

<br>

Spring Security는 스프링 애플리케이션의 인증(authentication)과 인가(authorization)를 처리하는 보안 프레임워크다.

- `Authentication`: "누구인가?"
- `Authorization`: "무엇을 할 수 있는가?"

<br>

### 어디서 동작하나

Spring Security는 서블릿 필터 체인 기반으로 동작한다.

즉, `DispatcherServlet`에 도달하기 전에 보안 관련 필터들이 먼저 요청을 검사한다.

기본 구성에서는 `springSecurityFilterChain`이 핵심 진입점 역할을 한다.

<br>

### 자주 하는 오해

#### 인증 실패 시 항상 로그인 페이지로 리다이렉트되나?

아니다.

- 폼 로그인 기반 웹 애플리케이션이면 로그인 페이지로 리다이렉트할 수 있다.
- REST API라면 보통 `401 Unauthorized` 또는 `403 Forbidden` JSON 응답을 반환하도록 구성한다.

즉, 동작은 애플리케이션 설정에 따라 달라진다.

#### REST API면 CSRF를 무조건 꺼도 되나?

아니다.

Spring Security는 기본적으로 unsafe HTTP method에 대해 CSRF를 방어한다.

브라우저 기반 세션/쿠키 인증이라면 REST API라도 CSRF 고려가 필요하다.

반대로 `Authorization` 헤더의 bearer token만 사용하고 브라우저 쿠키 인증을 쓰지 않는 완전한 stateless API라면, 이유를 명확히 한 뒤 CSRF를 비활성화할 수 있다.

<br>

### 현대적인 설정 방식

예전에는 `WebSecurityConfigurerAdapter`를 자주 썼지만, 현재는 보통 `SecurityFilterChain` Bean으로 설정한다.

```java
@Bean
SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/public/**").permitAll()
            .anyRequest().authenticated()
        )
        .httpBasic(Customizer.withDefaults());

    return http.build();
}
```

<br>

### JWT 기반 API와의 관계

JWT를 쓴다고 Spring Security가 필요 없어지는 것은 아니다.

일반적인 구조는 아래와 같다.

1. 로그인 성공
2. 서버가 토큰 발급
3. 클라이언트가 이후 요청에 토큰 전달
4. Security filter가 토큰을 검증
5. 인증 정보를 `SecurityContext`에 넣음
6. 인가 규칙에 따라 접근 허용/거부

여기서 중요한 것은 "JWT를 발급했다"가 아니라, `필터에서 검증하고 SecurityContext를 올바르게 구성했는가`다.

<br>

### 정리

- Spring Security는 필터 체인 기반 보안 프레임워크다.
- 인증과 인가를 분리해서 이해해야 한다.
- REST API라고 해서 CSRF를 자동으로 무시하면 안 된다.
- 현재는 `SecurityFilterChain` 기반 구성이 표준에 가깝다.
