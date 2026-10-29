import { describe, expect, it } from 'vitest';
import { defaultClient } from './client';
import { getProduct } from './generated/sdk.gen';
import { createServerClient } from './server';

const productId = '0190a5c3-7b2e-7c4d-9f1a-2b3c4d5e6f70';

// 보낸 cookie 헤더를 기록하는 fetch
function recordCookies() {
  const sent: (string | null)[] = [];
  const fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    sent.push(new Request(input, init).headers.get('cookie'));
    return Response.json({});
  };
  return { sent, fetch };
}

describe('createServerClient', () => {
  it('요청마다 자기 쿠키만 보내고 기본 클라이언트는 바꾸지 않는다', async () => {
    const { sent, fetch } = recordCookies();
    await getProduct({ client: createServerClient('session=a'), path: { productId }, fetch });
    await getProduct({ client: createServerClient('session=b'), path: { productId }, fetch });
    await getProduct({ path: { productId }, fetch });
    expect(sent).toEqual(['session=a', 'session=b', null]);
  });

  it('기본 클라이언트의 헤더를 지우지 않고 합친다', () => {
    defaultClient.setConfig({ headers: { 'x-client': 'store' } });
    try {
      const headers = new Headers(createServerClient('session=a').getConfig().headers as HeadersInit);
      expect(Object.fromEntries(headers)).toMatchObject({ cookie: 'session=a', 'x-client': 'store' });
    } finally {
      // null은 헤더를 지운다
      defaultClient.setConfig({ headers: { 'x-client': null } });
    }
  });
});
