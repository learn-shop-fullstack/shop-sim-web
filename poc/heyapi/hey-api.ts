import type { CreateClientConfig } from './generated/client.gen';

export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  baseUrl: process.env.API_BASE_URL ?? 'http://localhost:3000/api',
});
