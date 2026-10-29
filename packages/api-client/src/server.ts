import { createApiClient } from './client';
import type { Client } from './generated/client';

/**
 * 서버 컴포넌트용. 요청마다 그 요청의 쿠키를 담은 클라이언트를 만들어 SDK 함수의 client 옵션으로 넘긴다
 *   getProduct({ client: createServerClient((await cookies()).toString()), path: { productId } })
 * - 쿠키를 요청 옵션 headers로 넘기지 않는다. headers가 queryKey에 들어가 브라우저가 같은 쿼리를 다시 요청한다(ADR 0017)
 * - 기본 클라이언트에 쿠키를 넣지 않는다. 서버에서는 여러 사용자의 요청이 기본 클라이언트를 함께 쓴다
 */
export function createServerClient(cookie: string): Client {
  return createApiClient({ headers: { cookie } });
}
