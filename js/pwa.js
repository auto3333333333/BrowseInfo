/**
 * PWA（Service Worker / インストールプロンプト）管理モジュール
 */
export function initPWA() {
    // 1. Service Worker の登録
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./service-worker.js')
                .then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                })
                .catch(error => {
                    console.error('ServiceWorker registration failed: ', error);
                });
        });
    }

    // 2. ホーム画面追加（インストール）プロンプトの制御
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        // デフォルトのバナー表示を抑制
        e.preventDefault();
        // イベントを保持しておく（カスタムインストールボタンなどに割り当てる用）
        deferredPrompt = e;
        
        // 必要に応じて、UI上に「アプリをインストール」ボタンを浮かび上がらせる処理をここに記述
        console.log('PWA is ready to be installed.');
    });

    // 3. インストール完了時のイベント検知
    window.addEventListener('appinstalled', () => {
        console.log('BrowserInfo was successfully installed on the device!');
        deferredPrompt = null;
    });
}