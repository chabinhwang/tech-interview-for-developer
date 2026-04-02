# DB 트랜잭션(Transaction)

<br>

#### 트랜잭션이란?

> 데이터베이스를 일관된 상태로 조회/변경하기 위해 묶어서 실행하는 작업 단위

<br>

트랜잭션 안에서는 여러 SQL 문이 함께 실행될 수 있다.

- `SELECT`: 데이터를 조회
- `INSERT`, `UPDATE`, `DELETE`: 데이터를 변경

작업 단위 → **여러 SQL 명령문을 하나의 논리적 업무 단위로 묶는 것**

```
예시) 사용자 A가 사용자 B에게 만원을 송금한다.

* 이때 DB 작업
- 1. 사용자 A의 계좌에서 만원을 차감한다 : UPDATE 문을 사용해 사용자 A의 잔고를 변경
- 2. 사용자 B의 계좌에 만원을 추가한다 : UPDATE 문을 사용해 사용자 B의 잔고를 변경

현재 작업 단위 : 출금 UPDATE문 + 입금 UPDATE문
→ 이를 통틀어 하나의 트랜잭션이라고 한다.
- 위 두 쿼리문 모두 성공적으로 완료되어야만 "하나의 작업(트랜잭션)"이 완료되는 것이다. `Commit`
- 작업 단위에 속하는 쿼리 중 하나라도 실패하면 모든 쿼리문을 취소하고 이전 상태로 돌려놓아야한다. `Rollback`

```

<br>

**즉, 하나의 트랜잭션 설계를 잘 만드는 것이 데이터를 다룰 때 많은 이점을 가져다준다.**

<br>

#### 트랜잭션 특징

---

- 원자성(Atomicity)

  > 트랜잭션이 DB에 모두 반영되거나, 혹은 전혀 반영되지 않아야 된다.

- 일관성(Consistency)

  > 트랜잭션 전후에 데이터가 정의한 제약조건과 규칙을 만족해야 한다.

- 독립성(Isolation)

  > 동시에 실행되는 트랜잭션은 서로의 중간 상태를 부적절하게 관찰하거나 덮어쓰지 않아야 한다.

- 지속성(Durability)

  > 트랜잭션이 성공적으로 완료되었으면, 결과는 영구적으로 반영되어야 한다.

<br>

##### Commit

하나의 트랜잭션이 성공적으로 끝났고 DB가 일관성 있는 상태임을 확정하는 연산

<br>

##### Rollback

하나의 트랜잭션 처리가 비정상적으로 종료되어 트랜잭션 원자성이 깨진 경우

트랜잭션이 정상적으로 종료되지 않았을 때 마지막 일관된 상태(예: 트랜잭션 시작 전 상태)로 되돌릴 수 있다.

<br>

*상황이 주어지면 DB 측면에서 어떻게 해결할 수 있을지 대답할 수 있어야 함*

<br>

---

<br>

#### Transaction 관리를 위한 DBMS의 전략

이해를 위한 2가지 개념 : DBMS의 구조 / Buffer 관리 정책

<br>

1) DBMS의 구조

> 크게 2가지 : Query Processor (질의 처리기), Storage System (저장 시스템)
>
> 입출력 단위 : 고정 길이의 page 단위로 disk에 읽거나 쓴다.
>
> 저장 공간 : 비휘발성 저장 장치인 disk에 저장, 일부분을 Main Memory에 저장

<img src="https://d2.naver.com/content/images/2015/06/helloworld-407507-1.png">

<br>

2) Page Buffer Manager or Buffer Manager

DBMS의 Storage System에 속하는 모듈 중 하나로, Main Memory에 유지하는 페이지를 관리하는 모듈

> Buffer 관리 정책에 따라 UNDO 복구와 REDO 복구의 필요성이 달라지므로, 트랜잭션 관리에서 매우 중요하다.

<br>

3) UNDO

필요한 이유 : 수정된 Page가 **<u>Buffer 교체 알고리즘에 따라 트랜잭션 종료 전에도 디스크에 기록</u>**될 수 있다. Buffer 교체는 **<u>트랜잭션의 Commit/Rollback과 별개로 버퍼 상태에 따라 결정</u>**된다. 이 때문에 비정상 종료된 트랜잭션이 남긴 변경을 되돌려야 하며, 이 복구를 UNDO라고 한다.

- 2개의 정책 (수정된 페이지를 디스크에 쓰는 시점으로 분류)

  `steal` : 수정된 페이지를 언제든지 디스크에 쓸 수 있는 정책

  - 대부분의 DBMS가 채택하는 Buffer 관리 정책
  - UNDO logging과 복구를 필요로 함.

  <br>

  `no-steal` : 수정된 페이지를 EOT(End Of Transaction)까지 버퍼에 유지하는 정책

  - UNDO 작업이 필요하지 않지만, 매우 큰 메모리 버퍼가 필요함.

<br>

4) REDO

이미 commit한 트랜잭션의 수정을 재반영하는 복구 작업

Buffer 관리 정책에 영향을 받음

- 트랜잭션 종료 시점에 해당 트랜잭션이 수정한 페이지를 디스크에 쓸 것인가를 기준으로 나눈다.

  <br>

  `FORCE` : 수정했던 모든 페이지를 commit 시점에 disk에 반영

  트랜잭션이 commit 되었을 때 수정된 페이지가 disk에 반영되므로 REDO가 필요 없다.

  <br>

  `NO-FORCE` : commit 시점에 모든 수정 페이지를 반영하지 않는 정책

  트랜잭션이 commit 되었더라도 수정 페이지가 아직 disk에 반영되지 않았을 수 있으므로 REDO 복구가 필요하다. 대부분의 DBMS는 `steal + no-force` 조합과 WAL(Write-Ahead Logging)을 사용한다.

<br>

현대 MVCC DBMS에서는 UNDO/버전 정보가 읽기 일관성에도 활용된다. 예를 들어 Oracle과 MySQL InnoDB는 이전 버전을 undo 기반으로 재구성하고, PostgreSQL은 tuple version 자체를 보관해 스냅샷을 만든다. 즉, 복구와 동시성 제어가 함께 연결되어 있다.

<br>

#### [참고사항]

- [링크](https://d2.naver.com/helloworld/407507)
