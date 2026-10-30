import { ApiClientError, createServerClient } from '@shop-sim/api-client';
import { getProductOptions } from '@shop-sim/api-client/query';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { getQueryClient } from '../../query-client';
import ProductDetail from './product-detail';

export default async function ProductPage({ params }: PageProps<'/products/[productId]'>) {
  const { productId } = await params;
  const queryClient = getQueryClient();
  // 쿠키는 요청 옵션 headers가 아니라 클라이언트에 담는다. headers는 queryKey에 들어가 브라우저가 다시 요청한다(ADR 0017)
  const options = getProductOptions({ client: createServerClient((await cookies()).toString()), path: { productId } });
  // prefetchQuery는 실패해도 throw하지 않는다. 결과는 캐시 상태로 본다
  await queryClient.prefetchQuery(options);
  const error = queryClient.getQueryState(options.queryKey)?.error;
  // 없는 상품(404)과 형식이 틀린 id(400 validation-error)는 사용자에게 같은 "없는 페이지"다
  if (error && !(error instanceof ApiClientError) && (error.status === 404 || error.status === 400)) notFound();
  if (error) throw error;
  return (
    // 성공한 쿼리만 브라우저로 넘어간다(dehydrate 기본값). 브라우저는 같은 queryKey로 캐시를 이어받는다
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductDetail productId={productId} />
    </HydrationBoundary>
  );
}
