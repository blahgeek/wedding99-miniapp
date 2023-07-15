import { z } from 'zod';

import { request } from './request';

const GlobalConfigSchema = z.object({
  uiConfig: z.record(z.string()),
});

export type GlobalConfig = z.infer<typeof GlobalConfigSchema>;

export async function getGlobalConfig(): Promise<GlobalConfig> {
  const { data, statusCode } = await request('/api/global_config');
  if (statusCode !== 200) {
    throw new Error(`getGlobalConfig failed: ${statusCode}`);
  }

  return GlobalConfigSchema.parse(data);
}
