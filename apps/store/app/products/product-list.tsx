'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { productPagesOptions } from './product-pages';

export default function ProductList() {
  // 생성된 무한 쿼리 옵션은 queryFn 타입에 skipToken이 있어 Suspense 훅(useSuspenseInfiniteQuery)에 넘길 수 없다.
  // 서버가 첫 페이지를 넘겨 data가 있지만 타입상 undefined일 수 있다
  const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isFetchNextPageError } =
    useInfiniteQuery(productPagesOptions());
  return (
    <main>
      <h1>상품</h1>
      <ul>
        {(data?.pages ?? [])
          .flatMap((page) => page.items)
          .map((product) => (
            <li key={product.id}>
              <Link href={`/products/${product.id}`}>{product.name}</Link> {product.price.toLocaleString('ko-KR')}원
            </li>
          ))}
      </ul>
      {/* 다음 페이지 실패는 이미 보이는 목록을 지우지 않고 버튼 옆에 알린다 */}
      {isFetchNextPageError && <p>다음 상품을 불러오지 못했습니다.</p>}
      {hasNextPage && (
        <button type="button" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? '불러오는 중…' : '더 보기'}
        </button>
      )}
    </main>
  );
}
