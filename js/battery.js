export async function initBattery() {
    const elLevel = document.getElementById('bat-level');
    const elCharging = document.getElementById('bat-charging');

    if (!navigator.getBattery) {
        elLevel.textContent = 'Not Supported';
        elCharging.textContent = 'Not Supported';
        return;
    }

    try {
        const battery = await navigator.getBattery();

        function updateBatteryStatus() {
            // 値のセットと同時に、滑らかなアニメーション（点滅やフェード）のトリガー用クラスを付与可能
            const levelPercent = Math.round(battery.level * 100) + '%';
            const isCharging = battery.charging ? 'Charging' : 'Discharging';

            animateValue(elLevel, levelPercent);
            animateValue(elCharging, isCharging);
        }

        // 初期実行とイベントリスナーの登録
        updateBatteryStatus();
        battery.addEventListener('levelchange', updateBatteryStatus);
        battery.addEventListener('chargingchange', updateBatteryStatus);

    } catch (error) {
        console.error('Battery API Error:', error);
    }
}

// 更新時のシームレスなフェードアニメーション用ユーティリティ
function animateValue(element, newValue) {
    if (element.textContent === newValue) return;
    element.style.opacity = 0;
    setTimeout(() => {
        element.textContent = newValue;
        element.style.opacity = 1;
        element.style.transition = 'opacity 0.3s ease';
    }, 150);
}