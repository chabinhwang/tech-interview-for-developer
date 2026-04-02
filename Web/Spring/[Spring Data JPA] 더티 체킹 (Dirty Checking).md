# [JPA] 더티 체킹 (Dirty Checking)

<br>

```
영속성 컨텍스트가 관리하는 엔티티의 변경을 감지해서
flush 시점에 SQL로 반영하는 동작
```

<br>

JPA에서 엔티티를 조회한 뒤 값을 바꾸고도 별도 `update` 메서드를 호출하지 않았는데 DB 반영이 되는 이유가 바로 더티 체킹이다.

```java
@Transactional
public void cancelOrder(Long orderId) {
    Order order = orderRepository.findById(orderId).orElseThrow();
    order.cancel();
}
```

위 코드에서 `order.cancel()`만 호출해도 트랜잭션이 끝날 때 update SQL이 나갈 수 있다.

<br>

### 동작 방식

1. 엔티티를 조회하면 영속성 컨텍스트가 관리한다.
2. JPA 구현체는 초기 상태를 기준으로 변경 여부를 추적한다.
3. `flush` 시점에 바뀐 내용을 감지한다.
4. 필요한 SQL을 생성해 DB에 반영한다.

여기서 핵심은 `영속 상태(managed)` 엔티티만 더티 체킹 대상이라는 점이다.

- 영속 상태: 자동 반영 가능
- 준영속(detached), 비영속(transient): 자동 반영되지 않음

<br>

### 주의할 점

#### 1. 더티 체킹은 JPA 구현체 동작에 의존한다

개념은 JPA 표준의 영속성 컨텍스트/flush 모델에 기반하지만, 실제 변경 감지 방식은 Hibernate 같은 구현체가 수행한다.

#### 2. `@DynamicUpdate`는 JPA 표준이 아니다

변경된 컬럼만 update하도록 하고 싶을 때 Hibernate의 `@DynamicUpdate`를 쓸 수 있다.

다만 이것은 `Hibernate 전용 기능`이며, 항상 성능상 이득이라고 단정할 수는 없다. SQL을 런타임에 동적으로 생성해야 하므로 상황에 따라 trade-off가 있다.

<br>

### 정리

- 더티 체킹은 영속 상태 엔티티의 변경을 자동으로 감지하는 기능이다.
- 실제 반영 시점은 보통 flush/commit 시점이다.
- `@DynamicUpdate`는 Hibernate 전용 옵션이므로 선택적으로 사용해야 한다.
