export function detectDevice() {
    const ua = navigator.userAgent;
    let type = 'PC';
    let os = 'Unknown OS';

    if (/iPhone|iPad|iPod/i.test(ua)) {
        type = 'iPhone';
        os = 'iOS';
    } else if (/Android/i.test(ua)) {
        type = 'Android';
        os = 'Android';
    } else if (/Windows/i.test(ua)) {
        os = 'Windows';
    } else if (/Macintosh/i.test(ua)) {
        os = 'macOS';
    } else if (/Linux/i.test(ua)) {
        os = 'Linux';
    }

    return { type, os };
}