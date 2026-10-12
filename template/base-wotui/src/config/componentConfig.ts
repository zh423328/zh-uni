/**** 此文件说明请看注释 *****/
// 模板项目没有后端版本接口，默认走「静态 version.json」零后端方案：
// 1. 复制 docs/version.example.json 填好真实内容，上传到任意静态服务器 / OSS / CDN
// 2. 把下面的 APP_VERSION_URL 改成该 json 的可直连地址
// 3. 后续发版只需要更新这个 json（递增 versionCode、更新 downloadUrl）
// 如果后端提供了版本接口，把 getServerNo 里的 uni.request 换成项目请求方法即可，
// 响应结构约定见 docs/app-update-release-guide.md「服务端接口字段约定」。
/**** 结束 *****/

// TODO: 替换为你的版本 json 直链
const APP_VERSION_URL = 'https://your-cdn.com/app/version.json';

const platform = uni.getSystemInfoSync().platform;

export default {
    // 发起请求获取服务端版本号
    getServerNo: (
        version: { versionCode: string | number; versionName: string },
        isPrompt = false,
        callback: (res: any) => void
    ) => {
        uni.request({
            url: APP_VERSION_URL,
            method: 'GET',
            success: (res: any) => {
                /* 响应结构见 docs/version.example.json，核心字段：
                 * | 参数名称        | 一定返回 | 类型     | 描述
                 * | ------------- | ------- | ------- | --------------------------
                 * | versionCode   | y       | int      | 版本号（数字，单调递增）
                 * | version       | y       | String   | 版本名称（弹窗标题展示）
                 * | versionInfo   | y       | String   | 版本信息（弹窗正文，兼容 updateContent 字段）
                 * | forceUpdate   | y       | Boolean  | true = 强制更新, false = 弹窗确认更新
                 * | updateType    | n       | String   | forcibly/solicit/silent，不填按 forceUpdate 推导
                 * | downloadUrl   | y       | String   | 下载链接（iOS 原生更新放 TestFlight 加入链接/App Store 链接）
                 */
                const data = res.data;
                if (!data || !data.update) return;

                // 按平台条目取值：Android 用 name=normal，iOS 用 name=ios
                const target = data.update.find(
                    (item: any) => item.name === (platform === 'ios' ? 'ios' : 'normal')
                );
                if (!target || !target.downloadUrl) return;

                const versionInfo: any = {
                    versionCode: target.versionCode,
                    versionName: target.version,
                    versionInfo: target.versionInfo ?? target.updateContent,
                    forceUpdate: target.forceUpdate,
                    downloadUrl: target.downloadUrl
                };
                // updateType：silent 仅当服务端直接下发时生效，否则按 forceUpdate 推导
                versionInfo.updateType =
                    target.updateType || (target.forceUpdate ? 'forcibly' : 'solicit');

                // 数字比较（服务端可能下发字符串版本号，字符串比较 "100" > "99" 为 false）
                const serverCode = parseInt(versionInfo.versionCode, 10);
                const localCode = parseInt(String(version.versionCode), 10);
                if (!isNaN(serverCode) && !isNaN(localCode) && serverCode > localCode) {
                    callback && callback(versionInfo);
                }
            }
        });
    },
    // 弹窗主颜色（不填默认粉色）
    appUpdateColor: 'f00',
    // 弹窗图标（plus.nativeObj.View 原生层不识别 @/ 别名，必须 /static 开头）
    appUpdateIcon: '/static/logo.png'
};
