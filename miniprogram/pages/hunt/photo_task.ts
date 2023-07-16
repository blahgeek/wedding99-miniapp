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

  onLoad: function() {
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on('onLoadTask',
      (data: {taskId: string, photoTask: PhotoTaskDetail, taskState: PhotoTaskState | undefined, otherFaces: string[] }) => {
        console.log(`Received loadTask event: ${data.taskId}`);
        this.setData(data);
      });
  },

  takePhoto: async function() {
    const photoTask = this.data.photoTask;
    if (photoTask === undefined) {
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
    let isCorrect = true;
    let msg = photoTask.successExplanation;
    if (result.faces.length < photoTask.requiredFaceCount) {
      isCorrect = false;
      msg = `只检测到${result.faces.length}张人脸`;
    } else if (uniqueFaceCount < photoTask.requiredUniqueFaceCount) {
      isCorrect = false;
      msg = `你已经和TA拍过照片了`;
    }

    this.getOpenerEventChannel().emit('onResult', {
      isCorrect,
      taskState: newState,
    });
    wx.showModal({
      title: isCorrect ? '通过' : '不通过',
      content: msg,
      showCancel: false,
      confirmText: '好',
      complete: () => {
        wx.navigateBack();
      },
    });
  },

})
