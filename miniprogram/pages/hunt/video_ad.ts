import 'miniprogram-api-typings';

import { AppOption } from '../../utils/app_context';

const app = getApp<AppOption>();

Page({
  data: {
    uiConfig: {
      videoAdSrc: "https://wedding-photo.blahgeek.com/assets/ad.mp4",
      videoAdCompleteTitle: '播放完毕',
      videoAdCompleteMessage: '返回获得奖励',
    },
  },

  onShow: async function() {
    wx.showLoading({
      title: 'Loading...',
    });
    this.setData(await app.context.getUiConfigUpdateData('videoAd'));
    wx.hideLoading();
  },

  onVideoEnded: function() {
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.emit('onAdComplete');

    wx.showModal({
      title: this.data.uiConfig.videoAdCompleteTitle,
      content: this.data.uiConfig.videoAdCompleteMessage,
      cancelText: '好',
      confirmText: '返回',
      success: (res: WechatMiniprogram.ShowModalSuccessCallbackResult) => {
        if (res.confirm) {
          wx.navigateBack();
        }
      },
    });
  },
})
