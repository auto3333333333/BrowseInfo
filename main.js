// 全モジュールのインポート
import { detectDevice } from './js/detect.js';
import { initTheme } from './js/theme.js';
import { localeManager } from './js/locale.js';
import { initPWA } from './js/pwa.js';
import { initBattery } from './js/battery.js';
import { initScreen, watchScreenChanges } from './js/screen.js';
import { getBrowserInfo } from './js/browser.js';
import { getDeviceInfo } from './js/device.js';
import { getGPUInfo } from './js/gpu.js';
import { getStorageInfo } from './js/storage.js';
import { getMediaDevices } from './js/media.js';
import { getNetworkInfo } from './js/network.js';
import { checkPermissions } from './js/permissions.js';
import { getPerformanceInfo } from './js/performance.js';
import { generateFingerprints } from './js/fingerprint.js';
import { getGeolocation } from './js/sensors.js';
import { startRealtimeMonitoring } from './js/realtime.js';
import { copyToClipboard, exportToJSON, exportToCSV, exportToPDF } from './js/export.js';

// 全取得データを保持するグローバルキャッシュ（エクスポート用）
let masterSnapshot = {};
// ========================================================
// 修正版：言語切り替え時の再描写ロジック (main.js)
// ========================================================

// 画面全体のデータ描写を一度に行う関数を定義する
async function renderDashboardContents() {
    // 1. 静的＆初期ハードウェア情報のパース・レンダリング
    const deviceType = detectDevice();
    updateDeviceUI(deviceType);

    const browser = getBrowserInfo();
    document.getElementById('br-name').textContent = browser.name;
    document.getElementById('br-ua').textContent = browser.userAgent;
    document.getElementById('br-lang').textContent = browser.language;
    document.getElementById('br-pdf').textContent = browser.pdfViewerEnabled;

    const device = getDeviceInfo();
    document.getElementById('dev-cores').textContent = device.cores;
    document.getElementById('dev-mem').textContent = device.memory;
    document.getElementById('dev-plat').textContent = device.platform;
    document.getElementById('dev-arch').textContent = device.architecture;

    const screenInfo = initScreen();
    document.getElementById('scr-res').textContent = screenInfo.getResolution();
    document.getElementById('scr-win').textContent = screenInfo.getWindowSize();
    document.getElementById('scr-orient').textContent = screenInfo.getOrientation();
    document.getElementById('scr-dpr').textContent = screenInfo.getPixelRatio();

    // 非同期(Promise)で取得するGPUやストレージも再取得して描写
    const gpu = await getGPUInfo();
    document.getElementById('gpu-vendor').textContent = gpu.vendor;
    document.getElementById('gpu-renderer').textContent = gpu.renderer;
    document.getElementById('gpu-webgpu').textContent = gpu.webgpuSupported ? "Yes" : "No";
    document.getElementById('gpu-adapter').textContent = gpu.webgpuAdapter;

    const storage = await getStorageInfo();
    document.getElementById('st-cookie').textContent = storage.cookieEnabled;
    document.getElementById('st-local').textContent = storage.localStorage;
    document.getElementById('st-idb').textContent = storage.indexedDB;
    document.getElementById('st-quota').textContent = storage.estimateQuota;
    document.getElementById('st-usage').textContent = storage.estimateUsage;

    const media = await getMediaDevices();
    document.getElementById('media-cam').textContent = media.camera;
    document.getElementById('media-mic').textContent = media.microphone;
    document.getElementById('media-spk').textContent = media.speaker;

    const network = getNetworkInfo();
    document.getElementById('net-online').textContent = network.online;
    document.getElementById('net-type').textContent = network.type;
    document.getElementById('net-downlink').textContent = network.downlink;
    document.getElementById('net-rtt').textContent = network.rtt;

    const perms = await checkPermissions();
    document.getElementById('perm-geo').textContent = perms.geolocation || 'N/A';
    document.getElementById('perm-notify').textContent = perms.notifications || 'N/A';
    document.getElementById('perm-cam').textContent = perms.camera || 'N/A';
    document.getElementById('perm-mic').textContent = perms.microphone || 'N/A';

    const fingerprints = generateFingerprints();
    document.getElementById('fp-canvas').textContent = fingerprints.canvas;
    document.getElementById('fp-audio').textContent = fingerprints.audio;

    document.querySelector('[data-i18n="menu.disclaimer"]').textContent = localeManager.t('menu.disclaimer');

    // エクスポート用のスナップショットデータも新しい言語情報で更新
    buildSnapshot(browser, device, gpu, storage, fingerprints);
}

