// Translations
const translations = {
    en: {
        heroTitle: "Your Journey, Your Story",
        heroSubtitle: "Capture every moment of your adventures.",
        noEntries: "No entries yet. Start your journey!",
        labelLocation: "Location",
        labelDate: "Date"
    },
    cn: {
        heroTitle: "你的旅程，你的故事",
        heroSubtitle: "记录冒险旅途中的每一个精彩瞬间。",
        noEntries: "暂无日记。开始你的旅程吧！",
        labelLocation: "地点",
        labelDate: "日期"
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('language-overlay');
    const app = document.getElementById('app');
    const langBtns = document.querySelectorAll('.lang-btn');
    const diaryGrid = document.getElementById('diary-grid');

    // Check for saved language
    const savedLang = localStorage.getItem('preferredLanguage');

    if (savedLang) {
        setLanguage(savedLang);
        hideOverlay();
    } else {
        app.classList.remove('visible');
    }

    // Load Entries
    loadEntries();

    // Event Listeners for Language Buttons
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            setLanguage(lang);
            localStorage.setItem('preferredLanguage', lang);
            hideOverlay();
        });
    });

    async function loadEntries() {
        try {
            const response = await fetch('data/entries.json');
            if (!response.ok) {
                throw new Error('Failed to load entries');
            }
            const entries = await response.json();

            if (entries.length === 0) {
                diaryGrid.innerHTML = `
                    <div class="empty-state">
                        <p data-i18n="noEntries">${translations[document.documentElement.lang || 'en'].noEntries}</p>
                    </div>
                `;
                return;
            }

            diaryGrid.innerHTML = entries.map(entry => `
                <article class="diary-card">
                    ${entry.image ? `<div class="diary-image" style="background-image: url('${entry.image}')"></div>` : ''}
                    <div class="diary-content">
                        <div class="diary-header">
                            <span class="diary-date">${formatDate(entry.date)}</span>
                        </div>
                        <h3 class="diary-title">${entry.title}</h3>
                        <div class="diary-location">
                            <span>📍</span> ${entry.location}
                        </div>
                        <p class="diary-desc">${entry.desc}</p>
                    </div>
                </article>
            `).join('');
        } catch (error) {
            console.error('Error loading entries:', error);
            diaryGrid.innerHTML = `
                <div class="empty-state">
                    <p>Error loading diary entries. Please check console.</p>
                </div>
            `;
        }
    }

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(document.documentElement.lang === 'cn' ? 'zh-CN' : 'en-US', options);
    }

    function setLanguage(lang) {
        const texts = translations[lang];
        if (!texts) return;

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (texts[key]) {
                el.textContent = texts[key];
            }
        });

        document.documentElement.lang = lang;
        // Reload entries to update date format and empty state text
        loadEntries();
    }

    function hideOverlay() {
        overlay.classList.add('hidden');
        app.classList.add('visible');
    }
});
