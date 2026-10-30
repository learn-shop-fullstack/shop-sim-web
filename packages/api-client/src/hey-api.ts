import type { CreateClientConfig } from './generated/client.gen';

// 번들러가 빌드할 때 자기 표현식만 문자열로 바꾼다(ADR 0020). 브라우저 코드가 @types/node·vite/client에
// 의존하지 않게 여기서 선언한다. ImportMeta는 vite/client와 같은 모양이어야 SPA에서 합쳐진다
declare const process: { env: Record<string, string | undefined> };
declare global {
  interface ImportMetaEnv {
    readonly VITE_API_BASE_URL?: string;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

function readBaseUrl(): string | undefined {
  // Vite(셀러센터·어드민)가 import.meta.env를 객체로 바꾼다. Next에는 없다
  const vite = import.meta.env?.VITE_API_BASE_URL;
  if (vite) return vite;
  // Next(스토어)가 서버·브라우저 번들 모두에서 이 표현식을 문자열로 바꾼다. Vite 브라우저에는 process가 없다
  try {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  } catch {
    return undefined;
  }
}

// 생성 클라이언트가 처음 만들어질 때(모듈 로드 시) 호출된다. 서버·브라우저가 같은 번들 값을 써서 queryKey가 같다
export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  baseUrl: readBaseUrl(),
  // 기본값 auto는 text/plain 2xx 본문을 문자열 data로 돌려준다. JSON으로만 읽어 실패를 오류 인터셉터로 보낸다.
  // JSON이 아닌 응답(CSV 다운로드 등)은 호출할 때 parseAs를 지정한다
  parseAs: 'json',
});
