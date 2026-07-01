// 💡 1行目にこれを追加して、共通インスタンスをインポートします
import { localeManager } from './locale.js';
/**
 * 各種APIの権限（Permissions）状態の確認モジュール
 */
export async function checkPermissions() {
    const permissionsToTest = ['geolocation', 'notifications', 'camera', 'microphone', 'clipboard-read'];
    const results = {};

    if (!navigator.permissions) {
        return { status: localeManager.t('permission.unsupported') };
    }

    for (const name of permissionsToTest) {
        try {
            const result = await navigator.permissions.query({ name });
            results[name] = result.state; // 'granted', 'denied', 'prompt'
        } catch (e) {
            results[name] = localeManager.t("permission.error");
        }
    }

    return results;
}