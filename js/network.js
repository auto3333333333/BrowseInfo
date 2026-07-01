// 💡 必ず先頭で localeManager をインポートします
import { localeManager } from './locale.js';

/**
 * ネットワーク状態を即座に取得する関数
 */
export function getNetworkInfo() {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    const info = {
        online: navigator.onLine 
            ? localeManager.t('status.online') 
            : localeManager.t('status.offline'),
        type: localeManager.t('status.unknown'),
        downlink: localeManager.t('status.na'),
        rtt: localeManager.t('status.na')
    };

    // 拡張APIがサポートされている場合のみ詳細を取得（Chrome / Android など）
    if (conn) {
        info.type = conn.effectiveType || conn.type || localeManager.t('status.unknown');
        info.downlink = conn.downlink ? `${conn.downlink} Mbps` : localeManager.t('status.na');
        info.rtt = conn.rtt ? `${conn.rtt} ms` : localeManager.t('status.na');
    }

    return info;
}

/**
 * ネットワーク状態の変化をリアルタイムに監視する関数
 * @param {Function} callback 変化時に実行するコールバック関数
 */
export function watchNetworkChanges(callback) {
    // オンライン・オフラインイベントの監視
    window.addEventListener('online', () => {
        callback(getNetworkInfo());
    });
    window.addEventListener('offline', () => {
        callback(getNetworkInfo());
    });

    // 通信速度や回線タイプの変化の監視
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
        conn.addEventListener('change', () => {
            callback(getNetworkInfo());
        });
    }
}