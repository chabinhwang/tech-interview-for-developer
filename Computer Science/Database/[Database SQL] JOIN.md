## [Database SQL] JOIN

##### 조인이란?

> 두 개 이상의 테이블(또는 서브쿼리 결과 집합)을 연결해 원하는 데이터를 조회하는 방법

보통 공통된 키 값이나 조건을 기준으로 연결한다. 단, `CROSS JOIN`처럼 조건 없이 모든 조합을 만드는 경우도 있다.

<br>

#### JOIN 종류

---

- INNER JOIN
- LEFT OUTER JOIN
- RIGHT OUTER JOIN
- FULL OUTER JOIN
- CROSS JOIN
- SELF JOIN

<br>

<br>

- #### INNER JOIN

  <img src="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=http%3A%2F%2Fcfile9.uf.tistory.com%2Fimage%2F99799F3E5A8148D7036659">

  교집합으로, 기준 테이블과 join 테이블의 중복된 값을 보여준다.

  ```sql
  SELECT
  A.NAME, B.AGE
  FROM EX_TABLE A
  INNER JOIN JOIN_TABLE B ON A.NO_EMP = B.NO_EMP
  ```

  <br>

- #### LEFT OUTER JOIN

  <img src="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=http%3A%2F%2Fcfile6.uf.tistory.com%2Fimage%2F997E7F415A81490507F027">

  왼쪽(기준) 테이블의 모든 값을 포함하고, 오른쪽(조인) 테이블과 매칭되는 값을 함께 보여준다. 오른쪽 테이블에 매칭되는 값이 없으면 NULL로 채워진다.

  왼쪽테이블 기준으로 JOIN을 한다고 생각하면 편하다.

  ```SQL
  SELECT
  A.NAME, B.AGE
  FROM EX_TABLE A
  LEFT OUTER JOIN JOIN_TABLE B ON A.NO_EMP = B.NO_EMP
  ```

  <br>

- #### RIGHT OUTER JOIN

  <img src="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=http%3A%2F%2Fcfile25.uf.tistory.com%2Fimage%2F9984CE355A8149180ABD1D">

  LEFT OUTER JOIN과는 반대로 오른쪽 테이블 기준으로 JOIN하는 것이다.

  ```SQL
  SELECT
  A.NAME, B.AGE
  FROM EX_TABLE A
  RIGHT OUTER JOIN JOIN_TABLE B ON A.NO_EMP = B.NO_EMP
  ```

  <br>

- #### FULL OUTER JOIN

  <img src="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=http%3A%2F%2Fcfile24.uf.tistory.com%2Fimage%2F99195F345A8149391BE0C3">

  합집합에 해당한다. A와 B 테이블의 모든 행이 검색되며, 매칭되지 않는 쪽은 `NULL`로 채워진다.

  단, 일부 DBMS(예: MySQL)는 `FULL OUTER JOIN` 문법을 직접 지원하지 않아 `UNION` 등으로 대체해야 한다.

  ```sql
  SELECT
  A.NAME, B.AGE
  FROM EX_TABLE A
  FULL OUTER JOIN JOIN_TABLE B ON A.NO_EMP = B.NO_EMP
  ```

  <br>

- #### CROSS JOIN

  <img src="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=http%3A%2F%2Fcfile10.uf.tistory.com%2Fimage%2F993F4E445A8A2D281AC66B">

  모든 경우의 수를 전부 표현해주는 방식이다.

  A가 3개, B가 4개면 총 3*4 = 12개의 데이터가 검색된다.

  ```sql
  SELECT
  A.NAME, B.AGE
  FROM EX_TABLE A
  CROSS JOIN JOIN_TABLE B
  ```

  <br>

- #### SELF JOIN

  <img src="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=http%3A%2F%2Fcfile25.uf.tistory.com%2Fimage%2F99341D335A8A363D0614E8">

  자기 자신을 다시 조인하는 패턴이다.

  하나의 테이블에 서로 다른 alias를 붙여 관계를 표현할 때 자주 사용한다.

  자신이 갖고 있는 칼럼을 다양하게 변형시켜 활용할 때 자주 사용한다.

  ```sql
  SELECT
  A.NAME, B.AGE
  FROM EX_TABLE A
  JOIN EX_TABLE B ON A.MANAGER_NO = B.NO_EMP
  ```

  

<br>

<br>

##### [참고]

[링크](<https://coding-factory.tistory.com/87>)
