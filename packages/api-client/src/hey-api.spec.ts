import { describe, expect, it } from 'vitest';
import { client } from './generated/client.gen';

describe('createClientConfig', () => {
  it('생성 클라이언트가 실행 시점 설정의 baseUrl로 만들어진다', () => {
    expect(client.getConfig().baseUrl).toBe('http://localhost:4010');
  });
});
