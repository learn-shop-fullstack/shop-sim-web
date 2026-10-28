'use client';

import { useGetProduct } from '../../../../orval/generated/products/products';

export default function ProductView({ productId }: { productId: string }) {
  const query = useGetProduct(productId);
  return (
    <main>
      <h1>Orval</h1>
      <p id="status">{query.status} / fetchStatus {query.fetchStatus}</p>
      <p id="name">{query.data?.data.name ?? '(없음)'}</p>
    </main>
  );
}
