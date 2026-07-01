/**
 * 画面・解像度情報の取得およびリアルタイム監視モジュール
 */
export function initScreen() {
    const info = {
        getResolution: () => `${window.screen.width} x ${window.screen.height}`,
        getAvailResolution: () => `${window.screen.availWidth} x ${window.screen.availHeight}`,
        getPixelRatio: () => window.devicePixelRatio || 1,
        getColorDepth: () => `${window.screen.colorDepth} bit`,
        getWindowSize: () => `${window.innerWidth} x ${window.innerHeight}`,
        getOrientation: () => {
            if (window.screen.orientation) {
                return window.screen.orientation.type;
            }
            return window.innerHeight > window.innerWidth ? 'portrait-primary' : 'landscape-primary';
        }
    };

    // 初回レンダリング用データの返却
    return info;
}

/**
 * リサイズや画面回転イベントのリアルタイム監視を設定
 * @param {Function} callback 変更時にUIを更新するためのコールバック関数
 */
export function watchScreenChanges(callback) {
    // ウィンドウサイズ変更の監視
    window.addEventListener('resize', () => {
        callback({
            windowSize: `${window.innerWidth} x ${window.innerHeight}`
        });
    });

    // 画面の向き（Orientation）の監視
    if (window.screen.orientation) {
        window.screen.orientation.addEventListener('change', (e) => {
            callback({
                orientation: e.target.type
            });
        });
    } else {
        // 古いブラウザ向けのフォールバック
        window.addEventListener('orientationchange', () => {
            const currentOrientation = window.innerHeight > window.innerWidth ? 'portrait-primary' : 'landscape-primary';
            callback({ orientation: currentOrientation });
        });
    }
}