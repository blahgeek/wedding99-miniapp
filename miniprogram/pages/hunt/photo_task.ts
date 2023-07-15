import 'miniprogram-api-typings';

import { PhotoTaskDetail } from './types';
import { uploadImageAndDetect } from './api';

Page({
  data: {
    taskId: '',
    photoTask: undefined as (PhotoTaskDetail | undefined),
  },

  _vkSession: undefined as (WechatMiniprogram.VKSession | undefined),

  onLoad: function() {
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on('onLoadTask',
      (data: {taskId: string, photoTask: PhotoTaskDetail}) => {
        console.log(`Received loadTask event: ${data.taskId}`);
        this.setData(data);
      });
  },

  takePhoto: async function() {
    const photoResult = await new Promise<WechatMiniprogram.ChooseMediaSuccessCallbackResult>((resolve, reject) => {
      wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['camera'],
        camera: 'front',
        sizeType: ['compressed'],
        success: (res) => resolve(res),
        fail: () => reject('chooseMedia failed'),
      });
    });
    if (photoResult.tempFiles.length !== 1) {
      return;
    }
    console.log(await uploadImageAndDetect(photoResult.tempFiles[0].tempFilePath));
  },

})
