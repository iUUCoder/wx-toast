import { createKey } from './utils.js';

// 默认配置
const DEFAULT_OPTIONS = {
    showToast: wx.showToast,    // 底层的展示 Toast 方法
    hideToast: wx.hideToast,    // 底层的隐藏 Toast 方法
    defaultDuration: 1500,      // Toast 默认展示时长
    callbackWhenAbort: false    // 主动隐藏 Toast 和 Loading 时，是否触发 hide 回调
}

// 自维护定时器处理 Toas 展示和隐藏
// 底层调用 showToas 的时候，传递一个超长的时长
const HOLD_DURATION = 3600 * 1000;

/**
 * 微信 Toast 管理模块
 */
class WxToast {
    /**
     * 微信 Toast 管理模块
     * @param {?object} options 模块配置
     * @param {?Function} [showToast=wx.showToast] 展示 Toast 的底层方法，默认为 wx.showToast
     * @param {?Function} [hideToast=wx.hideToast] 隐藏 Toast 的底层方法，默认为 wx.hideToast
     * @param {?number} [defaultDuration=1500] Toast 展示时长的默认值
     * @param {?boolean} [callbackWhenAbort=false] 主动隐藏 Toast 和 Loading 时，是否触发 hide 回调
     */
    constructor(options = {}) {
        // 底层配置
        this._showToast = options && typeof options.showToast === 'function' ? options.showToast : DEFAULT_OPTIONS.showToast;
        this._hideToast = options && typeof options.hideToast === 'function' ? options.hideToast : DEFAULT_OPTIONS.hideToast;
        this._defaultDuration = options && options.defaultDuration > 0 ? options.defaultDuration : DEFAULT_OPTIONS.defaultDuration;
        this._callbackWhenAbort = options && typeof options.callbackWhenAbort === 'boolean' ? options.callbackWhenAbort : DEFAULT_OPTIONS.callbackWhenAbort;

        // 队列
        this._queue = [];
    }

    /**
     * 调用底层方法控制 Toast 展示和隐藏
     * @param {?object} options Toast 参数
     */
    _setToast(options) {
        setTimeout(() => {
            if (options) {
                this._showToast({
                    ...options,
                    duration: HOLD_DURATION
                })
            } else {
                this._hideToast();
            }
        }, 0);
    }

    /**
     * 添加条目到队列
     * @param {object} params 参数
     * @param {string} [params.key=createKey()] 唯一标识
     * @param {string} [params.type='toast'] 类型：toast、loading
     * @param {object} [params.options={}] 传递给底层 Toast 的参数
     */
    _addItemToQueue({ key = createKey(), type = 'toast', options = {} }) {
        this._setToast(options);
        this._queue.push({ key, type, options });

        if (type === 'toast') {
            setTimeout(() => {
                this._removeItemFromQueue({ key });
            }, options.duration > 0 ? options.duration : this._defaultDuration);
        }
    }

    /**
     * 从队列中移除条目
     * 可通过 key 移除指定条目，也可以通过 type 移除指定类型的所有条目
     * @param {object} params 参数
     * @param {?string} params.key 唯一标识
     * @param {?string} [params.type='toast'] 类型：toast、loading
     * @param {?boolean} [params.abort=false] 是否是调用 hideToast 或 hideLoading 方法主动移除的
     */
    _removeItemFromQueue({ key, type = 'toast', abort = false }) {
        // 过滤队列
        let targets = [];
        const queue = this._queue.filter(item => {
            if (key) {
                if (key === item.key) {
                    targets.push(item);
                    return false;
                }
            } else if (type === item.type) {
                targets.push(item);
                return false;
            }
            return true;
        })

        this._setToast(queue.length > 0 ? queue[queue.length - 1].options : null);
        this._queue = queue;

        // 触发回调
        if (abort && !this._callbackWhenAbort) return;
        // 触发回调
        targets.forEach(item => {
            if (item.options && typeof item.options.hide === 'function') {
                item.options.hide();
            }
        })
    }

    /**
     * 显示 Toast
     * @param {?object} options 参数，同 wx.showToast
     * @param {?Function} options.hide 拓展参数，Toast 隐藏时的回调
     * @returns {string} Toast 的唯一标识
     */
    showToast(options = {}) {
        const key = createKey();
        const opt = Object.assign({}, options);
        this._addItemToQueue({ key, type: 'toast', options: opt })
        return key;
    }

    /**
     * 隐藏 Toast
     * @param {?string} key Toast 的唯一标识，不传则清理队列中所有 Toast
     */
    hideToast(key) {
        this._removeItemFromQueue({ key, type: 'toast', abort: true });
    }

    /**
     * 显示 Loading
     * @param {?object} options 参数，同 wx.showLoading
     * @param {?Function} options.hide 拓展参数，Loading 隐藏时的回调
     * @returns {string} Loading 的唯一标识
     */
    showLoading(options) {
        const key = createKey();
        const opt = Object.assign({}, options, { icon: 'loading', mask: true });
        this._addItemToQueue({ key, type: 'loading', options: opt });
        return key;
    }

    /**
     * 隐藏 Loading
     * @param {?string} key Loading 的唯一标识，不传则清理队列中所有 Loading
     */
    hideLoading(key) {
        this._removeItemFromQueue({ key, type: 'loading' });
    }
}

export default WxToast;