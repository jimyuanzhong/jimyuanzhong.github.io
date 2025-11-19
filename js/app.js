// Translations
const translations = {
    en: {
        addEntry: "Add Entry",
        heroTitle: "Your Journey, Your Story",
        heroSubtitle: "Capture every moment of your adventures.",
        noEntries: "No entries yet. Start your journey!",
        addEntryTitle: "Add New Memory",
        labelTitle: "Title",
        labelLocation: "Location",
        labelDate: "Date",
        labelDescription: "Description",
        labelDate: "Date",
        labelDescription: "Description",
        labelImage: "Image (Optional)",
        btnSave: "Save Memory",
        btnEdit: "Edit",
        editEntryTitle: "Edit Memory"
    },
    cn: {
        addEntry: "添加日记",
        heroTitle: "你的旅程，你的故事",
        heroSubtitle: "记录冒险旅途中的每一个精彩瞬间。",
        noEntries: "暂无日记。开始你的旅程吧！",
        addEntryTitle: "添加新回忆",
        labelTitle: "标题",
        labelLocation: "地点",
        labelDate: "日期",
        labelDescription: "描述",
        labelDate: "日期",
        labelDescription: "描述",
        labelImage: "图片 (可选)",
        btnSave: "保存回忆",
        btnEdit: "编辑",
        editEntryTitle: "编辑回忆"
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('language-overlay');
    const app = document.getElementById('app');
    const langBtns = document.querySelectorAll('.lang-btn');

    // Modal Elements
    const modal = document.getElementById('entry-modal');
    const addEntryBtn = document.getElementById('add-entry-btn');
    const closeModalBtn = document.querySelector('.close-modal');
    const entryForm = document.getElementById('entry-form');
    const diaryGrid = document.getElementById('diary-grid');
    const entryImageInput = document.getElementById('entry-image');
    let currentEditId = null;

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

    // Modal Interactions
    addEntryBtn.addEventListener('click', () => {
        currentEditId = null;
        entryForm.reset();
        document.querySelector('[data-i18n="addEntryTitle"]').textContent = translations[document.documentElement.lang || 'en'].addEntryTitle;
        modal.classList.remove('hidden');
    });

    closeModalBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });

    // Form Submission
    entryForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('entry-title').value;
        const location = document.getElementById('entry-location').value;
        const date = document.getElementById('entry-date').value;
        const desc = document.getElementById('entry-desc').value;

        let image = null;
        if (entryImageInput.files && entryImageInput.files[0]) {
            image = await convertToBase64(entryImageInput.files[0]);
        } else if (currentEditId) {
            // Keep existing image if editing and no new image selected
            const existingEntry = getEntryById(currentEditId);
            if (existingEntry) {
                image = existingEntry.image;
            }
        }

        const entryData = {
            id: currentEditId || Date.now(),
            title,
            location,
            date,
            desc,
            image
        };

        saveEntry(entryData);
        entryForm.reset();
        modal.classList.add('hidden');
        loadEntries();
    });

    function convertToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    function getEntryById(id) {
        const entries = JSON.parse(localStorage.getItem('diaryEntries') || '[]');
        return entries.find(entry => entry.id === id);
    }

    function saveEntry(entry) {
        let entries = JSON.parse(localStorage.getItem('diaryEntries') || '[]');

        if (currentEditId) {
            const index = entries.findIndex(e => e.id === currentEditId);
            if (index !== -1) {
                entries[index] = entry;
            }
        } else {
            entries.unshift(entry);
        }

        localStorage.setItem('diaryEntries', JSON.stringify(entries));
    }

    function loadEntries() {
        const entries = JSON.parse(localStorage.getItem('diaryEntries') || '[]');

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
                        <button class="edit-btn" onclick="window.editEntry(${entry.id})">
                            ${translations[document.documentElement.lang || 'en'].btnEdit}
                        </button>
                    </div>
                    <h3 class="diary-title">${entry.title}</h3>
                    <div class="diary-location">
                        <span>📍</span> ${entry.location}
                    </div>
                    <p class="diary-desc">${entry.desc}</p>
                </div>
            </article>
        `).join('');
    }

    // Expose editEntry to global scope so onclick works
    window.editEntry = function (id) {
        const entry = getEntryById(id);
        if (!entry) return;

        currentEditId = id;

        document.getElementById('entry-title').value = entry.title;
        document.getElementById('entry-location').value = entry.location;
        document.getElementById('entry-date').value = entry.date;
        document.getElementById('entry-desc').value = entry.desc;

        // Update modal title
        const lang = document.documentElement.lang || 'en';
        document.querySelector('[data-i18n="addEntryTitle"]').textContent = translations[lang].editEntryTitle;

        modal.classList.remove('hidden');
    };

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
