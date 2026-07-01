/**
 * リアルタイム更新情報の統合監視モジュール
 */
import { watchScreenChanges } from './screen.js';
import { watchNetworkChanges } from './network.js';

/**
 * リアルタイム監視を開始し、データ変化時に指定のUI更新ロジックを叩く
 * @param {Function} onUpdate 変化したデータを受け取るコールバック関数
 */
export function startRealtimeMonitoring(onUpdate) {
    // 1. 画面サイズ・回転の監視
    watchScreenChanges((screenData) => {
        onUpdate({ category: 'screen', data: screenData });
    });

    // 2. ネットワーク状態の監視
    watchNetworkChanges((networkData) => {
        onUpdate({ category: 'network', data: networkData });
    });

    // 3. デバイスの傾き（Orientation / Motion）の監視
    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', (event) => {
            onUpdate({
                category: 'sensors',
                data: {
                    alpha: event.alpha ? event.alpha.toFixed(2) : 0,
                    beta: event.beta ? event.beta.toFixed(2) : 0,
                    gamma: event.gamma ? event.gamma.toFixed(2) : 0
                }
            });
        }, true);
    }

    // 4. ウィンドウフォーカス状態のリアルタイム監視
    window.addEventListener('focus', () => onUpdate({ category: 'app', data: { focus: 'Active' } }));
    window.addEventListener('blur', () => onUpdate({ category: 'app', data: { focus: 'Background' } }));
}