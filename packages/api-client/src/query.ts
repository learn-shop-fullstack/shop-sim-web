// 기본 클라이언트에 오류 정규화를 건다. 이 진입점만 import해도 인터셉터가 빠지지 않는다
import './client';

// TanStack Query 옵션(getProductOptions 등). React를 쓰지 않는 소비자는 이 진입점을 쓰지 않는다
export * from './generated/@tanstack/react-query.gen';
