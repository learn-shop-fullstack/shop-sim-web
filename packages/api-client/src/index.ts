import type { ApiClientError } from './errors';
import type { Problem } from './generated/types.gen';

export { createApiClient } from './client';
export { ApiClientError, type ApiClientFailure, isTransientError } from './errors';
// SDK 함수와 스펙 타입. 생성 클라이언트(createClient)는 내보내지 않는다
export * from './generated';

/**
 * SDK 결과의 error 실제 타입. 생성 타입은 스펙의 오류 응답(Problem)만 알아서 ApiClientError가 빠져 있다
 */
export type ApiError = Problem | ApiClientError;