function initThemeSystem() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const body = document.body;

    // 1. ローカルストレージから保存されたテーマを読み込む（なければデフォルトはダーク）
    const savedTheme = localStorage.getItem('theme') || 'dark';
    
    if (savedTheme === 'light') {
        body.classList.add('light-theme');
        if (themeIcon) themeIcon.textContent = '☀️';
    } else {
        body.classList.remove('light-theme');
        if (themeIcon) themeIcon.textContent = '🌙';
    }

    // ツールチップの文言を動的に更新する関数
    function updateThemeTooltip() {
        if (!themeToggleBtn) return;
        
        const isCurrentLight = body.classList.contains('light-theme');
        let tooltipText = "";

        // 言語設定(localeManager)から文言を取得
        if (isCurrentLight) {
            tooltipText = localeManager.t('menu.theme_to_dark' || 'Switch to Dark Theme (Current: Light)');
        } else {
            tooltipText = localeManager.t('menu.theme_to_light' || 'Switch to Light Theme (Current: Dark)');
        }

        // ボタンのホバーテキスト(title)を書き換える
        themeToggleBtn.setAttribute('title', tooltipText);
    }

    // 初回起動時と、言語が切り替わったときにもツールチップを更新できるようにする
    updateThemeTooltip();

    // 2. ボタンがクリックされたときの切り替えイベント
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isLight = body.classList.contains('light-theme');
            
            if (isLight) {
                // ライト ➔ ダークへ
                body.classList.remove('light-theme');
                if (themeIcon) themeIcon.textContent = '🌙';
                localStorage.setItem('theme', 'dark'); // 記憶する
            } else {
                // ダーク ➔ ライトへ
                body.classList.add('light-theme');
                if (themeIcon) themeIcon.textContent = '☀️';
                localStorage.setItem('theme', 'light'); // 記憶する
            }

            // ホバー時のテキストも即座に更新
            updateThemeTooltip();
        });
    }

    // 言語切り替えイベント(change)の後にもこれを呼び出せるよう、グローバルに参照可能にしておくと便利です
    window.updateThemeTooltipText = updateThemeTooltip;
}

