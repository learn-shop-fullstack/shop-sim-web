import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { cookies } from 'next/headers';
import { getGetProductQueryOptions } from '../../../../orval/generated/products/products';
import ProductView from './product-view';

export default async function Page({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const cookie = (await cookies()).toString();
  const queryClient = new QueryClient();
  // 쿠키는 fetch 옵션의 헤더로 넘긴다. Orval의 queryKey는 URL만 쓴다
  await queryClient.prefetchQuery(getGetProductQueryOptions(productId, { fetch: { headers: { cookie } } }));
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductView productId={productId} />
    </HydrationBoundary>
  );
}
