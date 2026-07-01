// 💡 1行目にこれを追加して、共通インスタンスをインポートします
import { localeManager } from './locale.js';
/**
 * デバイスのハードウェアスペック取得モジュール
 */
export function getDeviceInfo() {
    return {
        cores: navigator.hardwareConcurrency || 'Unknown',
        memory: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'Unknown',
        platform: navigator.platform || 'Unknown',
        architecture: parseArchitecture()
    };
}

function parseArchitecture() {
    const ua = navigator.userAgent;
    if (ua.includes("Win64") || ua.includes("x64")) return "64-bit (x64)";
    if (ua.includes("arm64") || ua.includes("iPhone")) return "ARM64";
    return "32-bit or Unknown";
}