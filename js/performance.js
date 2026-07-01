// 💡 1行目にこれを追加して、共通インスタンスをインポートします
import { localeManager } from './locale.js';
/**
 * パフォーマンスおよびメモリ（利用可能な場合）の取得モジュール
 */
export function getPerformanceInfo() {
    const perfData = {
        loadTime: 'Calculating...',
        memoryLimit: 'N/A',
        memoryTotal: 'N/A',
        memoryUsed: 'N/A'
    };

    // ページ読み込み完了時のタイムスタンプ
    if (window.performance && window.performance.timing) {
        const t = window.performance.timing;
        perfData.loadTime = `${t.loadEventEnd - t.navigationStart} ms`;
    }

    // Chrome等のメモリ計測API (performance.memory)
    if (performance.memory) {
        perfData.memoryLimit = `${Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)} MB`;
        perfData.memoryTotal = `${Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)} MB`;
        perfData.memoryUsed = `${Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)} MB`;
    }

    return perfData;
}