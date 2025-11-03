

class I18n {
    constructor() {
        this.translations = {};
        this.currentLang = this.getStoredLanguage() || this.detectLanguage() || 'es';
        this.supportedLanguages = ['es', 'en', 'de', 'fr'];
    }


    async init() {
        await this.loadTranslation(this.currentLang);
        this.updateUI();
        this.attachEventListeners();
    }

    detectLanguage() {
        const browserLang = navigator.language.toLowerCase();
        
        const langMap = {
            'es': 'es',
            'en': 'en',
            'de': 'de',
            'fr': 'fr',
            'es-es': 'es',
            'es-mx': 'es',
            'en-us': 'en',
            'en-gb': 'en',
            'de-de': 'de',
            'fr-fr': 'fr'
        };
        
        const stored = this.getStoredLanguage();
        if (stored) {
            return stored;
        }
        
        for (let key in langMap) {
            if (browserLang.startsWith(key)) {
                return langMap[key];
            }
        }
        
        return 'es';
    }


    getStoredLanguage() {
        return localStorage.getItem('selectedLanguage');
    }


    setStoredLanguage(lang) {
        localStorage.setItem('selectedLanguage', lang);
    }


    async loadTranslation(lang) {
        try {
            const response = await fetch(`i18n/${lang}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load translation for ${lang}`);
            }
            this.translations = await response.json();
            this.currentLang = lang;
            this.setStoredLanguage(lang);
            
            document.documentElement.lang = lang;
            
            const currentLangDisplay = document.getElementById('currentLang');
            if (currentLangDisplay) {
                currentLangDisplay.textContent = lang.toUpperCase();
            }
            
            this.updateDropdownActiveState();
            
        } catch (error) {
            console.error('Error loading translation:', error);
            if (lang !== 'es') {
                await this.loadTranslation('es');
            }
        }
    }

    getTranslation(key) {
        const keys = key.split('.');
        let value = this.translations;
        
        for (let k of keys) {
            value = value[k];
            if (!value) {
                console.warn(`Translation key not found: ${key}`);
                return key;
            }
        }
        
        return value;
    }


    updateUI() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getTranslation(key);
            
            if (element.tagName === 'INPUT' || element.tagName === 'BUTTON') {
                if (element.hasAttribute('placeholder')) {
                    element.placeholder = translation;
                } else {
                    const icon = element.querySelector('i');
                    if (icon) {
                        const iconHTML = icon.outerHTML;
                        element.innerHTML = iconHTML + ' ' + translation;
                    } else {
                        element.textContent = translation;
                    }
                }
            } else {
                const nestedElements = element.querySelectorAll('span[data-i18n], i');
                if (nestedElements.length > 0) {
                    const childNodes = Array.from(element.childNodes);
                    childNodes.forEach(node => {
                        if (node.nodeType === Node.TEXT_NODE) {
                            node.textContent = translation;
                        }
                    });
                } else {
                    element.textContent = translation;
                }
            }
        });
        
        this.updatePageTitle();
        
        this.updateTypewriterRoles();
        
        this.updateTooltips();
    }

     
    updatePageTitle() {
        const titles = {
            'es': 'Fernando Cristerna - Portafolio ML & Data Science',
            'en': 'Fernando Cristerna - ML & Data Science Portfolio',
            'de': 'Fernando Cristerna - ML & Data Science Portfolio',
            'fr': 'Fernando Cristerna - Portfolio ML & Data Science'
        };
        document.title = titles[this.currentLang] || titles['es'];
    }


    updateTypewriterRoles() {
        if (window.typewriter) {
            window.typewriter.updateRoles([
                this.getTranslation('hero.roles.role1'),
                this.getTranslation('hero.roles.role2'),
                this.getTranslation('hero.roles.role3')
            ]);
        }
    }


    updateTooltips() {
        const demoButtons = document.querySelectorAll('button[data-bs-toggle="tooltip"]');
        demoButtons.forEach(button => {
            const tooltip = bootstrap.Tooltip.getInstance(button);
            if (tooltip) {
                tooltip.dispose();
            }
            button.setAttribute('data-bs-title', this.getTranslation('projects.notAvailable'));
            new bootstrap.Tooltip(button);
        });
    }


    updateDropdownActiveState() {
        const langOptions = document.querySelectorAll('.lang-option');
        langOptions.forEach(option => {
            const optionLang = option.getAttribute('data-lang');
            if (optionLang === this.currentLang) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    }


    async switchLanguage(lang) {
        if (this.supportedLanguages.includes(lang)) {
            await this.loadTranslation(lang);
            this.updateUI();
            
            window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
        }
    }


    attachEventListeners() {
        const langOptions = document.querySelectorAll('.lang-option');
        langOptions.forEach(option => {
            option.addEventListener('click', async (e) => {
                e.preventDefault();
                const lang = option.getAttribute('data-lang');
                await this.switchLanguage(lang);
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    window.i18n = new I18n();
    await window.i18n.init();
});
