## [Spring Boot] SpringApplication

스프링 부트 애플리케이션은 보통 아래와 같은 진입 클래스로 시작한다.

```java
@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

}
```

<br>

### `@SpringBootApplication`

이 어노테이션은 아래 세 가지를 묶은 조합이다.

- `@SpringBootConfiguration`
- `@EnableAutoConfiguration`
- `@ComponentScan`

즉, 자동 설정을 활성화하고, 현재 패키지를 기준으로 컴포넌트 스캔을 시작한다.

그래서 보통 이 클래스를 `프로젝트 루트 패키지`에 두는 것을 권장한다.

다만 "반드시 프로젝트 최상단 파일 시스템 위치"에 있어야 하는 것은 아니다. 핵심은 `스캔 기준 패키지`를 어떻게 잡느냐이다.

<br>

### `SpringApplication.run()`

이 메서드는 Spring ApplicationContext를 만들고 애플리케이션을 시작한다.

웹 애플리케이션이면 내장 서버(Tomcat, Jetty, Undertow 중 선택)에 맞는 설정을 함께 띄운다.

내장 서버를 사용하면 외부 WAS 설치 없이 jar 실행만으로 애플리케이션을 구동하기 쉽다.

<br>

### 정리

- `@SpringBootApplication`은 자동 설정 + 컴포넌트 스캔의 시작점이다.
- 메인 클래스는 보통 루트 패키지에 두는 것이 권장된다.
- `SpringApplication.run()`은 컨텍스트를 만들고 필요하면 내장 웹 서버까지 함께 시작한다.
