import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  // Fast Refresh(수정한 컴포넌트만 교체하고 상태 유지)
  plugins: [react()],
});
