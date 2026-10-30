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

  it('VITE_API_BASE_URL을 baseUrl로 쓴다', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://vite.example.test');
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', undefined);
    expect((await loadClient()).getConfig().baseUrl).toBe('https://vite.example.test');
  });

  it('NEXT_PUBLIC_API_BASE_URL을 baseUrl로 쓴다', async () => {
    vi.stubEnv('VITE_API_BASE_URL', undefined);
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'https://next.example.test');
    expect((await loadClient()).getConfig().baseUrl).toBe('https://next.example.test');
  });

  it('둘 다 없으면 baseUrl이 없다', async () => {
    vi.stubEnv('VITE_API_BASE_URL', undefined);
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', undefined);
    expect((await loadClient()).getConfig().baseUrl).toBeUndefined();
  });
});
