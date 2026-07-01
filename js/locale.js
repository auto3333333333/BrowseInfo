/**
 * 多言語対応（i18n）管理モジュール
 */
class LocaleManager {
    constructor() {
        this.currentLang = 'en';
        this.supportedLangs = ['ja', 'en', 'zh-CN', 'zh-TW', 'ko'];
        this.dictionary = {};
    }

    /**
     * 初期化：言語の自動判定と読み込み
     */
    async init() {
        const savedLang = localStorage.getItem('locale');
        const browserLang = navigator.language || navigator.userLanguage;
        
        let targetLang = savedLang || browserLang;
        
        if (!this.supportedLangs.includes(targetLang)) {
            targetLang = this.supportedLangs.find(lang => targetLang.startsWith(lang)) || 'en';
        }

        await this.loadLocale(targetLang);
    }

    /**
     * 指定された言語のJSONファイルを非同期で読み込む
     */
    async loadLocale(lang) {
        try {
            const response = await fetch(`./locale/${lang}.json`);
            if (!response.ok) throw new Error(`Could not load ${lang}.json`);
            
            this.dictionary = await response.json();
            this.currentLang = lang;
            localStorage.setItem('locale', lang);
            
            this.translateDOM();
        } catch (error) {
            console.error('Locale loading failed, fallback to English:', error);
            if (lang !== 'en') await this.loadLocale('en');
        }
    }

    /**
     * 💡 追加：JavaScriptのロジック内からキーを指定して翻訳テキストを取得する関数
     * 例: localeManager.t('errors.unsupported') -> "非対応のブラウザです"
     */
    t(path) {
        return this.getKeyPath(this.dictionary, path) || path;
    }

    /**
     * 画面上の `data-i18n` 属性を持つ要素を一括翻訳
     */
    translateDOM() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.t(key);
            if (translation && translation !== key) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = translation;
                } else {
                    el.textContent = translation;
                }
            }
        });

        const titleElements = document.querySelectorAll('[data-i18n-title]');
        titleElements.forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            const translation = this.t(key);
            if (translation && translation !== key) {
                el.title = translation;
            }
        });
        
        document.documentElement.lang = this.currentLang;
    }

    /**
     * オブジェクトのディープ探索
     */
    getKeyPath(obj, path) {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    }
}

// 💡 クラスそのものではなく、生成した「共通のインスタンス」をエクスポートする
export const localeManager = new LocaleManager();