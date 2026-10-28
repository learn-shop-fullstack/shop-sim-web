import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { cookies } from 'next/headers';
import { getProductOptions } from '../../../../heyapi/generated/@tanstack/react-query.gen';
import { createClient } from '../../../../heyapi/generated/client';
import { client } from '../../../../heyapi/generated/client.gen';
import ProductView from './product-view';

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ productId: string }>;
  searchParams: Promise<{ variant?: string }>;
}) {
  const { productId } = await params;
  const { variant } = await searchParams;
  const cookie = (await cookies()).toString();
  const queryClient = new QueryClient();
  // headers: 요청 옵션으로 쿠키를 넘긴다 → headers가 queryKey에 들어간다
  // client: 요청마다 쿠키를 담은 클라이언트를 만든다 → queryKey에는 baseUrl만 들어간다
  const options =
    variant === 'client'
      ? { path: { productId }, client: createClient({ ...client.getConfig(), headers: { cookie } }) }
      : { path: { productId }, headers: { cookie } };
  await queryClient.prefetchQuery(getProductOptions(options));
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductView productId={productId} />
    </HydrationBoundary>
  );
}
