import 'miniprogram-api-typings';
import { z } from 'zod';

import { AppOption } from '../../utils/app_context';
import { submitHuntScore } from './api';
import { HuntTask } from './types';

const app = getApp<AppOption>()


const HuntStateSchema = z.object({
  name: z.string().optional(),
  // task status only contains unlocked tasks
  taskStatus: z.record(
    z.union([z.literal('unlocked'), z.literal('correct'), z.literal('incorrect')])
  ),
  submittedScore: z.number().optional(),
});

type HuntState = z.infer<typeof HuntStateSchema>;


const STORAGE_HUNT_STATE_KEY = 'hunt_state_0709';
// const STORAGE_HUNT_SCORE_KEY = 'hunt_score';
const STORAGE_HUNT_SUBMITTED_SCORE_KEY = 'hunt_submitted_score';
const QRCODE_PREFIX = 'wedding99:';

// interface HuntState {
//   name?: string;
//   foundList: string[];
//   correctList: string[];
// }

const DEFAULT_HUNT_STATE: HuntState = {
  name: undefined,
  taskStatus: {},
  // // default -1, so that we will submit once when started
  // submittedScore: -1,
};

function readHuntStateFromStorage(): HuntState {
  const state = wx.getStorageSync(STORAGE_HUNT_STATE_KEY);
  try {
    return HuntStateSchema.parse(JSON.parse(state));
  } catch (e) {
    return { ... DEFAULT_HUNT_STATE };
  }
}

function writeHuntStateToStorage(state: HuntState) {
  wx.setStorageSync(STORAGE_HUNT_STATE_KEY, JSON.stringify(state));
}

async function submitHuntScoreIfRequired(huntState: HuntState) {
  if (!huntState.name) {
    return;
  }

  let score = Object.values(huntState.taskStatus).filter((x) => x === 'correct').length;
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
    },
  },

  modifyHuntState: function(modFn: ((s: HuntState) => HuntState)) {
    let huntState = readHuntStateFromStorage();
    huntState = modFn(huntState);
    writeHuntStateToStorage(huntState);
    this.setData({
      huntState,
    });
    return huntState;
  },

  onLoad: async function() {
    wx.showLoading({
      title: 'Loading',
    });
    this.setData(await app.context.getUiConfigUpdateData('hunt'));
    const globalConfig = await app.context.getGlobalConfigCached();
    // TODO: adjust taskStatus when globalConfig changes
    const huntState = readHuntStateFromStorage();
    this.setData({
      huntTasks: globalConfig.huntTasks,
      huntState,
    });

    wx.hideLoading();
  },

  onShow: function() {
    submitHuntScoreIfRequired(this.data.huntState);  // submit if not up-to-date, no wait
  },

  submitNameAndStart: function(e: WechatMiniprogram.Input) {
    if (e.detail.value.length > 0) {
      this.modifyHuntState((s) => {
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
          this.modifyHuntState((_) => {
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
    const filteredTasks = this.data.huntTasks.filter(x => x.id === taskId);

    if (filteredTasks.length === 0) {
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
    this.modifyHuntState(s => {
      s.taskStatus[taskId] = 'unlocked';
      return s;
    });
  },
})
