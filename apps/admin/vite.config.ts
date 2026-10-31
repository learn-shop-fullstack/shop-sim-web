import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

// API 주소는 빌드할 때 번들에 들어간다(ADR 0020). 없으면 상대 경로로 조용히 요청하지 않고 여기서 멈춘다.
// config.env는 .env 파일과 process.env의 VITE_ 변수를 합친 값이다(설정 해석 뒤에 채워진다)
function requireEnv(name: string): Plugin {
  return {
    name: 'require-env',
    configResolved(config) {
      if (!config.env[name]) throw new Error(`${name} 환경 변수가 없다`);
    },
  };
}

export default defineConfig({
  plugins: [
    requireEnv('VITE_API_BASE_URL'),
    // 라우트 파일이 바뀌면 라우트 트리를 다시 생성하고, 라우트마다 코드를 나눈다(ADR 0021).
    // 설정은 tsr.config.json(generate 스크립트와 같은 파일). react()보다 앞에 둔다
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    // Fast Refresh(수정한 컴포넌트만 교체하고 상태 유지)
    react(),
  ],
});
