// 💡 locale.js から共通インスタンスをインポート
import { localeManager } from './locale.js';
/**
 * WebGLおよびWebGPU経由でのGPU詳細情報取得モジュール
 */
export async function getGPUInfo() {
    const gpuData = {
        webglSupported: false,
        webgpuSupported: false,
        vendor: localeManager.t("gpu.unknown"),
        renderer: localeManager.t("gpu.unknown"),
        webgpuAdapter: localeManager.t("gpu.notavailable")
    };

    // 1. WebGLによるグラフィックチップ情報の取得
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (gl) {
        gpuData.webglSupported = true;
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            gpuData.vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
            gpuData.renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        } else {
            gpuData.vendor = gl.getParameter(gl.VENDOR);
            gpuData.renderer = gl.getParameter(gl.RENDERER);
        }
    }

    // 2. WebGPUのサポート状況とアダプター情報の取得（非同期）
    if (navigator.gpu) {
        gpuData.webgpuSupported = true;
        try {
            const adapter = await navigator.gpu.requestAdapter();
            if (adapter) {
                // アダプターのプロパティ（アーキテクチャやベンダー）が取得可能な場合
                gpuData.webgpuAdapter = adapter.info?.architecture || localeManager.t("gpu.active");
            }
        } catch (e) {
            gpuData.webgpuAdapter = localeManager.t("gpu.failed");
        }
    }

    return gpuData;
}