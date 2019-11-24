/**
 * 创建唯一 Key
 * @returns {string} Key
 */
export function createKey() {
    return `WxToast_${new Date().getTime()}`
}