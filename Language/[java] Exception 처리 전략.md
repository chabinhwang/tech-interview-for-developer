# Java Exception (예외 처리 전략)

자바에서는 프로그램 실행 중 비정상적인 상황(에러)을 처리하기 위해 **예외(Exception)** 객체를 사용한다.
최상위 예외 클래스인 `Throwable` 아래에는 시스템 레벨의 심각한 오류인 `Error`와 개발자가 애플리케이션에서 처리 가능한 `Exception` 두 종류로 나뉜다.

## 1. Exception의 종류

### Checked Exception (컴파일 예외)
*   **특징:** 컴파일 단계에서 강제로 예외 처리(try-catch 또는 throws)를 요구한다. 주로 프로그램 외부 환경(파일 입출력, DB, 네트워크)과 상호작용할 때 발생한다.
*   **대표 예:** `IOException`, `SQLException`
*   **트랜잭션 기본 롤백:** Checked Exception은 스프링(Spring) 프레임워크의 `@Transactional` 어노테이션 기본 설정 상 **롤백(Rollback) 대상이 아니다.**

### Unchecked Exception (런타임 예외)
*   **특징:** `RuntimeException`을 상속받는 예외 클래스들이다. 실행(Runtime) 단계에서 발생할 수 있는 프로그램 논리적 오류(버그)로, 컴파일러가 예외 처리를 강제하지 않는다.
*   **대표 예:** `NullPointerException(NPE)`, `IllegalArgumentException`, `IndexOutOfBoundsException`
*   **트랜잭션 기본 롤백:** Unchecked Exception은 스프링(Spring)에서 기본적으로 **트랜잭션을 롤백(Rollback) 시킨다.**

## 2. 효과적인 예외 처리 전략

백엔드 실무에서는 다음과 같은 전략을 주로 혼합하여 사용한다.

*   **예외 복구 (Exception Recovery):** 가장 이상적인 방법이다. 네트워크 통신 실패 시 재시도(Retry)를 하거나, 기본(Default) 값을 반환하는 등 발생한 예외 상황을 파악하고 정상 상태로 돌려놓는 전략이다.
*   **예외 회피 (Exception Evasion):** 예외 처리를 직접 하지 않고, 자신을 호출한 상위 메서드로 던져버리는(`throws`) 전략이다. 무책임하게 계속 회피하는 것이 아니라, 호출한 쪽에서 처리하는 것이 맞다고 판단될 때만 사용해야 한다.
*   **예외 전환 (Exception Translation):**
    1.  발생한 예외(예: `SQLException`)를 호출하는 쪽에 더 명확한 의미(예: `DuplicateUserIdException`)를 전달할 수 있도록 적절한 예외로 바꾸어 던지는 전략.
    2.  `Checked Exception`을 처리할 수 없는 상황에서, 이를 강제하지 않는 `Unchecked Exception` (런타임 예외)으로 래핑(Wrapping)하여 던짐으로써 불필요한 `throws` 선언을 줄이는 용도로도 많이 쓰인다.

> 백엔드 개발에서는 주로 복구 불가능한 예외(Checked Exception 포함)를 런타임 예외로 **전환**하고, 전역 예외 처리기(Global Exception Handler, 예: 스프링의 `@RestControllerAdvice`)에서 일괄적으로 로깅 및 클라이언트 응답 처리를 수행하는 패턴을 권장한다.
