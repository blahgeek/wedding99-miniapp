import 'miniprogram-api-typings';

import { PhotoTaskDetail, PhotoTaskState } from './types';
import { UploadAndDetectResult, uploadImageAndDetect } from './api';

Page({
  data: {
    taskId: '',
    photoTask: undefined as (PhotoTaskDetail | undefined),
    taskState: undefined as (PhotoTaskState | undefined),
    otherFaces: [] as string[],
  },

  _vkSession: undefined as (WechatMiniprogram.VKSession | undefined),

  onLoad: function() {
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on('onLoadTask',
      (data: {taskId: string, photoTask: PhotoTaskDetail, taskState: PhotoTaskState | undefined, otherFaces: string[] }) => {
        console.log(`Received loadTask event: ${data.taskId}`);
        this.setData(data);
      });
  },

  takePhoto: async function() {
    if (this.data.photoTask === undefined) {
      return;
    }

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

    wx.showLoading({
      title: 'Detecting...',
    });
    let result: UploadAndDetectResult;
    try {
      result = await uploadImageAndDetect(photoResult.tempFiles[0].tempFilePath);
    } catch (e) {
      wx.hideLoading();
      wx.showModal({
        title: 'error',
        content: `detect error: ${e}`,
        showCancel: false,
        confirmText: '好',
      });
      return;
    } finally {
      wx.hideLoading();
    }
    console.log(result);

    const newState: PhotoTaskState = {
      type: 'photo',
      url: result.url,
      faces: result.faces,
    };
    this.setData({ taskState: newState });

    const uniqueFaceCount = result.faces.filter(x => this.data.otherFaces.indexOf(x) < 0).length;
    const isCorrect =
        uniqueFaceCount >= this.data.photoTask.requiredUniqueFaceCount &&
        result.faces.length >= this.data.photoTask.requiredFaceCount;
    this.getOpenerEventChannel().emit('onResult', {
      isCorrect,
      taskState: newState,
    });

    wx.showModal({
      title: isCorrect ? '回答正确' : '回答错误',
      content: `face count: ${result.faces.length}, unique face count: ${uniqueFaceCount}`,
      showCancel: false,
      confirmText: '好',
      complete: () => {
        wx.navigateBack();
      },
    });
  },

})
