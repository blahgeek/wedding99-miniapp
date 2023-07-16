import 'miniprogram-api-typings';

import { AppOption } from '../../utils/app_context';
import { QuestionTaskDetail, QuestionTaskState } from './types';

const app = getApp<AppOption>()

Page({
  data: {
    answer: -1,
    taskId: '',
    question: undefined as (QuestionTaskDetail | undefined),
    adAlreadyPlayed: false,
    uiConfig: {
      questionPlayAdButton: '播放视频去掉错误答案',
    },
  },

  onLoad: async function() {
    this.setData(await app.context.getUiConfigUpdateData('question'));
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on('onLoadTask',
      (data: {taskId: string, question: QuestionTaskDetail}) => {
        console.log(`Received loadTask event: ${data.taskId}`);
        this.setData(data);
      });
  },

  radioChange: function(e: WechatMiniprogram.Input) {
    this.setData({ answer: parseInt(e.detail.value) });
  },

  submit: function() {
    const question = this.data.question;
    if (question === undefined) {
      return;
    }
    const eventChannel = this.getOpenerEventChannel();
    const isCorrect = (this.data.answer === question.correctAnswer);
    console.log(`Answer submitted for question ${this.data.taskId}: correct: ${isCorrect}`);
    const taskState: QuestionTaskState = {
      type: 'question',
    };
    eventChannel.emit('onResult', {
      isCorrect,
      taskState,
    });
    wx.showModal({
      title: isCorrect ? '回答正确' : '回答错误',
      content: question.explanation,
      showCancel: false,
      confirmText: '好',
      complete: () => {
        wx.navigateBack();
      },
    });
  },

  playAd: function() {
    const question = this.data.question;
    if (question === undefined || question.removeAnswersAfterAd.length === 0 || this.data.adAlreadyPlayed) {
      return;
    }

    wx.navigateTo({
      url: '/pages/hunt/video_ad',
      events: {
        onAdComplete: () => {
          console.log('Ad complete');
          this.setData({ adAlreadyPlayed: true });
        },
      },
    });
  },

})
