import 'miniprogram-api-typings';

Page({
  data: {
    uiConfig: {
      videoAdSrc: "https://wedding-photo.blahgeek.com/assets/rick-roll.mp4",
      videoAdCompleteTitle: '播放完毕',
      videoAdCompleteMessage: '返回获得奖励',
    },
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
