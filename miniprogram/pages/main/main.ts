import 'miniprogram-api-typings';
import { AppOption } from '../../utils/app_context';

const app = getApp<AppOption>()

Page({
  data: {
    uiConfig: {
      mainShareMessageTitle: undefined,
      mainShareMessageImage: undefined,
      mainShareTimelineTitle: undefined,
      mainShareTimelineImage: undefined,
    },
  },
  onLoad: async function() {
    wx.showLoading({
      title: 'Loading...'
    });
    this.setData(await app.context.getUiConfigUpdateData('main'));
    wx.hideLoading();
  },

  onShareAppMessage: function() {
    return {
      title: this.data.uiConfig.mainShareMessageTitle,
      imageUrl: this.data.uiConfig.mainShareMessageImage,
    };
  },

  onShareTimeline: function() {
    return {
      title: this.data.uiConfig.mainShareTimelineTitle,
      imageUrl: this.data.uiConfig.mainShareTimelineImage,
    };
  },

})
