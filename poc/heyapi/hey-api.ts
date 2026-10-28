import type { CreateClientConfig } from './generated/client.gen';

export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  // 서버·브라우저가 같은 값을 써야 queryKey(baseUrl 포함)가 같다
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4010',
});
