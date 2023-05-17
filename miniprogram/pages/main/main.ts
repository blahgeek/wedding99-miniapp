import { AppOption } from '../../utils/app_context';

const app = getApp<AppOption>()

Page({
  data: {},
  onLoad: async function() {
    wx.showLoading({
      title: 'Loading...'
    });
    this.setData(await app.context.getUiConfigUpdateData('main'));
    wx.hideLoading();
  },
})
