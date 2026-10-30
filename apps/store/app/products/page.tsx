import { createServerClient } from '@shop-sim/api-client/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { cookies } from 'next/headers';
import { getQueryClient } from '../query-client';
import ProductList from './product-list';
import { productPagesOptions } from './product-pages';

export default async function ProductsPage() {
  const queryClient = getQueryClient();
  const options = productPagesOptions(createServerClient((await cookies()).toString()));
  // 첫 페이지만 서버에서 가져온다. 다음 페이지는 브라우저가 이어서 요청한다
  await queryClient.prefetchInfiniteQuery(options);
  const error = queryClient.getQueryState(options.queryKey)?.error;
  if (error) throw error;
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductList />
    </HydrationBoundary>
  );
}
