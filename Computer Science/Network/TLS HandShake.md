# TLS Handshake

<br>

`TLS handshake`는 애플리케이션 데이터를 주고받기 전에 다음을 합의하는 과정이다.

- 사용할 TLS 버전과 암호군
- 키 교환 방식
- 서버(필요하면 클라이언트) 인증
- 이후 통신에 사용할 대칭키 생성

`SSL`이라는 표현은 역사적으로는 맞지만, 현대 웹에서는 사실상 `TLS`라고 설명하는 것이 정확하다.

- `TLS 1.0`, `TLS 1.1`은 폐기되었다.
- 현재는 `TLS 1.2`, `TLS 1.3`이 주로 쓰이며, 최신 설명은 보통 `TLS 1.3` 기준으로 하는 것이 맞다.

<br>

![image](https://user-images.githubusercontent.com/34904741/139517776-f2cac636-5ce5-4815-981d-33905283bf13.png)

<br>

### TLS 1.3 기준 진행 순서

1. **ClientHello**

   클라이언트가 서버에 다음 정보를 보낸다.

   - 지원 TLS 버전(`supported_versions`)
   - 지원 cipher suites
   - 확장 정보(SNI, ALPN 등)
   - 키 교환용 `key_share`
   - 클라이언트 난수

2. **ServerHello**

   서버는 다음을 선택해 응답한다.

   - 사용할 TLS 버전
   - cipher suite
   - 서버의 `key_share`
   - 서버 난수

   이 시점부터 양측은 공유 비밀을 계산할 수 있고, 이후 핸드셰이크 메시지 대부분은 암호화되어 전달된다.

3. **EncryptedExtensions / Certificate / CertificateVerify / Finished**

   서버는 이어서 다음 정보를 보낸다.

   - 협상된 확장 정보
   - 서버 인증서 체인
   - 인증서에 대응하는 개인키를 실제로 가지고 있음을 증명하는 `CertificateVerify`
   - 지금까지의 핸드셰이크 무결성을 확인하는 `Finished`

4. **클라이언트 검증**

   클라이언트는 서버 인증서를 검증한다.

   - 신뢰된 CA 체인인지
   - 만료되지 않았는지
   - 접속한 호스트 이름과 일치하는지
   - `CertificateVerify`와 `Finished`가 올바른지

5. **선택 사항: 클라이언트 인증(mTLS)**

   서버가 클라이언트 인증서를 요구했다면, 클라이언트도 `Certificate`와 `CertificateVerify`를 보낸다.

6. **Client Finished**

   클라이언트도 자신의 `Finished`를 보내며, 서버는 이를 검증한다.

7. **애플리케이션 데이터 전송**

   양측은 핸드셰이크에서 만든 비밀값으로부터 애플리케이션 트래픽 키를 파생한 뒤, 이후 데이터는 대칭키 기반 AEAD 방식으로 보호한다.

<br>

### 자주 헷갈리는 부분

- `서버 공개키로 pre-master secret을 암호화해서 보내는 방식`은 주로 오래된 TLS 1.2 RSA key transport 설명이다.
- `TLS 1.3`에서는 이 방식이 제거되었고, 보통 `(EC)DHE`로 공유 비밀을 만든다.
- 서버 인증서의 공개키는 주로 `서버 신원 인증`과 `핸드셰이크 서명 검증`에 사용된다.

<br>

### 추가 메모

- 세션 재개(resumption)와 `0-RTT` 같은 최적화가 있을 수 있다.
- 단, `0-RTT` 데이터는 재전송 공격(replay)에 주의해야 하므로 모든 요청에 적합하지는 않다.

<br>

#### 참고 자료

- RFC 8446
- RFC 8996
