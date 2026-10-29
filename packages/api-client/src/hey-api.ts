import type { CreateClientConfig } from './generated/client.gen';

// 생성 클라이언트가 처음 만들어질 때 호출된다. 서버·브라우저가 같은 baseUrl을 써야 queryKey가 같다.
// 지금은 목 서버 주소로 고정한다. 환경 변수 이름은 앱 번들러가 정하므로(NEXT_PUBLIC_ 등) 첫 앱에서 정한다
export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  baseUrl: 'http://localhost:4010',
  // 기본값 auto는 text/plain 2xx 본문을 문자열 data로 돌려준다. JSON으로만 읽어 실패를 오류 인터셉터로 보낸다.
  // JSON이 아닌 응답(CSV 다운로드 등)은 호출할 때 parseAs를 지정한다
  parseAs: 'json',
});
