## Vue.js 라이프사이클 이해하기

Vue 컴포넌트는 생성, 마운트, 업데이트, 언마운트 흐름을 따른다.

다만 버전에 따라 훅 이름이 조금 다르다.

- `Vue 2`: `beforeDestroy`, `destroyed`
- `Vue 3`: `beforeUnmount`, `unmounted`

아래는 현재 기준으로 많이 쓰는 개념 위주로 정리한 것이다.

<br>

### 1. Creation

컴포넌트 인스턴스가 만들어지고 반응성 상태가 준비되는 단계다.

- `beforeCreate`
  아직 reactive state, event 등이 준비되기 전이다.
- `created`
  data, props, methods 등에 접근할 수 있다.
  하지만 DOM은 아직 마운트되지 않았다.

데이터 초기화, 기본 상태 설정 같은 작업은 이 구간에서 자주 이뤄진다.

<br>

### 2. Mounting

컴포넌트가 실제 DOM에 연결되는 단계다.

- `beforeMount`
  첫 렌더링 직전
- `mounted`
  DOM 접근이 가능한 시점

브라우저 전용 API를 사용하거나 실제 DOM 측정이 필요하면 보통 `mounted` 이후에 처리한다.

<br>

### 3. Updating

반응형 상태가 바뀌어 다시 렌더링되는 단계다.

- `beforeUpdate`
  DOM 패치 직전
- `updated`
  DOM 패치 완료 후

`updated` 안에서 다시 상태를 바꾸면 무한 루프가 생길 수 있으므로 주의해야 한다.

<br>

### 4. Unmounting

컴포넌트가 제거되는 단계다.

- `beforeUnmount` / `beforeDestroy`
- `unmounted` / `destroyed`

타이머, 이벤트 리스너, 외부 구독(subscription) 정리는 이 시점에 한다.

<br>

### computed와 watch

라이프사이클과 함께 자주 비교되는 개념이다.

#### computed

기존 반응형 상태로부터 `파생 값`을 만들 때 적합하다.

```vue
computed: {
  fullName() {
    return this.firstName + ' ' + this.lastName
  }
}
```

- 캐시된다.
- 의존성이 바뀔 때만 다시 계산된다.

#### watch

특정 값의 변화를 감지해서 `부수 효과(side effect)`를 실행할 때 적합하다.

예)

- API 재호출
- debouncing
- 값 검증
- 외부 라이브러리 동기화

```vue
watch: {
  searchQuery(newValue) {
    this.fetchResults(newValue)
  }
}
```

#### 언제 무엇을 쓰나

- 파생 값이면 `computed`
- 변화에 따른 작업이면 `watch`

대부분의 단순 계산은 computed가 더 자연스럽다.