document.addEventListener('DOMContentLoaded', async () => {
    // 1. 国際化(多言語)システムの初期化
    await localeManager.init();
    
    const langSelector = document.getElementById('lang-selector');
    langSelector.value = localeManager.currentLang;
    
    // 初回起動時のデータ描写を実行
    await renderDashboardContents();
    // 💡 言語セレクターが変更された時のイベントリスナーを修正
    langSelector.addEventListener('change', async (e) => {
        // 新しい言語のJSONをロードしてDOM(data-i18n)を翻訳
        await localeManager.loadLocale(e.target.value);
        
        // 💡 ここが重要：言語が変わったらJavaScript管理のコンテンツも再取得・再描写する！
        await renderDashboardContents();

        if (window.updateThemeTooltipText) window.updateThemeTooltipText();
    });

    // 2. テーマ(ライト/ダーク)の初期化
    initThemeSystem();

    // 3. PWA機能の登録
    initPWA();

    // 4. リアルタイム監視・常時ループ系の起動（これらは言語依存が少ない、または自動更新される）
    initBattery();
    
    // FPSカウンターの開始
    if (typeof startFPSCounter === 'function') {
        startFPSCounter();
    }
    
    // 定期的なパフォーマンス（メモリ）更新ループ
    setInterval(() => {
        const perf = getPerformanceInfo();
        document.getElementById('perf-load').textContent = perf.loadTime;
        document.getElementById('perf-limit').textContent = perf.memoryLimit;
        document.getElementById('perf-total').textContent = perf.memoryTotal;
        document.getElementById('perf-used').textContent = perf.memoryUsed;
    }, 2000);

    // センサー・位置情報要求
    getGeolocation(
        (coords) => {
            document.getElementById('sns-lat').textContent = coords.latitude;
            document.getElementById('sns-lng').textContent = coords.longitude;
        },
        (err) => {
            document.getElementById('sns-lat').textContent = `Blocked (${err})`;
            document.getElementById('sns-lng').textContent = `Blocked (${err})`;
        }
    );

    // 統合リアルタイムストリームのリスナー設定
    startRealtimeMonitoring((update) => {
        animateChange(update);
    });

    // 各種データエクスポートのイベント設定
    document.getElementById('btn-copy').addEventListener('click', async () => {
        const success = await copyToClipboard(masterSnapshot);
        if(success) alert('Copied to clipboard!');
    });
    document.getElementById('btn-export-json').addEventListener('click', () => {
        exportToJSON(masterSnapshot);
    });
    document.getElementById('btn-export-csv').addEventListener('click', () => {
        exportToCSV(masterSnapshot);
    });
    document.getElementById('btn-export-pdf').addEventListener('click', () => {
        exportToPDF();
    });
    const overlay = document.getElementById('detail-overlay');
    const overlayTitle = document.getElementById('overlay-title');
    const overlayContent = document.getElementById('overlay-content');
    const closeBtn = document.getElementById('overlay-close-btn');

    if (overlay && overlayTitle && overlayContent && closeBtn) {

        // クリック可能なすべてのカードにイベントをバインド
        document.querySelectorAll('.clickable-card').forEach(card => {
            card.addEventListener('click', async () => {
                const targetCategory = card.getAttribute('data-detail');
                
                // ローディング表示
                overlayContent.innerHTML = `<div class="metric-item">${localeManager.t('status.detecting')}</div>`;
                overlay.classList.add('active');

                // 各カテゴリに応じた詳細レポートの生成
                switch (targetCategory) {
                    
                    // 1. API Permissions (権限)
                    case 'permissions': {
                        overlayTitle.textContent = `${localeManager.t('categories.permissions')} - ${localeManager.t('status.detail_title')}`;
                        const perms = await checkPermissions();
                        overlayContent.innerHTML = `
                            <div class="metric-item"><span class="label">Geolocation</span><span class="value">${perms.geolocation || 'N/A'}</span></div>
                            <div class="metric-item"><span class="label">Notifications</span><span class="value">${perms.notifications || 'N/A'}</span></div>
                            <div class="metric-item"><span class="label">Camera</span><span class="value">${perms.camera || 'N/A'}</span></div>
                            <div class="metric-item"><span class="label">Microphone</span><span class="value">${perms.microphone || 'N/A'}</span></div>
                            <div class="metric-item"><span class="label">Clipboard Read</span><span class="value">${perms['clipboard-read'] || 'N/A'}</span></div>
                            <div class="desc-text" style="margin-top:20px; font-size:0.85rem; color:var(--text-muted); line-height:1.6;">
                                ${localeManager.t('permission.description')}
                            </div>
                        `;
                        break;
                    }

                    // 2. Network (ネットワーク詳細 ＆ クオリティ判定)
                    case 'network': {
                        overlayTitle.textContent = `${localeManager.t('categories.network')} - ${localeManager.t('status.detail_title')}`;
                        const net = getNetworkInfo();
                        
                        // 通信環境から快適度をシミュレート
                        const rawDownlink = navigator.connection ? navigator.connection.downlink : 0;
                        let videoStatus = "◯";
                        let gameStatus = "◯";
                        if (rawDownlink >= 20) { videoStatus = "◎ (4K)"; gameStatus = "◎ (Fast)"; }
                        else if (rawDownlink < 5) { videoStatus = "△ (Low)"; gameStatus = "△ (Lag)"; }

                        overlayContent.innerHTML = `
                            <div class="metric-item"><span class="label">${localeManager.t('network_detail.status')}</span><span class="value">${net.online}</span></div>
                            <div class="metric-item"><span class="label">${localeManager.t('network_detail.type')}</span><span class="value" style="text-transform:uppercase;">${net.type}</span></div>
                            <div class="metric-item"><span class="label">${localeManager.t('network_detail.network')}</span><span class="value">${net.downlink}</span></div>
                            <div class="metric-item"><span class="label">${localeManager.t('network_detail.rtt')}</span><span class="value">${net.rtt}</span></div>
                            <div class="metric-item"><span class="label">${localeManager.t('network_detail.saver')}</span><span class="value">${navigator.connection && navigator.connection.saveData ? 'Enabled' : 'Disabled'}</span></div>
                            
                            <h4 style="margin:24px 0 12px; font-size:1rem; color:var(--accent);">${localeManager.t('network_detail.sim_title')}</h4>
                            <div class="metric-item"><span class="label">${localeManager.t('network_detail.video')}</span><span class="value">${videoStatus}</span></div>
                            <div class="metric-item"><span class="label">${localeManager.t('network_detail.gaming')}</span><span class="value">${gameStatus}</span></div>
                        `;
                        break;
                    }

                    // 3. Graphics / GPU (WebGL拡張機能の全列挙)
                    case 'gpu': {
                        overlayTitle.textContent = `${localeManager.t('categories.gpu')} - ${localeManager.t('status.detail_title')}`;
                        
                        const canvas = document.createElement('canvas');
                        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                        let extListHTML = `<div class="desc-text">WebGL not supported</div>`;
                        let maxTextureSize = 'Unknown';

                        if (gl) {
                            maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) + " x " + gl.getParameter(gl.MAX_TEXTURE_SIZE);
                            const exts = gl.getSupportedExtensions();
                            extListHTML = exts.map(ext => `<span class="card-locale-badge" style="margin:4px; display:inline-block; text-transform:none;">${ext}</span>`).join('');
                        }

                        overlayContent.innerHTML = `
                            <div class="metric-item"><span class="label">${localeManager.t('gpu_detail.max_texture')}</span><span class="value">${maxTextureSize}</span></div>
                            <h4 style="margin:24px 0 12px; font-size:1rem; color:var(--accent);">${localeManager.t('gpu_detail.extensions')}</h4>
                            <div style="background:rgba(0,0,0,0.2); padding:12px; border-radius:16px; max-height:200px; overflow-y:auto; word-break:break-all;">
                                ${extListHTML}
                            </div>
                        `;
                        break;
                    }

                    // 4. Media Devices (機材の製品名リスト)
                    case 'mediaDevices': {
                        overlayTitle.textContent = `${localeManager.t('categories.media' || 'Media Devices')} - ${localeManager.t('status.detail_title')}`;
                        
                        try {
                            // ハードウェアのデバイス一覧を取得
                            const devices = await navigator.mediaDevices.enumerateDevices();
                            let listHTML = '';

                            devices.forEach((device, index) => {
                                const label = device.label || `Device #${index + 1} (Name hidden due to lack of permission)`;
                                let icon = '📁';
                                if (device.kind === 'videoinput') icon = '📷';
                                if (device.kind === 'audioinput') icon = '🎙️';
                                if (device.kind === 'audiooutput') icon = '🔊';

                                listHTML += `
                                    <div class="metric-item">
                                        <span class="label">${icon} ${device.kind.replace('input', ' Input').replace('output', ' Output')}</span>
                                        <span class="value" style="font-size:0.85rem; max-width:240px; text-align:right;">${label}</span>
                                    </div>
                                `;
                            });

                            overlayContent.innerHTML = listHTML || `<div class="metric-item">No connected hardware devices found.</div>`;
                        } catch (err) {
                            overlayContent.innerHTML = `<div class="metric-item" style="color:#ef4444;">Failed to load devices: ${err.message}</div>`;
                        }
                        break;
                    }

                    // 5. Performance & Memory (読み込みタイムライン)
                    case 'performance': {
                        overlayTitle.textContent = `${localeManager.t('categories.performance')} - ${localeManager.t('status.detail_title')}`;
                        
                        let loadTimelineHTML = '';
                        if (window.performance && window.performance.timing) {
                            const t = window.performance.timing;
                            const dnsTime = t.domainLookupEnd - t.domainLookupStart;
                            const tcpTime = t.connectEnd - t.connectStart;
                            const domTime = t.domComplete - t.domLoading;
                            
                            loadTimelineHTML = `
                                <h4 style="margin:0 0 12px; font-size:1rem; color:var(--accent);">Navigation Timing</h4>
                                <div class="metric-item"><span class="label">DNS Lookup</span><span class="value">${dnsTime} ms</span></div>
                                <div class="metric-item"><span class="label">TCP Handshake</span><span class="value">${tcpTime} ms</span></div>
                                <div class="metric-item"><span class="label">DOM Parsing</span><span class="value">${domTime} ms</span></div>
                            `;
                        }

                        // メモリ使用率のシミュレーションバー
                        let memoryBarHTML = '';
                        if (performance.memory) {
                            const m = performance.memory;
                            const percent = Math.round((m.usedJSHeapSize / m.totalJSHeapSize) * 100);
                            memoryBarHTML = `
                                <h4 style="margin:24px 0 12px; font-size:1rem; color:var(--accent);">JS Heap Memory Usage</h4>
                                <div style="background:rgba(255,255,255,0.1); height:12px; border-radius:6px; overflow:hidden; margin-bottom:8px;">
                                    <div style="background:var(--accent); width:${percent}%; height:100%; transition:width 0.5s ease;"></div>
                                </div>
                                <div class="metric-item"><span class="label">Heap Allocation Usage</span><span class="value">${percent}%</span></div>
                            `;
                        }

                        overlayContent.innerHTML = (loadTimelineHTML + memoryBarHTML) || `<div>Performance API not fully supported.</div>`;
                        break;
                    }
                }
            });
        });

        // 閉じる処理
        closeBtn.addEventListener('click', () => overlay.classList.remove('active'));
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.remove('active');
        });
    } else {
        console.error("オーバーレイに必要なHTML要素（#detail-overlay など）が見つかりません。");
    }
});

