## 트랜잭션 격리 수준(Transaction Isolation Level)

<br>

#### **Isolation level** 

---

동시에 실행되는 트랜잭션 사이에서 어느 정도까지 일관성과 동시성을 보장할지 정하는 기준

<br>

#### Isolation level의 필요성

----

데이터베이스는 ACID의 `I(Isolation)`를 지키기 위해 동시에 실행되는 트랜잭션 간 충돌을 제어해야 한다.

이때 구현 방식은 DBMS마다 다르다.

- 전통적인 방식은 잠금(Lock) 중심으로 읽기/쓰기를 제어한다.
- 현대 RDBMS는 MVCC(Multi-Version Concurrency Control)를 사용해 **일반적인 읽기(`SELECT`)를 이전 버전 스냅샷으로 처리**하는 경우가 많다.

즉, Isolation Level은 단순히 "Shared Lock을 얼마나 오래 거느냐"로만 설명하면 부정확하다. 같은 `READ COMMITTED`라도 Oracle, PostgreSQL, InnoDB는 MVCC 스냅샷을 주로 사용하고, SQL Server는 설정에 따라 Shared Lock 기반 또는 row versioning 기반으로 동작한다.

<br>

#### Isolation level 종류

----

1. ##### Read Uncommitted (레벨 0)

   커밋되지 않은 변경을 다른 트랜잭션이 읽을 수 있도록 허용하는 가장 낮은 수준

   즉, Dirty Read가 가능하다.

   ```
   사용자1이 A라는 데이터를 B라는 데이터로 변경하는 동안 사용자2는 아직 완료되지 않은(Uncommitted) 트랜잭션이지만 데이터B를 읽을 수 있다
   ```

   다만 모든 DBMS가 이를 그대로 구현하지는 않는다. 예를 들어 PostgreSQL은 MVCC 구조상 `READ UNCOMMITTED` 요청을 사실상 `READ COMMITTED`처럼 처리한다.

   <br>

2. ##### Read Committed (레벨 1)

   커밋이 완료된 데이터만 읽을 수 있는 수준

   Dirty Read는 방지되지만, 같은 트랜잭션 안에서 같은 쿼리를 두 번 실행했을 때 결과가 달라질 수 있다.

   현대 MVCC 엔진에서는 보통 일반 `SELECT`가 Shared Lock을 오래 잡지 않는다.

   - Oracle: undo 데이터를 사용해 **문장(statement) 시작 시점의 스냅샷**을 읽는다.
   - PostgreSQL: 쿼리 시작 시점 기준의 MVCC 스냅샷을 읽는다.
   - MySQL InnoDB: 각 consistent read가 **매번 새로운 snapshot**을 만든다.
   - SQL Server: 기본 설정에서는 Shared Lock 기반 `READ COMMITTED`를 사용하지만, `READ_COMMITTED_SNAPSHOT`을 켜면 row versioning 기반으로 동작한다.

   즉, `READ COMMITTED = SELECT 동안 Shared Lock`이라고 일반화하면 틀릴 수 있다.

   Oracle, PostgreSQL, SQL Server 등 다수의 RDBMS에서 기본값으로 쓰인다. 단, MySQL InnoDB의 기본값은 `REPEATABLE READ`다.

   ```
   사용자1이 A를 B로 변경 중일 때 사용자2의 일반 SELECT는
   대개 "가장 최근에 commit된 버전" 또는 "쿼리 시작 시점의 스냅샷"을 읽는다.
   단, UPDATE / DELETE / SELECT ... FOR UPDATE 같은 locking read는 별도로 잠금을 사용한다.
   ```

   <br>

