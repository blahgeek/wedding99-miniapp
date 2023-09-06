import 'miniprogram-api-typings';

import { AppOption } from '../../utils/app_context';

const app = getApp<AppOption>();

Page({
  data: {
    uiConfig: {
      crosswordContent: 'no data',
    },
  },

  onShow: async function() {
    wx.showLoading({
      title: 'Loading...',
    });
    this.setData(await app.context.getUiConfigUpdateData('crossword'));
    wx.hideLoading();
  },
})
