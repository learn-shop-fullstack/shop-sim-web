import { normalizeError } from './errors';
import { type Client, type Config, createClient } from './generated/client';
import { client } from './generated/client.gen';

// 인터셉터 목록은 클라이언트마다 따로 있다. 모듈이 다시 평가돼도(HMR) 한 번만 건다
function withNormalizedErrors(target: Client): Client {
  if (!target.interceptors.error.exists(normalizeError)) target.interceptors.error.use(normalizeError);
  return target;
}

/** SDK 함수가 client 옵션 없이 쓰는 기본 클라이언트 */
export const defaultClient = withNormalizedErrors(client);

/**
 * 브라우저용. 브라우저에는 API_BASE_URL이 없어 기본 클라이언트의 baseUrl이 비어 있다(hey-api.ts).
 * 서버가 실행 시점에 읽은 값을 받아 첫 요청 전에 맞춘다. 서버와 같은 값이어야 queryKey가 같다
 */
export function setBrowserBaseUrl(baseUrl: string): void {
  defaultClient.setConfig({ baseUrl });
}

/**
 * 기본 클라이언트의 설정(baseUrl, parseAs)을 물려받고 오류 정규화를 건 새 클라이언트.
 * 생성물의 createClient를 직접 쓰면 둘 다 빠진다
 */
export function createApiClient(config: Config = {}): Client {
  const created = withNormalizedErrors(createClient(defaultClient.getConfig()));
  // 객체 펼치기와 달리 setConfig는 headers를 덮어쓰지 않고 합친다
  created.setConfig(config);
  return created;
}
