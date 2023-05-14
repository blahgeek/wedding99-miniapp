import { AppOption } from '../../utils/app_context';

const app = getApp<AppOption>()

Page({
  data: {},
  onLoad() {
    wx.showLoading({
      title: 'Loading...'
    });
    (async () => {
      const { mainRichContent } = await app.context.getGlobalConfigCached();
      this.setData({
        richContent: mainRichContent,
      });
      wx.hideLoading();
    })();
  },
})
