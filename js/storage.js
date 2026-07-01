// 💡 1行目にこれを追加して、共通インスタンスをインポートします
import { localeManager } from './locale.js';
/**
 * ブラウザの各種ストレージ・クッキーの有効性と容量の取得モジュール
 */
export async function getStorageInfo() {
    const storageData = {
        cookieEnabled: navigator.cookieEnabled ? localeManager.t("storage.available") : localeManager.t("storage.blocked"),
        localStorage: checkStorageSupport('localStorage'),
        sessionStorage: checkStorageSupport('sessionStorage'),
        indexedDB: ('indexedDB' in window) ? localeManager.t("storage.available") : localeManager.t("storage.notsupported"),
        estimateQuota: localeManager.t("storage.unknown"),
        estimateUsage: localeManager.t("storage.unknown")
    };

    // StorageManager API を用いたクォータ（容量制限）の推定
    if (navigator.storage && navigator.storage.estimate) {
        try {
            const estimate = await navigator.storage.estimate();
            // バイトからメガバイト(MB)へ変換
            const quotaMB = (estimate.quota / (1024 * 1024)).toFixed(2);
            const usageMB = (estimate.usage / (1024 * 1024)).toFixed(2);
            
            storageData.estimateQuota = `${quotaMB} MB`;
            storageData.estimateUsage = `${usageMB} MB`;
        } catch (error) {
            console.warn('Storage estimate failed:', error);
        }
    }

    return storageData;
}

/**
 * Web Storage の実用可能性テスト
 */
function checkStorageSupport(type) {
    try {
        const storage = window[type];
        const x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return localeManager.t("storage.available");
    } catch (e) {
        return localeManager.t("storage.notavailable");
    }
}