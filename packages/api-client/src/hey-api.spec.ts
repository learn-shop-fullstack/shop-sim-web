import { afterEach, describe, expect, it, vi } from 'vitest';

// baseUrl은 모듈이 처음 로드될 때 정해지므로 환경 변수를 바꾼 뒤 모듈을 새로 불러온다
async function loadClient() {
  vi.resetModules();
  return (await import('./generated/client.gen')).client;
}

describe('createClientConfig', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('모듈 로드 시점의 API_BASE_URL을 baseUrl로 쓴다', async () => {
    vi.stubEnv('API_BASE_URL', 'https://api.example.test');
    expect((await loadClient()).getConfig().baseUrl).toBe('https://api.example.test');
  });

  it('API_BASE_URL이 없으면 baseUrl이 없다(브라우저는 앱이 setConfig로 맞춘다)', async () => {
    vi.stubEnv('API_BASE_URL', undefined);
    expect((await loadClient()).getConfig().baseUrl).toBeUndefined();
  });
});
