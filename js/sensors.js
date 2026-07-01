// 💡 1行目にこれを追加して、共通インスタンスをインポートします
import { localeManager } from './locale.js';
/**
 * 位置情報（Geolocation）取得モジュール
 */
export function getGeolocation(onSuccess, onError) {
    if (!navigator.geolocation) {
        onError("Not Supported");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            onSuccess({
                latitude: position.coords.latitude.toFixed(5),
                longitude: position.coords.longitude.toFixed(5),
                accuracy: `${position.coords.accuracy} m`
            });
        },
        (error) => {
            onError(error.message);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
}