/**
 * デバイス自動判定に基づくCSSレイアウト・バッジのトグル
 */
function updateDeviceUI(device) {
    const badge = document.getElementById('device-badge');
    badge.textContent = `${device.os} / ${device.type}`;
    
    const styleLink = document.getElementById('device-style');
    if (device.type === 'iPhone') {
        styleLink.href = 'css/iphone.css';
    } else if (device.type === 'Android') {
        styleLink.href = 'css/android.css';
    } else {
        styleLink.href = 'css/desktop.css';
    }
}

/**
 * リアルタイム変動値変更時の滑らかなフェードアニメーション
 */
function animateChange(update) {
    let el = null;
    let newValue = "";

    if (update.category === 'screen' && update.data.windowSize) {
        el = document.getElementById('scr-win');
        newValue = update.data.windowSize;
    } else if (update.category === 'screen' && update.data.orientation) {
        el = document.getElementById('scr-orient');
        newValue = update.data.orientation;
    } else if (update.category === 'network') {
        const netData = update.data;
        // ネットワークカードの各要素を安全に更新
        updateElementWithAnimation('net-online', netData.online);
        updateElementWithAnimation('net-type', netData.type);
        updateElementWithAnimation('net-downlink', netData.downlink);
        updateElementWithAnimation('net-rtt', netData.rtt);
    } else if (update.category === 'sensors' && update.data.alpha) {
        document.getElementById('sns-alpha').textContent = update.data.alpha;
        document.getElementById('sns-beta').textContent = update.data.beta;
        document.getElementById('sns-gamma').textContent = update.data.gamma;
        return;
    }

    if (el && el.textContent !== newValue) {
        el.style.opacity = 0.3;
        setTimeout(() => {
            el.textContent = newValue;
            el.style.opacity = 1;
            el.style.transition = "opacity 0.2s ease";
        }, 100);
    }
}

