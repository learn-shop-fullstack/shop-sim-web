import { dehydrate, hydrate, isCancelledError, QueryClient } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { getProductOptions, listProductsInfiniteOptions } from './query';
import { createServerClient } from './server';

// server-only는 react-server 조건이 없는 환경(Vitest의 Node)에서 import하면 throw한다
vi.mock('server-only', () => ({}));

const path = { productId: '0190a5c3-7b2e-7c4d-9f1a-2b3c4d5e6f70' };
const product = { id: path.productId, name: '머그컵' };

describe('@shop-sim/api-client/query', () => {
  it('이 진입점만 import해도 기본 클라이언트에 오류 정규화가 걸린다', async () => {
    // 위 import로 이미 평가된 모듈을 비우고 이 진입점부터 다시 평가한다
    vi.resetModules();
    await import('./query');
    const { client } = await import('./generated/client.gen');
    expect(client.interceptors.error.fns).toHaveLength(1);
  });
});

describe('getProductOptions', () => {
  it('서버 클라이언트로 만든 queryKey가 브라우저 기본 클라이언트의 것과 같다', () => {
    const browser = getProductOptions({ path }).queryKey;
    expect(getProductOptions({ client: createServerClient('session=a'), path }).queryKey).toEqual(browser);
    // 요청 옵션 headers는 queryKey에 들어간다(그래서 쓰지 않는다)
    expect(getProductOptions({ headers: { cookie: 'session=a' }, path }).queryKey).not.toEqual(browser);
  });

  it('서버에서 미리 가져온 결과를 브라우저 쿼리가 그대로 이어받는다', async () => {
    const client = createServerClient('session=a');
    client.setConfig({ fetch: async () => Response.json(product) });
    const server = new QueryClient();
    await server.prefetchQuery(getProductOptions({ client, path }));

    const browser = new QueryClient();
    hydrate(browser, JSON.parse(JSON.stringify(dehydrate(server))));
    expect(browser.getQueryData(getProductOptions({ path }).queryKey)).toEqual(product);
  });

  it('쿼리를 취소하면 오류 상태가 되지 않는다(aborted가 화면에 오지 않는다)', async () => {
    const hang = (_: unknown, init?: RequestInit) =>
      new Promise<Response>((_, reject) => init?.signal?.addEventListener('abort', () => reject(init.signal?.reason)));
    const queryClient = new QueryClient();
    const options = getProductOptions({ path, fetch: hang });
    const fetching = queryClient.fetchQuery(options).catch((error: unknown) => error);
    await queryClient.cancelQueries({ queryKey: options.queryKey });
    expect(isCancelledError(await fetching)).toBe(true);
    expect(queryClient.getQueryState(options.queryKey)).toMatchObject({ status: 'pending', error: null, fetchStatus: 'idle' });
  });
});

describe('listProductsInfiniteOptions', () => {
  it('첫 페이지는 pageToken 없이, 다음 페이지는 앞 페이지의 nextPageToken으로 요청한다', async () => {
    const searches: string[] = [];
    const client = createServerClient('session=a');
    client.setConfig({
      fetch: async (url: unknown) => {
        searches.push(new URL(String(url instanceof Request ? url.url : url)).search);
        return Response.json({ items: [], nextPageToken: searches.length === 1 ? 'p2' : null });
      },
    });
    const query = new QueryClient();
    const data = await query.fetchInfiniteQuery({
      ...listProductsInfiniteOptions({ client, query: { pageSize: 2 } }),
      // pageToken은 minLength 1이라 빈 문자열을 보내면 400이다. 빈 객체는 첫 요청의 파라미터를 그대로 쓴다
      initialPageParam: {},
      getNextPageParam: (last) => last.nextPageToken ?? undefined,
      pages: 3,
    });
    expect(searches).toEqual(['?pageSize=2', '?pageSize=2&pageToken=p2']);
    expect(data.pages).toHaveLength(2);
  });
});
