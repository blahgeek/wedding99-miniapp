import { GlobalConfig, requestGlobalConfig } from './api/global_config';
import { code2session } from './api';

export { GlobalConfig } from './api/global_config';


const STORAGE_OPENID_KEY = 'openid';

export default class AppContext {
  private globalConfig: GlobalConfig | undefined;
  private globalConfigPromise: Promise<GlobalConfig> | undefined;

  private openid: string | undefined;

  constructor() {
    this.openid = wx.getStorageSync<string | undefined>(STORAGE_OPENID_KEY);
    if (this.openid === '') {
      this.openid = undefined;
    }
    if (this.openid !== undefined) {
      console.info(`Got openid from storage: ${this.openid}`);
    }
  }

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

  async getOpenidCached(): Promise<string> {
    if (this.openid !== undefined) {
      return this.openid;
    }

    const code: string = await new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          resolve(res.code);
        },
        fail: (err) => {
          reject(err);
        },
      });
    });

    const result = await code2session(code);
    const openid = result['openid'];
    if (typeof openid !== 'string') {
      throw new Error(`invalid response: ${JSON.stringify(result)}`);
    }

    console.info(`Got openid from server: ${openid}`);
    this.openid = openid;
    wx.setStorageSync(STORAGE_OPENID_KEY, openid);
    return openid;
  }

}

export interface AppOption {
  context: AppContext,
}
