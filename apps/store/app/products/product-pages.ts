import type { createServerClient } from '@shop-sim/api-client';
import { listProductsInfiniteOptions } from '@shop-sim/api-client/query';
import { infiniteQueryOptions } from '@tanstack/react-query';

/**
 * 상품 목록 무한 쿼리 옵션. 서버 prefetch와 브라우저가 같은 함수로 만들어야 queryKey와 페이지 규칙이 같다.
 * client는 서버에서만 넘긴다(쿠키를 담은 클라이언트)
 */
export function productPagesOptions(client?: ReturnType<typeof createServerClient>) {
  return infiniteQueryOptions({
    ...listProductsInfiniteOptions({ client, query: { pageSize: 20 } }),
    // pageToken은 minLength 1이라 빈 문자열이면 400이다. 빈 객체는 첫 요청을 pageToken 없이 보낸다
    initialPageParam: {},
    // 마지막 페이지는 nextPageToken이 null이다. undefined를 돌려줘야 TanStack이 끝으로 본다
    getNextPageParam: (lastPage) => lastPage.nextPageToken ?? undefined,
  });
}
