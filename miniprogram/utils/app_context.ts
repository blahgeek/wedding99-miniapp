import { GlobalConfig, requestGlobalConfig } from './api/global_config';

export { GlobalConfig } from './api/global_config';

export default class AppContext {
  private globalConfig: GlobalConfig | undefined;
  private globalConfigPromise: Promise<GlobalConfig> | undefined;

  async getGlobalConfigCached(): Promise<GlobalConfig> {
    if (this.globalConfig !== undefined) {
      return this.globalConfig;
    }
    if (this.globalConfigPromise !== undefined) {
      return await this.globalConfigPromise;
    }
    const prom = requestGlobalConfig();
    this.globalConfigPromise = prom;
    const result = await prom;
    this.globalConfig = result;
    return result;
  }
}

export interface AppOption {
  context: AppContext,
}
