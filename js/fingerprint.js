// 💡 1行目にこれを追加して、共通インスタンスをインポートします
import { localeManager } from './locale.js';
/**
 * CanvasおよびAudioのフィンガープリント簡易生成モジュール
 */
export function generateFingerprints() {
    return {
        canvas: getCanvasFingerprint(),
        audio: getAudioFingerprint()
    };
}

/**
 * Canvas Fingerprintの生成
 */
function getCanvasFingerprint() {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return 'Not Supported';

        canvas.width = 200;
        canvas.height = 500;
        
        // テキストの描画、グラデーション、フォントのブレを誘発させる
        ctx.textBaseline = "top";
        ctx.font = "14px 'Arial'";
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "#f60";
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = "#069";
        ctx.fillText("BrowserInfo,💡iOS26-Glass!", 2, 15);
        ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
        ctx.fillText("BrowserInfo,💡iOS26-Glass!", 4, 17);

        const dataUrl = canvas.toDataURL();
        return cyrb128(dataUrl); // データのハッシュ化
    } catch (e) {
        return 'Blocked/Error';
    }
}

/**
 * Audio Fingerprintの生成
 */
function getAudioFingerprint() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return 'Not Supported';

        const ctx = new AudioContext();
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(10000, ctx.currentTime);
        gain.gain.setValueAtTime(0, ctx.currentTime); // ミュート状態
        
        oscillator.connect(gain);
        gain.connect(ctx.destination);
        
        // 音声ノードの内部パラメータの一部を抽出してハッシュ化のシードにする
        const fingerprint = oscillator.frequency.value + '_' + gain.gain.value;
        ctx.close();
        
        return cyrb128(fingerprint);
    } catch (e) {
        return 'Blocked/Error';
    }
}

/**
 * シンプルな文字列ハッシュ化ユーティリティ (cyrb128)
 */
function cyrb128(str) {
    let h1 = 1779033703, h2 = 3024733165, h3 = 336245363, h4 = 502494325;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    return ((h1^h2^h3^h4)>>>0).toString(16);
}