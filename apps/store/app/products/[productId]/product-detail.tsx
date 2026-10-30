'use client';

import { getProductOptions } from '@shop-sim/api-client/query';
import { useSuspenseQuery } from '@tanstack/react-query';

export default function ProductDetail({ productId }: { productId: string }) {
  // 서버가 넘긴 캐시가 있어 중단(suspend)되지 않는다. 브라우저 요청은 staleTime이 지난 뒤에만 나간다
  const { data: product } = useSuspenseQuery(getProductOptions({ path: { productId } }));
  return (
    <main>
      <h1>{product.name}</h1>
      {product.subtitle && <p>{product.subtitle}</p>}
      {/* 판매가(할인 끝수 처리)는 3단계에서 정한다. 지금은 정가와 할인율만 보여준다 */}
      <p>정가 {product.price.toLocaleString('ko-KR')}원</p>
      {product.discountRate > 0 && <p>할인 {product.discountRate}%</p>}
      {product.type === 'MADE_TO_ORDER' && <p>주문 후 제작 · {product.leadTimeDays}일 소요</p>}
    </main>
  );
}
