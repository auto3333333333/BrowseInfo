/**
 * メディアデバイス（カメラ・マイク・スピーカー）の検知モジュール
 */
export async function getMediaDevices() {
    const mediaStatus = { camera: 0, microphone: 0, speaker: 0, list: [] };
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        return mediaStatus;
    }

    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        devices.forEach(device => {
            if (device.kind === 'videoinput') mediaStatus.camera++;
            if (device.kind === 'audioinput') mediaStatus.microphone++;
            if (device.kind === 'audiooutput') mediaStatus.speaker++;
            
            if (device.label) {
                mediaStatus.list.push(`${device.kind}: ${device.label}`);
            }
        });
    } catch (e) {
        console.warn("Media devices enumeration blocked or failed:", e);
    }
    
    return mediaStatus;
}