/**
 * エクスポート用の静的データスナップショット構築
 */
function buildSnapshot(browser, device, gpu, storage, fingerprints) {
    masterSnapshot = {
        timestamp: new Date().toISOString(),
        browser: browser,
        device: device,
        gpu: gpu,
        storage: storage,
        fingerprints: fingerprints
    };
}

// 文字列が変わったときだけふわっとアニメーションさせる共通ヘルパー
function updateElementWithAnimation(id, newValue) {
    const el = document.getElementById(id);
    if (el && el.textContent !== newValue) {
        el.style.opacity = 0.3;
        setTimeout(() => {
            el.textContent = newValue;
            el.style.opacity = 1;
            el.style.transition = "opacity 0.2s ease";
        }, 100);
    }
}

// FPS（リフレッシュレート）リアルタイム計測ロジック
function startFPSCounter() {
    const fpsElement = document.getElementById('scr-fps');
    if (!fpsElement) {
        console.error("FPSを表示する要素（#scr-fps）が見つかりません。");
        return;
    }

    let lastFpsTime = performance.now();
    let frames = 0;

    function calculateFPS() {
        frames++;
        const now = performance.now();
        
        // 1秒（1000ミリ秒）ごとにFPSを計算して画面を更新
        if (now >= lastFpsTime + 10) {
            const fps = Math.round((frames * 1000) / (now - lastFpsTime));
            
            // 画面の書き換え（フェードなどのエフェクトを入れず一瞬で更新）
            fpsElement.textContent = `${fps} FPS`;
            
            frames = 0;
            lastFpsTime = now;
        }
        
        // ループを継続
        requestAnimationFrame(calculateFPS);
    }

    // ループを開始
    requestAnimationFrame(calculateFPS);
}

