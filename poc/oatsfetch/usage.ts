// 생성물 사용 형태와 타입 검사 (POC web#1). 실행하지 않고 tsc로만 확인한다
import { useQuery } from '@tanstack/react-query';
import { $api, api } from './client';
import type { components } from './generated/schema';

type Problem = components['schemas']['Problem'];
type Product = components['schemas']['Product'];
const productId = '0190a5e2-0000-7000-8000-000000000000';

// 서버 컴포넌트: 세션 쿠키를 요청 헤더로 넘긴다. 네트워크 오류는 throw, 응답이 있으면 { data, error, response }
export async function serverSide(cookie: string) {
  const { data, error, response } = await api.GET('/products/{productId}', {
    params: { path: { productId } }, headers: { cookie },
  });
  if (error) {
    const problem: Problem = error;
    return { status: response.status, type: problem.type };
  }
  const product: Product = data;
  const description: string | null = product.description;

  const page = await api.GET('/products', { params: { query: { pageSize: 20, status: 'ON_SALE' } } });
  const next: string | null | undefined = page.data?.nextPageToken;
  return { description, next };
}

// 클라이언트 컴포넌트: TanStack Query
export function useProduct() {
  const query = useQuery($api.queryOptions('get', '/products/{productId}', { params: { path: { productId } } }));
  const name: string | undefined = query.data?.name;
  const errorType: string | undefined = query.error?.type;
  // mutationOptions는 없고 훅만 있다 (0.5.4)
  const add = $api.useMutation('post', '/cart-items');
  add.mutate({ body: { skuId: productId, quantity: 1 } });
  return { name, errorType };
}

// 스펙과 다른 호출은 컴파일 오류여야 한다
export async function mistakes() {
  // @ts-expect-error 경로 파라미터 이름이 다르다
  await api.GET('/products/{productId}', { params: { path: { id: productId } } });
  // @ts-expect-error 필수 필드 quantity가 없다
  await api.POST('/cart-items', { body: { skuId: productId } });
  // @ts-expect-error enum에 없는 값
  await api.GET('/products', { params: { query: { status: 'DELETED' } } });
  const { data } = await api.GET('/products/{productId}', { params: { path: { productId } } });
  // @ts-expect-error 오류 응답이면 data가 undefined다
  const name: string = data.name;
  return name;
}