3. ##### Repeatable Read (레벨 2)

   같은 트랜잭션 안에서 같은 조건으로 읽은 결과를 다시 읽었을 때, 이미 읽은 행(row)의 값이 바뀌지 않도록 보장하는 수준

   MVCC 엔진에서는 보통 **트랜잭션 단위의 스냅샷**을 사용한다.

   - PostgreSQL: 트랜잭션 시작 시점의 스냅샷을 사용하며, 표준보다 강하게 Phantom Read도 막는다.
   - MySQL InnoDB: 첫 consistent read 시점의 snapshot을 이후 plain `SELECT`가 계속 사용한다.

   하지만 이것이 "모든 SELECT에 Shared Lock을 트랜잭션 끝까지 건다"는 뜻은 아니다. 일반 조회는 잠금 없이 snapshot을 읽고, 쓰기 충돌이나 locking read에서만 잠금이 개입하는 경우가 많다.

   또한 `REPEATABLE READ`는 여전히 `SERIALIZABLE`보다 약하다. 엔진에 따라 write skew 같은 직렬화 이상(serialization anomaly)은 남을 수 있다.

   MySQL에서 Default로 사용하는 Isolation Level

   <br>

4. ##### Serializable (레벨 3)

   결과가 **직렬 실행(serial execution)** 한 것과 같도록 보장하는 가장 높은 수준

   Phantom Read를 포함한 동시성 이상을 방지하지만 비용이 가장 크다.

   구현은 DBMS마다 다르다.

   - 잠금 기반 엔진은 범위 잠금(range lock, predicate lock)을 사용할 수 있다.
   - PostgreSQL은 Serializable Snapshot Isolation(SSI)로 직렬화 이상을 감지하고 충돌 시 한 트랜잭션을 롤백한다.
   - MySQL InnoDB는 locking read에서 next-key lock을 적극적으로 사용한다.

   따라서 `SERIALIZABLE = 무조건 Shared Lock + Range Lock`도 모든 DBMS에 공통된 설명은 아니다.

   <br>

<br>

***선택 시 고려사항***

Isolation Level 조정은 동시성과 데이터 무결성의 균형을 정하는 일이다.

동시성을 높이면 이상 현상이 늘어날 수 있고, 무결성을 강하게 보장하면 잠금/재시도/충돌 비용이 커진다.

레벨을 높일수록 대기, 잠금 경합, 롤백 재시도 비용이 증가할 수 있다.

<br>

##### 낮은 단계 Isolation Level을 활용할 때 발생하는 현상들

- Dirty Read

  > 커밋되지 않은 데이터를 다른 트랜잭션이 읽는 현상
  >
  > 이후 원래 트랜잭션이 Rollback되면 읽은 값이 실제로 존재하지 않았던 값이 될 수 있다.
  - 발생 Level: `READ UNCOMMITTED` (단, PostgreSQL처럼 실제 Dirty Read를 허용하지 않는 엔진도 있음)

- Non-Repeatable Read

  > 한 트랜잭션에서 같은 row를 두 번 읽었을 때, 그 사이 다른 트랜잭션이 commit하여 결과가 달라지는 현상
  - 발생 Level: `READ COMMITTED`, `READ UNCOMMITTED`

- Phantom Read

  > 한 트랜잭션 안에서 같은 조건의 범위 조회를 두 번 했을 때, 중간에 다른 트랜잭션이 삽입/삭제한 행 때문에 결과 집합 자체가 달라지는 현상
  >
  > 트랜잭션 도중 새로운 레코드 삽입을 허용하기 때문에 나타나는 현상임
  - 발생 Level: `READ UNCOMMITTED`, `READ COMMITTED`, `REPEATABLE READ` (표준 SQL 기준)
  - 단, 실제 구현은 DBMS마다 다르다. PostgreSQL의 `REPEATABLE READ`는 Phantom Read를 막고, InnoDB도 snapshot read와 next-key lock으로 표준보다 강한 동작을 제공할 수 있다.

- Serialization Anomaly

  > 각 트랜잭션을 따로 보면 문제 없어 보이지만, 동시에 commit된 결과를 전체적으로 보면 어떤 직렬 실행 순서로도 설명할 수 없는 현상
  - `SERIALIZABLE`만이 이를 막는다.


