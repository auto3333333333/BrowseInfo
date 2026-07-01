/**
 * BrowserInfo 専用 高精度A4印刷・PDFエクスポートモジュール
 */
export function initPDFExporter() {
    // 印刷用のCSSスタイルを動的に注入（呼び出し時のみ適用）
    const styleId = 'pdf-print-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            @media print {
                /* 背景のグラデーションや液体アニメーションを非表示にし、白地ベースでインクを節約 */
                body {
                    background: #ffffff !important;
                    color: #000000 !important;
                    font-size: 11pt !important;
                }
                
                .liquid-bg, .glass-header, .action-bar, .realtime-indicator, .card-locale-badge {
                    display: none !important; /* 不要なUI要素をカット */
                }

                .dashboard-container {
                    width: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }

                /* グリッドを印刷用に再整列 (A4縦幅に収まりやすい2カラムに変更) */
                .metrics-grid {
                    display: grid !important;
                    grid-template-columns: 1fr 1fr !important;
                    gap: 15px !important;
                    margin-top: 10px !important;
                }

                /* ガラスカードをクリーンな枠線デザインに変換 */
                .glass-card {
                    background: #ffffff !important;
                    border: 1px solid #dddddd !important;
                    box-shadow: none !important;
                    padding: 15px !important;
                    page-break-inside: avoid; /* カードの途中でページが千切れるのを防ぐ */
                    border-radius: 12px !important;
                    color: #000000 !important;
                }

                .glass-card h3, .glass-card h2 {
                    color: #111111 !important;
                    border-bottom: 2px solid #333333 !important;
                    padding-bottom: 4px !important;
                    margin-bottom: 10px !important;
                    font-size: 13pt !important;
                }

                .metric-item {
                    border-bottom: 1px dashed #cccccc !important;
                    padding: 6px 0 !important;
                }

                .label {
                    color: #555555 !important;
                }

                .value {
                    color: #000000 !important;
                    font-family: 'Courier New', Courier, monospace !important; /* 値を等幅で見やすく */
                }

                /* スクロールバーやはみ出しを完全にリセット */
                .scrollable {
                    overflow: visible !important;
                    white-space: normal !important;
                    word-break: break-all !important;
                    max-width: none !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // 印刷ダイアログの呼び出し（ブラウザ標準の「PDFとして保存」を利用）
    window.print();
}