import 'miniprogram-api-typings';
// import { AppOption } from '../../utils/app_context';
// import { HuntQuestion } from '../../utils/api';

// const app = getApp<AppOption>()

Page({
  data: {
    answer: -1,
    questionId: '',
    question: {},
  },

  // onLoad: async function(query) {
  //   const globalConfig = await app.context.getGlobalConfigCached();
  //   const questionId = query.id as string;
  //   const question = globalConfig.huntQuestions[query.id as string];
  //   this.setData({ question, questionId });
  // },

  // radioChange: function(e: WechatMiniprogram.Input) {
  //   this.setData({ answer: parseInt(e.detail.value) });
  // },

  // submit: function() {
  //   const question = this.data.question as HuntQuestion;
  //   const eventChannel = this.getOpenerEventChannel();
  //   const isCorrect = (this.data.answer === question.correctAnswer);
  //   console.log(`Answer submitted for question ${this.data.questionId}: correct: ${isCorrect}`);
  //   eventChannel.emit('onAnswer', {
  //     isCorrect,
  //     questionId: this.data.questionId,
  //   });
  //   wx.showModal({
  //     title: isCorrect ? '回答正确' : '回答错误',
  //     content: question.explanation,
  //     showCancel: false,
  //     confirmText: '好',
  //     complete: () => {
  //       wx.navigateBack();
  //     },
  //   });
  // },

})
