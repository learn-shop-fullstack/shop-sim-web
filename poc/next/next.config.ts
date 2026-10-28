import path from 'node:path';
import type { NextConfig } from 'next';

const config: NextConfig = {
  // 생성물(poc/heyapi, poc/orval)이 앱 폴더 밖에 있어 레포 루트를 기준으로 잡는다
  // AGENTS.md 자동 생성은 POC에서 끈다. 1단계 실제 앱에서 둘지 다시 정한다
  agentRules: false,
  turbopack: { root: path.resolve(import.meta.dirname, '../..') },
};

export default config;
