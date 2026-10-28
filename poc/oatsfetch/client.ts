import createFetchClient from 'openapi-fetch';
import createQueryClient from 'openapi-react-query';
import type { paths } from './generated/schema';

export const api = createFetchClient<paths>({ baseUrl: process.env.API_BASE_URL ?? 'http://localhost:3000/api' });
export const $api = createQueryClient(api);
