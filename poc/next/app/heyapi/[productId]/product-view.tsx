'use client';

import { useQuery } from '@tanstack/react-query';
import { getProductOptions } from '../../../../heyapi/generated/@tanstack/react-query.gen';

export default function ProductView({ productId }: { productId: string }) {
  // 브라우저는 쿠키를 자동으로 보내므로 headers를 넣지 않는다
  const query = useQuery(getProductOptions({ path: { productId } }));
  return (
    <main>
      <h1>Hey API</h1>
      <p id="status">{query.status} / fetchStatus {query.fetchStatus}</p>
      <p id="name">{query.data?.name ?? '(없음)'}</p>
    </main>
  );
}
