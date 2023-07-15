import 'miniprogram-api-typings';

import { QuestionTaskDetail, QuestionTaskState } from './types';

Page({
  data: {
    answer: -1,
    taskId: '',
    question: undefined as (QuestionTaskDetail | undefined),
  },

  onLoad: function() {
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
})
