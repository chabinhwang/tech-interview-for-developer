#### [Operating System] System Call

---

`fork()`, `exec()`, `wait()` 계열은 프로세스 생성과 제어를 설명할 때 가장 자주 나오는 시스템 콜이다.

- `fork()`: 현재 프로세스를 복제해 자식 프로세스를 만든다.
- `exec()` 계열: 현재 프로세스의 실행 이미지 자체를 다른 프로그램으로 바꾼다.
- `wait()` / `waitpid()`: 부모가 자식의 상태 변화를 기다리고 회수(reap)한다.

---

##### fork

> 새로운 자식 프로세스를 생성할 때 사용한다.

`fork()`가 호출되면 부모와 자식은 **같은 코드 지점부터** 각각 실행을 이어 간다. 즉, 자식이 `main()` 처음부터 다시 시작하는 것이 아니라 `fork()`가 반환된 직후부터 실행된다.

다만 반환값이 다르기 때문에 부모와 자식이 서로 다른 분기를 탈 수 있다.

- 부모에서의 반환값: 자식의 PID
- 자식에서의 반환값: `0`
- 실패 시: `-1`

또한 부모와 자식은 "완전히 같은 프로세스 하나를 둘로 나눈 것"이 아니라, **초기 내용이 같은 별도 주소 공간**을 갖는다. 현대 운영체제는 보통 **copy-on-write(COW)** 로 구현하므로, `fork()` 시점에 메모리를 전부 즉시 복사하지 않는다.

```c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

int main(void) {
    pid_t rc = fork();

    if (rc < 0) {
        perror("fork");
        exit(1);
    } else if (rc == 0) {
        printf("child pid = %d\n", (int)getpid());
    } else {
        printf("parent pid = %d, child pid = %d\n", (int)getpid(), (int)rc);
    }

    return 0;
}
```

부모와 자식 중 누가 먼저 출력할지는 스케줄러가 결정하므로 비결정적이다.

---

##### wait / waitpid

> 부모 프로세스가 자식의 상태 변화를 기다리는 시스템 콜

가장 흔한 경우는 "자식이 종료될 때까지 기다린 뒤 회수하는 것"이다.

- 자식이 아직 종료되지 않았으면 부모는 block될 수 있다.
- 자식이 이미 종료되어 zombie 상태라면 즉시 반환하면서 자식을 회수한다.
- `waitpid()`는 특정 자식을 기다리거나 옵션을 줄 수 있어서 실무에서 더 자주 쓰인다.

```c
#include <stdio.h>
#include <stdlib.h>
#include <sys/wait.h>
#include <unistd.h>

int main(void) {
    pid_t rc = fork();

    if (rc < 0) {
        perror("fork");
        exit(1);
    } else if (rc == 0) {
        printf("child pid = %d\n", (int)getpid());
        _exit(0);
    } else {
        pid_t wc = waitpid(rc, NULL, 0);
        printf("parent pid = %d, waited child = %d\n", (int)getpid(), (int)wc);
    }

    return 0;
}
```

즉, `wait()`를 쓰면 "부모의 다음 코드가 실행되기 전에 자식 종료를 확인한다"는 보장을 얻을 수 있다.

---

##### exec

`fork()`는 자식을 만들고, `exec()`는 **현재 프로세스의 실행 이미지 자체를 다른 프로그램으로 교체**한다.

중요한 점은 다음과 같다.

- `exec()`는 **새 프로세스를 만들지 않는다.**
- 성공하면 현재 프로세스의 코드/데이터/힙/스택/메모리 매핑이 새 프로그램 기준으로 다시 구성된다.
- 프로세스 ID는 보통 유지된다.
- `FD_CLOEXEC`가 설정되지 않은 파일 디스크립터는 열려 있을 수 있다.
- 성공하면 `exec()` 뒤의 코드는 실행되지 않는다. 실패했을 때만 반환한다.

```c
#include <stdio.h>
#include <stdlib.h>
#include <sys/wait.h>
#include <unistd.h>

int main(void) {
    pid_t rc = fork();

    if (rc < 0) {
        perror("fork");
        exit(1);
    } else if (rc == 0) {
        execlp("ls", "ls", "-l", NULL);
        perror("execlp");
        _exit(1);
    } else {
        waitpid(rc, NULL, 0);
        printf("parent done\n");
    }

    return 0;
}
```

셸이 명령을 실행할 때도 보통 `fork()`로 자식을 만든 뒤, 자식에서 `exec()`를 호출하는 패턴을 사용한다.
