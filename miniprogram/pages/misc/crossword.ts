import 'miniprogram-api-typings';

import { AppOption } from '../../utils/app_context';

import defaultCrosswordHtml from './crossword.html';

const app = getApp<AppOption>();

Page({
  data: {
    uiConfig: {
      crosswordContent: defaultCrosswordHtml,
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
