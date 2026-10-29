import { describe, expect, it } from 'vitest';
import { createApiClient } from './client';
import { ApiClientError, normalizeError } from './errors';
import { getProduct } from './generated/sdk.gen';

const productId = '0190a5c3-7b2e-7c4d-9f1a-2b3c4d5e6f70';
const notFound = { type: 'about:blank', title: 'Not Found', status: 404, detail: '상품을 찾을 수 없다' };

type FakeFetch = (url: unknown, init?: RequestInit) => Promise<Response>;

// 실제 경로(fetch → 본문 해석 → 오류 인터셉터)를 그대로 지나게 한다
function call(fetch: FakeFetch, signal?: AbortSignal) {
  return getProduct({ client: createApiClient({ fetch }), path: { productId }, signal });
}

const problemResponse = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/problem+json' } });

// 실제 fetch처럼 취소되면(이미 취소됐어도) 그 reason으로 실패한다
const onAbort = (signal: AbortSignal | null | undefined, fail: (reason: unknown) => void) => {
  if (signal?.aborted) fail(signal.reason);
  else signal?.addEventListener('abort', () => fail(signal.reason));
};
const hang: FakeFetch = (_, init) => new Promise((_, reject) => onAbort(init?.signal, reject));

// 헤더는 바로 오고 본문은 취소될 때까지 끝나지 않는다
const hangBody: FakeFetch = async (_, init) =>
  new Response(new ReadableStream({ start: (c) => onAbort(init?.signal, (reason) => c.error(reason)) }));

const abortSoon = (reason?: unknown) => {
  const controller = new AbortController();
  setTimeout(() => controller.abort(reason), 1);
  return controller.signal;
};

describe('normalizeError', () => {
  it('Problem 응답은 그대로 둔다', async () => {
    const { error } = await call(async () => problemResponse(notFound, 404));
    expect(error).toEqual(notFound);
  });

  it.each([
    ['연결 실패', () => Promise.reject(new TypeError('fetch failed')), undefined, { kind: 'network' }],
    ['abort()', hang, () => abortSoon(), { kind: 'aborted' }],
    ['abort(reason)', hang, () => abortSoon(new Error('unmount')), { kind: 'aborted' }],
    ['본문을 읽다가 abort()', hangBody, () => abortSoon(), { kind: 'aborted' }],
    ['AbortSignal.timeout', hang, () => AbortSignal.timeout(1), { kind: 'timeout' }],
    ['HTML 오류 페이지', async () => new Response('<html>Bad Gateway</html>', { status: 502 }), undefined, { kind: 'unexpected', status: 502 }],
    ['Problem이 아닌 JSON', async () => Response.json({ message: 'oops' }, { status: 500 }), undefined, { kind: 'unexpected', status: 500 }],
    ['본문과 다른 상태 코드', async () => problemResponse(notFound, 500), undefined, { kind: 'unexpected', status: 500 }],
    ['text/plain 2xx 본문', async () => new Response('not json'), undefined, { kind: 'unexpected', status: 200 }],
    ['깨진 JSON 2xx 본문', async () => new Response('{"id":', { headers: { 'Content-Type': 'application/json' } }), undefined, { kind: 'unexpected', status: 200 }],
  ] satisfies [string, FakeFetch, (() => AbortSignal) | undefined, unknown][])('%s', async (_, fetch, signal, failure) => {
    const { error } = await call(fetch, signal?.());
    expect(error).toBeInstanceOf(ApiClientError);
    expect(error).toMatchObject({ failure });
  });

  it('이미 정규화된 오류는 다시 감싸지 않는다', () => {
    const error = new ApiClientError({ kind: 'network' }, new TypeError('fetch failed'));
    expect(normalizeError(error, undefined, {})).toBe(error);
  });
});
