# [Spring] Bean Scope

Bean Scope는 Spring 컨테이너가 Bean 인스턴스를 어떤 범위와 생명주기로 관리할지 결정하는 설정이다.

기본값은 `singleton`이다.

<br>

### 주요 Scope

#### singleton

컨테이너당 하나의 인스턴스만 생성한다.

가장 기본적인 scope이며, 상태를 가지지 않는 서비스 객체에 많이 쓴다.

#### prototype

요청할 때마다 새 인스턴스를 만든다.

중요한 점은 prototype bean은 생성과 의존성 주입까지만 Spring이 관리하고, 그 이후 전체 라이프사이클 정리는 직접 책임져야 할 수 있다는 점이다.

#### request

HTTP 요청마다 하나의 인스턴스를 만든다.

#### session

HTTP 세션마다 하나의 인스턴스를 만든다.

#### application

`ServletContext` 범위로 하나의 인스턴스를 공유한다.

#### websocket

WebSocket 세션 범위로 하나의 인스턴스를 만든다.

<br>

### 참고

과거 문서에서 보이는 `globalSession`은 포틀릿 환경용 legacy scope라서, 일반적인 Spring MVC/Spring Boot 애플리케이션에서는 거의 쓰지 않는다.

<br>

### 예시

```java
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

@Component
@Scope("prototype")
public class UserController {
}
```

<br>

### 정리

- 기본은 `singleton`
- 상태 없는 공용 객체는 singleton
- 요청/세션별 상태가 필요하면 web scope
- `prototype`은 생성 이후 정리를 Spring이 끝까지 책임지지 않는다는 점을 기억해야 한다