/* export function initOverlayManager() {
    const overlay = document.getElementById('detail-overlay');
    const overlayTitle = document.getElementById('overlay-title');
    const overlayContent = document.getElementById('overlay-content');
    const closeBtn = document.getElementById('overlay-close-btn');

    if (!overlay || !overlayTitle || !overlayContent) return;

    // クリック可能なすべてのカードにイベントをバインド
    document.querySelectorAll('.clickable-card').forEach(card => {
        card.addEventListener('click', async () => {
            const targetCategory = card.getAttribute('data-detail');
            
            // ローディング表示
            overlayContent.innerHTML = `<div class="metric-item">${localeManager.t('status.detecting')}</div>`;
            overlay.classList.add('active');

            // 各カテゴリに応じた詳細レポートの生成
            switch (targetCategory) {
                
                // 1. API Permissions (権限)
                case 'permissions': {
                    overlayTitle.textContent = `${localeManager.t('categories.permissions')} - ${localeManager.t('status.detail_title')}`;
                    const perms = await checkPermissions();
                    overlayContent.innerHTML = `
                        <div class="metric-item"><span class="label">Geolocation</span><span class="value">${perms.geolocation || 'N/A'}</span></div>
                        <div class="metric-item"><span class="label">Notifications</span><span class="value">${perms.notifications || 'N/A'}</span></div>
                        <div class="metric-item"><span class="label">Camera</span><span class="value">${perms.camera || 'N/A'}</span></div>
                        <div class="metric-item"><span class="label">Microphone</span><span class="value">${perms.microphone || 'N/A'}</span></div>
                        <div class="metric-item"><span class="label">Clipboard Read</span><span class="value">${perms['clipboard-read'] || 'N/A'}</span></div>
                        <div class="desc-text" style="margin-top:20px; font-size:0.85rem; color:var(--text-muted); line-height:1.6;">
                            ${localeManager.t('permission.description')}
                        </div>
                    `;
                    break;
                }

                // 2. Network (ネットワーク詳細 ＆ クオリティ判定)
                case 'network': {
                    overlayTitle.textContent = `${localeManager.t('categories.network')} - ${localeManager.t('status.detail_title')}`;
                    const net = getNetworkInfo();
                    
                    // 通信環境から快適度をシミュレート
                    const rawDownlink = navigator.connection ? navigator.connection.downlink : 0;
                    let videoStatus = "◯";
                    let gameStatus = "◯";
                    if (rawDownlink >= 20) { videoStatus = "◎ (4K)"; gameStatus = "◎ (Fast)"; }
                    else if (rawDownlink < 5) { videoStatus = "△ (Low)"; gameStatus = "△ (Lag)"; }

                    overlayContent.innerHTML = `
                        <div class="metric-item"><span class="label">Connection Status</span><span class="value">${net.online}</span></div>
                        <div class="metric-item"><span class="label">Network Type</span><span class="value" style="text-transform:uppercase;">${net.type}</span></div>
                        <div class="metric-item"><span class="label">Estimated Speed</span><span class="value">${net.downlink}</span></div>
                        <div class="metric-item"><span class="label">Round Trip Time (RTT)</span><span class="value">${net.rtt}</span></div>
                        <div class="metric-item"><span class="label">Data Saver Mode</span><span class="value">${navigator.connection && navigator.connection.saveData ? 'Enabled' : 'Disabled'}</span></div>
                        
                        <h4 style="margin:24px 0 12px; font-size:1rem; color:var(--accent);">Experience Simulation</h4>
                        <div class="metric-item"><span class="label">4K Video Streaming</span><span class="value">${videoStatus}</span></div>
                        <div class="metric-item"><span class="label">Online Gaming</span><span class="value">${gameStatus}</span></div>
                    `;
                    break;
                }

                // 3. Graphics / GPU (WebGL拡張機能の全列挙)
                case 'gpu': {
                    overlayTitle.textContent = `${localeManager.t('categories.gpu')} - ${localeManager.t('status.detail_title')}`;
                    
                    const canvas = document.createElement('canvas');
                    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                    let extListHTML = `<div class="desc-text">WebGL not supported</div>`;
                    let maxTextureSize = 'Unknown';

                    if (gl) {
                        maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) + " x " + gl.getParameter(gl.MAX_TEXTURE_SIZE);
                        const exts = gl.getSupportedExtensions();
                        extListHTML = exts.map(ext => `<span class="card-locale-badge" style="margin:4px; display:inline-block; text-transform:none;">${ext}</span>`).join('');
                    }

                    overlayContent.innerHTML = `
                        <div class="metric-item"><span class="label">Max Texture Size</span><span class="value">${maxTextureSize}</span></div>
                        <h4 style="margin:24px 0 12px; font-size:1rem; color:var(--accent);">Supported WebGL Extensions</h4>
                        <div style="background:rgba(0,0,0,0.2); padding:12px; border-radius:16px; max-height:200px; overflow-y:auto; word-break:break-all;">
                            ${extListHTML}
                        </div>
                    `;
                    break;
                }

                // 4. Media Devices (機材の製品名リスト)
                case 'mediaDevices': {
                    overlayTitle.textContent = `${localeManager.t('categories.media' || 'Media Devices')} - ${localeManager.t('status.detail_title')}`;
                    
                    try {
                        // ハードウェアのデバイス一覧を取得
                        const devices = await navigator.mediaDevices.enumerateDevices();
                        let listHTML = '';

                        devices.forEach((device, index) => {
                            const label = device.label || `Device #${index + 1} (Name hidden due to lack of permission)`;
                            let icon = '📁';
                            if (device.kind === 'videoinput') icon = '📷';
                            if (device.kind === 'audioinput') icon = '🎙️';
                            if (device.kind === 'audiooutput') icon = '🔊';

                            listHTML += `
                                <div class="metric-item">
                                    <span class="label">${icon} ${device.kind.replace('input', ' Input').replace('output', ' Output')}</span>
                                    <span class="value" style="font-size:0.85rem; max-width:240px; text-align:right;">${label}</span>
                                </div>
                            `;
                        });

                        overlayContent.innerHTML = listHTML || `<div class="metric-item">No connected hardware devices found.</div>`;
                    } catch (err) {
                        overlayContent.innerHTML = `<div class="metric-item" style="color:#ef4444;">Failed to load devices: ${err.message}</div>`;
                    }
                    break;
                }

                // 5. Performance & Memory (読み込みタイムライン)
                case 'performance': {
                    overlayTitle.textContent = `${localeManager.t('categories.performance' || 'Performance')} - ${localeManager.t('status.detail_title')}`;
                    
                    let loadTimelineHTML = '';
                    if (window.performance && window.performance.timing) {
                        const t = window.performance.timing;
                        const dnsTime = t.domainLookupEnd - t.domainLookupStart;
                        const tcpTime = t.connectEnd - t.connectStart;
                        const domTime = t.domComplete - t.domLoading;
                        
                        loadTimelineHTML = `
                            <h4 style="margin:0 0 12px; font-size:1rem; color:var(--accent);">Navigation Timing</h4>
                            <div class="metric-item"><span class="label">DNS Lookup</span><span class="value">${dnsTime} ms</span></div>
                            <div class="metric-item"><span class="label">TCP Handshake</span><span class="value">${tcpTime} ms</span></div>
                            <div class="metric-item"><span class="label">DOM Parsing</span><span class="value">${domTime} ms</span></div>
                        `;
                    }

                    // メモリ使用率のシミュレーションバー
                    let memoryBarHTML = '';
                    if (performance.memory) {
                        const m = performance.memory;
                        const percent = Math.round((m.usedJSHeapSize / m.totalJSHeapSize) * 100);
                        memoryBarHTML = `
                            <h4 style="margin:24px 0 12px; font-size:1rem; color:var(--accent);">JS Heap Memory Usage</h4>
                            <div style="background:rgba(255,255,255,0.1); height:12px; border-radius:6px; overflow:hidden; margin-bottom:8px;">
                                <div style="background:var(--accent); width:${percent}%; height:100%; transition:width 0.5s ease;"></div>
                            </div>
                            <div class="metric-item"><span class="label">Heap Allocation Usage</span><span class="value">${percent}%</span></div>
                        `;
                    }

                    overlayContent.innerHTML = (loadTimelineHTML + memoryBarHTML) || `<div>Performance API not fully supported.</div>`;
                    break;
                }
            }
        });
    });

    // 閉じる処理
    closeBtn.addEventListener('click', () => overlay.classList.remove('active'));
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('active');
    });
} */

// 最後に実行をキックする
startFPSCounter();