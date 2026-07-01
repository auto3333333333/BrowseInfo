// 💡 1行目にこれを追加して、共通インスタンスをインポートします
import { localeManager } from './locale.js';
/**
 * ブラウザの基本情報および対応APIのチェックモジュール
 */
export function getBrowserInfo() {
    return {
        name: parseBrowserName(),
        userAgent: navigator.userAgent,
        language: navigator.language,
        languages: navigator.languages.join(', '),
        cookieEnabled: navigator.cookieEnabled ? 'Yes' : 'No',
        pdfViewerEnabled: navigator.pdfViewerEnabled ? 'Yes' : 'No',
        webdriver: navigator.webdriver ? 'Yes (Automated)' : 'No',
        maxTouchPoints: navigator.maxTouchPoints || 0
    };
}

function parseBrowserName() {
    const ua = navigator.userAgent;
    if (ua.includes("Firefox")) return "Mozilla Firefox";
    if (ua.includes("Edg")) return "Microsoft Edge";
    if (ua.includes("Chrome")) return "Google Chrome";
    if (ua.includes("Safari")) return "Apple Safari";
    return "Unknown Browser";
}