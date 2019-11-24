# 微信小程序 Toast 管理工具

一个纯 JS 实现的工具库，用于解决微信小程序 showToast 和 showLoading 使用同一个单例，造成的冲突问题。

## 安装

`npm install wx-toast --save`

## 使用

- 微信小程序原生

```js
const WxToast = require('wx-toast');

// 实例化
// 建议仅实例化一次，然后挂载到全局
// 不然还是会造成混乱
// app.js
App({
    $toast: new WxToast(),
});

// 在页面中调用
Page({
    onReady: function() {
        // 显示 Toast
        getApp().$toast.showToast({
            title: 'Ready',
            icon: 'none',
        });

        // 显示 Loading
        const loadingKey = getApp().$toast.showLoading({
            title: '加载中...',
        });

        // 隐藏 Loading
        setTimeout(function() {
            getApp().$toast.hideLoading(loadingKey);
        }, 5000);
    },
});
```

- UniApp

```js
// 实例化
// app.vue
import WxToast from 'wx-toast';

export default {
    onLaunch() {
        getApp().globalData.$toast = new WxToast({
            showToast: uni.showToast,
            hideToast: uni.hideToast,
        });
    },
};

// 在页面中调用
export default {
    onLoad() {
        // 显示 Toast
        getApp().globalData.$toast.showToast({
            title: 'Ready',
            icon: 'none',
        });

        // 显示 Loading
        const loadingKey = getApp().globalData.$toast.showLoading({
            title: '加载中...',
        });

        // 隐藏 Loading
        setTimeout(function() {
            getApp().globalData.$toast.hideLoading(loadingKey);
        }, 5000);
    },
};
```

## License

The MIT License (MIT)