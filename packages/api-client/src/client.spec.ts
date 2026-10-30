import { describe, expect, it } from 'vitest';
import { normalizeError } from './errors';
import { client } from './generated/client.gen';
import { ApiClientError, createApiClient, getProduct, setBrowserBaseUrl } from './index';

const productId = '0190a5c3-7b2e-7c4d-9f1a-2b3c4d5e6f70';
const offline = () => Promise.reject(new TypeError('fetch failed'));

describe('진입점', () => {
  it('SDK 함수가 기본으로 쓰는 클라이언트에 오류 정규화가 걸린다', async () => {
    // 요청 옵션의 fetch만 바꾸고 클라이언트는 기본 클라이언트 그대로 쓴다
    const { error } = await getProduct({ path: { productId }, fetch: offline });
    expect(error).toBeInstanceOf(ApiClientError);
  });

  it('기본 클라이언트에 인터셉터를 한 번만 건다', () => {
    expect(client.interceptors.error.fns.filter((fn) => fn === normalizeError)).toHaveLength(1);
  });
});

describe('createApiClient', () => {
  it('기본 설정을 물려받고 오류 정규화를 건다', async () => {
    const created = createApiClient({ fetch: offline });
    expect(created.getConfig()).toMatchObject({ baseUrl: 'http://localhost:4010', parseAs: 'json' });
    const { error } = await getProduct({ client: created, path: { productId } });
    expect(error).toBeInstanceOf(ApiClientError);
  });
});

describe('setBrowserBaseUrl', () => {
  it('기본 클라이언트와 이후 만드는 클라이언트의 baseUrl을 바꾼다', () => {
    const before = client.getConfig().baseUrl;
    try {
      setBrowserBaseUrl('https://api.example.test');
      expect(client.getConfig().baseUrl).toBe('https://api.example.test');
      expect(createApiClient().getConfig().baseUrl).toBe('https://api.example.test');
    } finally {
      client.setConfig({ baseUrl: before });
    }
  });
});
