// 💡 1行目にこれを追加して、共通インスタンスをインポートします
import { localeManager } from './locale.js';
/**
 * データのコピーおよび各種形式（JSON/CSV/PDF）へのエクスポートモジュール
 */

/**
 * 取得データをクリップボードにテキストコピー
 * @param {Object} data 画面から集約したデバイス情報オブジェクト
 */
export async function copyToClipboard(data) {
    const text = JSON.stringify(data, null, 2);
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy text: ', err);
        return false;
    }
}

/**
 * データをJSONファイルとしてダウンロード
 * @param {Object} data デバイス情報オブジェクト
 */
export function exportToJSON(data) {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `BrowserInfo_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

/**
 * データをCSV形式に変換してダウンロード
 * @param {Object} data デバイス情報オブジェクト
 */
export function exportToCSV(data) {
    let csvContent = "data:text/csv;charset=utf-8,Category,Key,Value\n";
    
    // ネストされたオブジェクトを平坦なCSV行に変換
    Object.keys(data).forEach(category => {
        if (typeof data[category] === 'object' && data[category] !== null) {
            Object.keys(data[category]).forEach(key => {
                const value = String(data[category][key]).replace(/"/g, '""');
                csvContent += `"${category}","${key}","${value}"\n`;
            });
        } else {
            const value = String(data[category]).replace(/"/g, '""');
            csvContent += `"General","${category}","${value}"\n`;
        }
    });

    const encodedUri = encodeURI(csvContent);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodedUri);
    downloadAnchor.setAttribute('download', `BrowserInfo_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

/**
 * 現在のダッシュボード表示をA4最適化レイアウトでPDF（印刷出力）
 * 印刷用CSS（@media print）と組み合わせることで美しいA4 PDFになります
 */
export function exportToPDF() {
    window.print();
}