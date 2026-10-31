import type { Product, ProductType } from '@shop-sim/api-client';
import { listProductsOptions } from '@shop-sim/api-client/query';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import {
  type ColDef,
  ClientSideRowModelModule,
  enableDevValidations,
  NumberFilterModule,
  TextFilterModule,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

// 운영자 전용 API와 인증이 생기기 전까지 공개 상품 목록 첫 페이지를 그리드에서 정렬·필터한다.
// 다음 페이지를 끝까지 받지 않는다(목 서버 정적 모드는 nextPageToken이 끝나지 않는다)
const productsQuery = listProductsOptions({ query: { pageSize: 100 } });

if (import.meta.env.DEV) enableDevValidations();

const modules = [ClientSideRowModelModule, TextFilterModule, NumberFilterModule];

const typeLabels: Record<ProductType, string> = { FINISHED: '완제품', MADE_TO_ORDER: '주문 제작' };

const columnDefs: ColDef<Product>[] = [
  { field: 'name', headerName: '상품명', filter: 'agTextColumnFilter', flex: 2 },
  { field: 'type', headerName: '유형', valueFormatter: ({ value }) => (value ? typeLabels[value as ProductType] : '') },
  {
    field: 'price',
    headerName: '정가',
    filter: 'agNumberColumnFilter',
    valueFormatter: ({ value }) => `${Number(value).toLocaleString('ko-KR')}원`,
  },
  { field: 'discountRate', headerName: '할인율', valueFormatter: ({ value }) => `${value}%` },
  { field: 'leadTimeDays', headerName: '제작 소요일', valueFormatter: ({ value }) => (value == null ? '-' : `${value}일`) },
];

export const Route = createFileRoute('/products')({
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery),
  component: Products,
});

function Products() {
  const { data } = useSuspenseQuery(productsQuery);
  return (
    <>
      <h1>상품</h1>
      <div style={{ height: 600 }}>
        <AgGridReact<Product> modules={modules} rowData={data.items} columnDefs={columnDefs} getRowId={({ data }) => data.id} />
      </div>
    </>
  );
}
