// 생성물 사용 형태와 타입 검사 (POC web#1). 실행하지 않고 tsc로만 확인한다
import { useMutation, useQuery } from '@tanstack/react-query';
import { addCartItemMutation, getProductOptions } from './generated/@tanstack/react-query.gen';
import { addCartItem, getProduct, listProducts } from './generated/sdk.gen';
import type { Problem, Product } from './generated/types.gen';

const productId = '0190a5e2-0000-7000-8000-000000000000';

// 서버 컴포넌트: 세션 쿠키를 요청 헤더로 넘긴다. 기본은 throw하지 않고 { data, error } 반환
export async function serverSide(cookie: string) {
  const { data, error, response } = await getProduct({ path: { productId }, headers: { cookie } });
  if (error) {
    const problem: Problem = error; // 400 | 404 응답의 Problem
    return { status: response?.status, type: problem.type };
  }
  const product: Product = data;
  const description: string | null = product.description;

  const page = await listProducts({ query: { pageSize: 20, status: 'ON_SALE' }, throwOnError: true });
  const next: string | null = page.data.nextPageToken;
  return { description, next };
}

// 클라이언트 컴포넌트: TanStack Query
export function useProduct() {
  const query = useQuery(getProductOptions({ path: { productId } }));
  const name: string | undefined = query.data?.name;
  const errorType: string | undefined = query.error?.type; // error도 Problem 타입
  const add = useMutation(addCartItemMutation());
  add.mutate({ body: { skuId: productId, quantity: 1 } });
  return { name, errorType };
}

// 스펙과 다른 호출은 컴파일 오류여야 한다
export async function mistakes() {
  // @ts-expect-error 경로 파라미터 이름이 다르다
  await getProduct({ path: { id: productId } });
  // @ts-expect-error 필수 필드 quantity가 없다
  await addCartItem({ body: { skuId: productId } });
  // @ts-expect-error enum에 없는 값
  await listProducts({ query: { status: 'DELETED' } });
  const { data } = await getProduct({ path: { productId } });
  // @ts-expect-error throwOnError 없이는 data가 undefined일 수 있다
  const name: string = data.name;
  return name;
}
