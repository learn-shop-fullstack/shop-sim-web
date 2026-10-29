import type { Problem } from './generated/types.gen';

/**
 * 서버가 Problem으로 답하지 않은 실패
 * - network: 응답을 받지 못함(연결 실패 등). fetch 전 코드 오류(직렬화 등)도 여기로 온다
 * - aborted: 호출한 쪽이 취소함(페이지 이동, 쿼리 취소). 화면에 오류로 보이지 않는다
 * - timeout: AbortSignal.timeout으로 시간이 초과됨
 * - unexpected: 응답은 왔지만 Problem이 아님(프록시의 HTML 502, JSON이 아닌 2xx 본문 등)
 */
export type ApiClientFailure = { kind: 'network' | 'aborted' | 'timeout' } | { kind: 'unexpected'; status: number };

const messages = {
  network: '응답을 받지 못했다',
  aborted: '요청이 취소됐다',
  timeout: '응답 시간이 초과됐다',
  unexpected: 'Problem이 아닌 응답이다',
} as const;

/** 화면 코드는 `instanceof ApiClientError`로 먼저 거르고, 나머지는 Problem의 type으로 분기한다 */
export class ApiClientError extends Error {
  override readonly name = 'ApiClientError';

  constructor(
    readonly failure: ApiClientFailure,
    cause: unknown,
  ) {
    super(messages[failure.kind], { cause });
  }
}

// 상태 코드별 스펙 목록은 런타임에 남지 않아, Problem 형식이고 상태 코드가 응답과 같으면 Problem으로 본다
function isProblem(body: unknown, status: number): body is Problem {
  if (typeof body !== 'object' || body === null) return false;
  const { type, title, status: bodyStatus } = body as Record<string, unknown>;
  return typeof type === 'string' && typeof title === 'string' && bodyStatus === status;
}

/** 생성 클라이언트의 오류 인터셉터. 결과는 Problem 또는 ApiClientError다 */
export function normalizeError(
  error: unknown,
  response: Response | undefined,
  options: Pick<RequestInit, 'signal'>,
): Problem | ApiClientError {
  // 인터셉터가 두 번 걸려도 다시 감싸지 않는다
  if (error instanceof ApiClientError) return error;
  // 본문을 읽다가 취소되면 response가 있으므로 응답 유무보다 먼저 본다
  const { signal } = options;
  if (signal?.aborted) {
    const timedOut = signal.reason instanceof DOMException && signal.reason.name === 'TimeoutError';
    return new ApiClientError({ kind: timedOut ? 'timeout' : 'aborted' }, error);
  }
  if (!response) return new ApiClientError({ kind: 'network' }, error);
  if (!response.ok && isProblem(error, response.status)) return error;
  return new ApiClientError({ kind: 'unexpected', status: response.status }, error);
}
