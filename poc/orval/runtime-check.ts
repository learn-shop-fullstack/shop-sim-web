// 4xx가 TanStack Query에서 data로 오는지 error로 오는지 실행해 본다 (POC web#1)
import { QueryClient } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { getGetProductQueryOptions } from './generated/products/products';

const problem = { type: 'about:blank', title: 'Not Found', status: 404 };
const server = setupServer(http.get('*/products/:productId', () => HttpResponse.json(problem, { status: 404 })));
server.listen();

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
try {
  const result = await queryClient.fetchQuery(getGetProductQueryOptions('0190a5e2-0000-7000-8000-000000000000'));
  console.log('data로 옴(성공 처리):', JSON.stringify(result).slice(0, 120));
} catch (error) {
  console.log('error로 옴(throw):', error instanceof Error ? `${error.name}: ${error.message}` : JSON.stringify(error));
}
server.close();
