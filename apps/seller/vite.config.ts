import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    // 라우트 파일이 바뀌면 라우트 트리를 다시 생성하고, 라우트마다 코드를 나눈다(ADR 0021).
    // 설정은 tsr.config.json(generate 스크립트와 같은 파일). react()보다 앞에 둔다
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    // Fast Refresh(수정한 컴포넌트만 교체하고 상태 유지)
    react(),
  ],
});
