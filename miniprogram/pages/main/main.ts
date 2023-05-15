import { AppOption } from '../../utils/app_context';
import { DEFAULT_UI_CONFIG } from '../../utils/ui_config';

const app = getApp<AppOption>()

Page({
  data: {
    uiConfig: DEFAULT_UI_CONFIG,
  },
  onLoad() {
    wx.showLoading({
      title: 'Loading...'
    });
    (async () => {
      const { uiConfig } = await app.context.getGlobalConfigCached();
      this.setData({ uiConfig });
      wx.hideLoading();
    })();
  },
})
