import type { CreateClientConfig } from './generated/client.gen';

// Node(Next.js 서버)에만 있는 전역. 브라우저 코드가 @types/node에 의존하지 않게 이 파일에서만 선언한다
declare const process: { env: Record<string, string | undefined> } | undefined;

// 생성 클라이언트가 처음 만들어질 때(모듈 로드 시) 호출된다. 서버·브라우저가 같은 baseUrl을 써야 queryKey가 같다.
// 서버는 실행 시점의 API_BASE_URL을 읽는다(이미지 하나를 환경 변수만 바꿔 쓴다, ADR 0010).
// 브라우저에는 이 변수가 없어 undefined이고, 앱이 서버에서 읽은 값을 받아 client.setConfig로 맞춘다
export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  baseUrl: typeof process === 'undefined' ? undefined : process.env.API_BASE_URL,
  // 기본값 auto는 text/plain 2xx 본문을 문자열 data로 돌려준다. JSON으로만 읽어 실패를 오류 인터셉터로 보낸다.
  // JSON이 아닌 응답(CSV 다운로드 등)은 호출할 때 parseAs를 지정한다
  parseAs: 'json',
});
