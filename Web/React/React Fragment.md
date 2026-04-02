# [React] Fragment

React 컴포넌트는 여러 형제 요소를 반환할 수 있지만, JSX에서 불필요한 래퍼 DOM을 만들고 싶지 않을 때 `Fragment`를 사용한다.

예를 들어 `<td>` 여러 개를 반환해야 하는 컴포넌트에서 `<div>`로 감싸면 잘못된 테이블 구조가 된다.

```jsx
function Columns() {
  return (
    <React.Fragment>
      <td>Hello</td>
      <td>World</td>
    </React.Fragment>
  )
}
```

또는 짧은 문법도 가능하다.

```jsx
function Columns() {
  return (
    <>
      <td>Hello</td>
      <td>World</td>
    </>
  )
}
```

`Fragment`는 DOM 노드를 추가하지 않기 때문에 레이아웃이나 시맨틱 구조를 깨지 않고 그룹화할 수 있다.

<br>

### 주의할 점

- `key`가 필요하면 짧은 문법 `<>...</>` 대신 `React.Fragment` 또는 `Fragment`를 사용해야 한다.
- `import { Fragment } from 'react'` 또는 `React.Fragment` 형태로 사용한다.
