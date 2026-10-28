// 생성물 사용 형태와 타입 검사 (POC web#1). 실행하지 않고 tsc로만 확인한다
import { useAddCartItem } from './generated/cart-items/cart-items';
import type { Product } from './generated/model';
import { getProduct, listProducts, useGetProduct } from './generated/products/products';

const productId = '0190a5e2-0000-7000-8000-000000000000';

// 서버 컴포넌트: 세션 쿠키를 요청 헤더로 넘긴다. 4xx·네트워크 오류는 throw(forceSuccessResponse)
export async function serverSide(cookie: string) {
  try {
    const res = await getProduct(productId, { headers: { cookie } });
    const product: Product = res.data;
    const description: string | null = product.description;
    const page = await listProducts({ pageSize: 20, status: 'ON_SALE' });
    const next: string | null = page.data.nextPageToken;
    return { description, next };
  } catch (error) {
    // 던져진 값의 타입은 생성되지 않는다. 생성된 info·status 모양은 직접 좁혀야 한다
    const err = error as Error & { info?: { type: string }; status?: number };
    return { status: err.status, type: err.info?.type };
  }
}

// 클라이언트 컴포넌트: 생성된 훅
export function useProduct() {
  const query = useGetProduct(productId);
  const name: string | undefined = query.data?.data.name;
  const errorType: string | undefined = query.error?.info?.type;
  const add = useAddCartItem();
  add.mutate({ data: { skuId: productId, quantity: 1 } });
  return { name, errorType };
}

// 스펙과 다른 호출은 컴파일 오류여야 한다
export async function mistakes() {
  // @ts-expect-error 경로 파라미터 타입이 다르다 (위치 인자라 이름 오류는 생길 수 없다)
  await getProduct(123);
  // @ts-expect-error 필수 필드 quantity가 없다
  await useAddCartItem().mutateAsync({ data: { skuId: productId } });
  // @ts-expect-error enum에 없는 값
  await listProducts({ status: 'DELETED' });
  const query = useGetProduct(productId);
  // @ts-expect-error 로딩 중에는 data가 undefined다
  const name: string = query.data.data.name;
  return name;
}
