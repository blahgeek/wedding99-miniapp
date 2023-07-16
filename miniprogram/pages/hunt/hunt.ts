import 'miniprogram-api-typings';
import { z } from 'zod';

import { AppOption } from '../../utils/app_context';
import { submitHuntScore, getHuntTasks } from './api';
import { HuntTask, TaskStateSchema, TaskState } from './types';

const app = getApp<AppOption>()


const HuntStateSchema = z.object({
  name: z.string().optional(),
  // task status only contains unlocked tasks
  taskStatus: z.record(z.union([
    z.literal('unlocked'),
    z.literal('correct'),
    z.literal('incorrect'),
  ])).catch(() => { return {}; }),
  taskState: z.record(TaskStateSchema).catch(() => { return {}; }),
});

type HuntState = z.infer<typeof HuntStateSchema>;


const STORAGE_HUNT_STATE_KEY = 'hunt_state_0709';
const STORAGE_HUNT_SUBMITTED_SCORE_KEY = 'hunt_submitted_score';
const QRCODE_PREFIX = 'wedding99:';

const DEFAULT_HUNT_STATE: HuntState = {
  name: undefined,
  taskStatus: {},
  taskState: {},
};

function readHuntStateFromStorage(): HuntState {
  const state = wx.getStorageSync(STORAGE_HUNT_STATE_KEY);
  try {
    return HuntStateSchema.parse(JSON.parse(state));
  } catch (e) {
    return { ... DEFAULT_HUNT_STATE };
  }
}

Page({
  data: {
    // huntQuestionsCount: 0,
    huntTasks: [] as HuntTask[],
    huntState: DEFAULT_HUNT_STATE,
    uiConfig: {
      huntAlreadyUnlocked: '这个二维码已经扫过了',
      huntInvalidScan: '无效二维码',
      huntResetConfirm: '确定重新开始吗？',
      huntNameInputPlaceholder: '请输入姓名后开始',
      huntScanButton: '扫码',
      huntLocked: '未解锁',
    },
  },

  _submitHuntScoreIfRequired: async function() {
    const huntState = this.data.huntState;
    if (!huntState.name) {
      return;
    }

    let score = this.data.huntTasks.filter(t => huntState.taskStatus[t.id] === 'correct').length;
    console.log(`New score: ${score}`);
    // default -1, so that we will submit once when started
    const submittedScore = +wx.getStorageSync(STORAGE_HUNT_SUBMITTED_SCORE_KEY) || -1;
    if (score <= submittedScore) {
      return;
    }

    try {
      const openid = await app.context.getOpenidCached();
      await submitHuntScore(openid, huntState.name, score);
      wx.setStorageSync(STORAGE_HUNT_SUBMITTED_SCORE_KEY, score);
    } catch (err) {
      console.error(`Failed to submit hunt score: ${err}`);
    }
  },


  _modifyHuntState: function(modFn: ((s: HuntState) => HuntState)) {
    let huntState = JSON.parse(JSON.stringify((this.data.huntState))) as HuntState;
    huntState = modFn(huntState);
    wx.setStorageSync(STORAGE_HUNT_STATE_KEY, JSON.stringify(huntState));
    this.setData({
      huntState,
    });
    return huntState;
  },

  _findTask: function(taskId: string): HuntTask | undefined {
    const filteredTasks = this.data.huntTasks.filter(x => x.id === taskId);
    if (filteredTasks.length === 0) {
      return undefined;
    }
    return filteredTasks[0];
  },

  _refreshPage: async function() {
    wx.showLoading({
      title: 'Loading',
    });
    this.setData(await app.context.getUiConfigUpdateData('hunt'));

    const huntTasks = await getHuntTasks(await app.context.getOpenidCached());
    const huntState = readHuntStateFromStorage();
    this.setData({huntTasks, huntState});

    wx.hideLoading();
  },

  onLoad: async function() {
    await this._refreshPage();
  },

  onPullDownRefresh: async function() {
    await this._refreshPage();
    wx.stopPullDownRefresh();
  },

  onShow: function() {
    this._submitHuntScoreIfRequired();  // submit if not up-to-date, no wait
  },

  submitNameAndStart: function(e: WechatMiniprogram.Input) {
    if (e.detail.value.length > 0) {
      this._modifyHuntState((s) => {
        s.name = e.detail.value;
        return s;
      });
    }
  },

  userReset: function() {
    wx.showModal({
      title: '提示',
      content: this.data.uiConfig.huntResetConfirm,
      success: (res) => {
        if (res.confirm) {
          this._modifyHuntState((_) => {
            return { ...DEFAULT_HUNT_STATE };
          });
        }
      },
    });
  },

  scanCode: async function() {
    const scanResult: WechatMiniprogram.ScanCodeSuccessCallbackResult =
      await new Promise((resolve, reject) => {
        wx.scanCode({
          onlyFromCamera: true,
          success: (res) => {
            resolve(res);
          },
          fail: (err) => {
            reject(err);
          },
        });
      });
    const taskId = scanResult.result.startsWith(QRCODE_PREFIX) ?
      scanResult.result.substr(QRCODE_PREFIX.length) : '';

    const task = this._findTask(taskId);
    if (task === undefined) {
      wx.showToast({
        title: this.data.uiConfig.huntInvalidScan,
        icon: 'error',
      });
      return;
    }
    if (this.data.huntState.taskStatus[taskId] !== undefined) {
      wx.showToast({
        title: this.data.uiConfig.huntAlreadyUnlocked,
        icon: 'error',
      });
      return;
    }

    console.log(`unlock task: ${taskId}`);
    this._modifyHuntState(s => {
      s.taskStatus[taskId] = 'unlocked';
      return s;
    });
    wx.showModal({
      title: '扫码成功',
      content: `任务${task.name || task.id}已解锁`,
      showCancel: false,
    });
  },

  openTask: async function(e: WechatMiniprogram.BaseEvent) {
    const taskId = e.currentTarget.dataset.id as string;
    console.log(`opening task ${taskId}`);

    const task = this._findTask(taskId);
    if (task === undefined) {  // should not happen
      return;
    }
    if (this.data.huntState.taskStatus[taskId] === undefined && task.defaultLocked) {
      wx.showToast({
        title: this.data.uiConfig.huntLocked,
        icon: 'error',
      });
      return;
    }

    const onResult = (data: { isCorrect: boolean, taskState: TaskState }) => {
      this._modifyHuntState(s => {
        s.taskStatus[taskId] = data.isCorrect ? 'correct' : 'incorrect';
        s.taskState[taskId] = data.taskState;
        return s;
      });
      this._submitHuntScoreIfRequired();
    };

    if (task.taskDetail.type === 'question') {
      const question = task.taskDetail;
      wx.navigateTo({
        url: '/pages/hunt/question_task',
        events: { onResult },
        success: (res) => {
          res.eventChannel.emit('onLoadTask', {
            taskId,
            question,
            taskState: this.data.huntState.taskState[taskId],
          });
        },
      });
    } else if (task.taskDetail.type == 'photo') {
      const photoTask = task.taskDetail;
      const otherFaces =
        Object.entries(this.data.huntState.taskState)
          .map(([k, v]) => {
            if (k !== taskId && v.type === 'photo') {
              return v.faces;
            }
            return [];
          })
          .reduce((a, b) => a.concat(b), []);

      wx.navigateTo({
        url: '/pages/hunt/photo_task',
        events: { onResult },
        success: (res) => {
          res.eventChannel.emit('onLoadTask', {
            taskId,
            photoTask,
            taskState: this.data.huntState.taskState[taskId],
            otherFaces,
          });
        },
      });
    }
  },
})
