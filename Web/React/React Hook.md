# React Hook

Hook은 함수형 컴포넌트에서 상태와 React 기능을 사용할 수 있게 해주는 API다.

클래스 컴포넌트를 완전히 금지하는 개념은 아니지만, 현재 React에서는 함수형 컴포넌트 + Hook이 기본 패턴에 가깝다.

<br>

### Hook 규칙

- Hook은 컴포넌트 최상위에서 호출한다.
- 반복문, 조건문, 중첩 함수 안에서 호출하지 않는다.
- React 함수 컴포넌트나 Custom Hook 안에서만 호출한다.

<br>

### useState

컴포넌트 내부 상태를 선언할 때 사용한다.

```jsx
const [count, setCount] = useState(0)
```

- `count`: 현재 상태 값
- `setCount`: 상태 변경 함수

상태를 바꿀 때는 기존 값을 직접 수정하는 대신 setter를 사용한다.

<br>

### useEffect

`useEffect`는 렌더링 결과를 기준으로 외부 시스템과 동기화할 때 사용한다.

예)

- 네트워크 요청 시작
- 이벤트 리스너 등록/해제
- 타이머 설정/정리
- DOM 외부 API 연동

```jsx
useEffect(() => {
  const id = setInterval(() => {
    console.log('tick')
  }, 1000)

  return () => clearInterval(id)
}, [])
```

#### dependency array

- 없음: 렌더링 후마다 실행
- `[]`: 마운트 시 한 번 실행되고, 언마운트 시 cleanup
- `[value]`: `value`가 바뀔 때만 다시 실행

#### 자주 하는 오해

`useEffect`를 "클래스의 componentDidMount + componentDidUpdate + componentWillUnmount 묶음"으로만 외우면 실전에서 오용하기 쉽다.

핵심은 `외부 시스템과 동기화가 필요한가?`다.

단순히 파생 가능한 값을 state에 다시 넣는 용도라면 effect가 필요 없는 경우가 많다.

<br>

### 요약

- `useState`는 상태 선언
- `useEffect`는 외부 시스템 동기화
- Hook은 함수형 컴포넌트 최상위에서만 호출
