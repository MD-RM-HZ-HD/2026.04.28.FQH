// --- تهيئة قاعدة البيانات وربط المتغيرات ---
const DB = {
    mindmapTree: typeof Mind_Map !== 'undefined' ? Mind_Map.children : null,
    
    cards: typeof Flash_Cards !== 'undefined' ? Flash_Cards.map(item => ({
        q: item.question, 
        a: item.answer
    })) : null,
    
    tf: typeof True_False !== 'undefined' ? True_False.map(item => ({
        q: item.text, 
        a: item.answer,
        exp: item.explanation
    })) : null,
    
    mcq: typeof Multiple_Choice !== 'undefined' ? Multiple_Choice.map(item => ({
        q: item.q, 
        opts: item.options, 
        correct: item.correctIndex,
        exp: item.rationale
    })) : null,
    
    fill: typeof Fill_Blank !== 'undefined' ? Fill_Blank.map(item => ({
        q: item.text, 
        a: item.answer 
    })) : null,
    
    comp: typeof Compare !== 'undefined' ? Compare.map(item => {
        let ansText = item.criteria.map(c => 
            `<div class="mb-2 text-right">
                <span class="font-black text-sm text-[color:var(--accent-primary)] border-b border-dashed border-[color:var(--border-color)] pb-1">▪️ ${c.label}</span>
                <div class="mt-1 text-xs md:text-sm">
                    <span class="font-bold">${item.caseA_label}:</span> ${c.answerA}<br>
                    <span class="font-bold mt-1 inline-block">${item.caseB_label}:</span> ${c.answerB}
                </div>
            </div>`
        ).join('');
        return { q: item.title, a: ansText };
    }) : null
};

// --- المظاهر (الثيمات) - الرمادي أصبح الأول ---
// --- المظاهر (الثيمات) مرتبة لتتطابق مع HTML ---
const THEMES = [
    {
        name: "الأخضر الأصلي", // 0
        vars: { 
            '--bg-main': 'linear-gradient(135deg, #4b6856 0%, #283b2f 100%)', 
            '--bg-panel': 'rgba(170, 187, 165, 0.9)', '--bg-panel-solid': '#aabba5', '--bg-panel-hover': '#96a891', 
            '--border-color': '#074344', '--accent-primary': '#074344', '--accent-text': '#ffffff', 
            '--text-main': '#111111', '--text-muted': '#283b2f', '--accent-green': '#10b981', '--accent-danger': '#ef4444' 
        }
    },
    {
        name: "الأخضر الرمادي", // 1
        vars: { 
            '--bg-main': 'linear-gradient(135deg, #71897b 0%, #4b6856 100%)', 
            '--bg-panel': 'rgba(245, 247, 245, 0.9)', '--bg-panel-solid': '#f4f7f5', '--bg-panel-hover': '#e2e8e4', 
            '--border-color': '#4b6856', '--accent-primary': '#283b2f', '--accent-text': '#ffffff', 
            '--text-main': '#111111', '--text-muted': '#4b6856', '--accent-green': '#10b981', '--accent-danger': '#ef4444' 
        }
    },
    {
        name: "المريمية الهادئة", // 2
        vars: { 
            '--bg-main': 'linear-gradient(135deg, #aabba5 0%, #768f71 100%)', 
            '--bg-panel': 'rgba(255, 255, 255, 0.8)', '--bg-panel-solid': '#f0f5ee', '--bg-panel-hover': '#e1e9dd', 
            '--border-color': '#4b6856', '--accent-primary': '#283b2f', '--accent-text': '#ffffff', 
            '--text-main': '#111111', '--text-muted': '#4b6856', '--accent-green': '#10b981', '--accent-danger': '#ef4444' 
        }
    },
    {
        name: "الرمادي", // 3
        vars: { 
            '--bg-main': 'hsl(210, 13%, 95%)', 
            '--bg-panel': 'hsl(204, 12.2%, 91.96%)', '--bg-panel-solid': 'hsl(210, 13%, 88%)', '--bg-panel-hover': 'hsl(204, 12%, 75%)', 
            '--border-color': 'hsl(204, 12%, 65%)', '--accent-primary': 'hsl(203, 12%, 35%)', '--accent-text': '#ffffff', 
            '--text-main': '#333333', '--text-muted': '#8d8d8d', '--accent-green': '#359c06', '--accent-danger': '#a94442' 
        }
    }
];
// إدارة حالة التطبيق
const State = {
    tab: 'mindmap', 
    fontSize: parseInt(localStorage.getItem('fontSize')) || 16,
    cardsIdx: 0, cardsFlipped: false,
    tfIdx: 0, tfSelected: null, tfChecked: false, tfScore: 0,
    mcqIdx: 0, mcqSelected: null, mcqChecked: false, mcqScore: 0,
    fillIdx: 0, fillVal: '', fillChecked: false, fillScore: 0,
    compIdx: 0, compChecked: false, compScore: 0
};

// ربط عناصر واجهة المستخدم
const DOM = {
    app: document.getElementById('app-container'), 
    content: document.getElementById('content-area'),
    tabs: document.querySelectorAll('.pill-btn'), 
    mobileSelect: document.getElementById('mobile-tab-select'),
    themeSelect: document.getElementById('theme-select'), 
    btnFontUp: document.getElementById('btn-font-up'), 
    btnFontDown: document.getElementById('btn-font-down'),
    settingsBtn: document.getElementById('settings-btn'), 
    settingsMenu: document.getElementById('settings-menu')
};

function updateTabCounters() {
    const counts = { 
        cards: DB.cards?.length, 
        tf: DB.tf?.length, 
        mcq: DB.mcq?.length, 
        fill: DB.fill?.length, 
        comp: DB.comp?.length 
    };
    
    if(DOM.mobileSelect) {
        DOM.mobileSelect.querySelectorAll('option').forEach(opt => { 
            if(counts[opt.value]) {
                opt.textContent = opt.textContent.split(' (')[0] + ` (${counts[opt.value]})`; 
            }
        });
    }
    
    if(DOM.tabs) {
        DOM.tabs.forEach(btn => { 
            if(counts[btn.dataset.tab]) {
                btn.textContent = btn.textContent.split(' (')[0] + ` (${counts[btn.dataset.tab]})`; 
            }
        });
    }
}

// دالة خلط الأسئلة
function shuffleArray(array) { 
    if(!array) return; 
    for (let i = array.length - 1; i > 0; i--) { 
        const j = Math.floor(Math.random() * (i + 1)); 
        [array[i], array[j]] = [array[j], array[i]]; 
    } 
}

function randomizeAllQuestions() { 
    shuffleArray(DB.cards); 
    shuffleArray(DB.tf); 
    shuffleArray(DB.mcq); 
    shuffleArray(DB.fill); 
    shuffleArray(DB.comp); 
}

// تهيئة التطبيق
function initApp() {
    randomizeAllQuestions(); 
    updateTabCounters(); 
    applyFontSize();
    
    const savedTheme = localStorage.getItem('selectedThemeIdx');
    if(DOM.themeSelect) {
        DOM.themeSelect.value = savedTheme !== null && THEMES[savedTheme] ? savedTheme : 0;
    }
    applyTheme(DOM.themeSelect ? parseInt(DOM.themeSelect.value) : 0);

    // ربط قائمة الإعدادات (الهاتف)
    if(DOM.settingsBtn && DOM.settingsMenu) {
        DOM.settingsBtn.addEventListener('click', () => {
            DOM.settingsMenu.classList.toggle('hidden');
            DOM.settingsMenu.classList.toggle('flex');
        });
        
        document.addEventListener('click', (e) => {
            if(!DOM.settingsBtn.contains(e.target) && !DOM.settingsMenu.contains(e.target)) {
                DOM.settingsMenu.classList.add('hidden');
                DOM.settingsMenu.classList.remove('flex');
            }
        });
    }

    if(DOM.themeSelect) {
        DOM.themeSelect.addEventListener('change', (e) => applyTheme(parseInt(e.target.value)));
    }
    
    if(DOM.btnFontUp) DOM.btnFontUp.addEventListener('click', () => changeFont(1));
    if(DOM.btnFontDown) DOM.btnFontDown.addEventListener('click', () => changeFont(-1));
    
    if(DOM.mobileSelect) {
        DOM.mobileSelect.addEventListener('change', (e) => {
            State.tab = e.target.value; 
            DOM.tabs.forEach(b => { 
                b.classList.remove('active'); 
                if(b.dataset.tab === State.tab) b.classList.add('active'); 
            });
            randomizeAllQuestions(); 
            window.restartQuiz(State.tab);
        });
    }

    if(DOM.tabs) {
        DOM.tabs.forEach(btn => btn.addEventListener('click', (e) => {
            DOM.tabs.forEach(b => b.classList.remove('active')); 
            e.target.classList.add('active');
            State.tab = e.target.dataset.tab; 
            if(DOM.mobileSelect) DOM.mobileSelect.value = State.tab; 
            randomizeAllQuestions(); 
            window.restartQuiz(State.tab);
        }));
    }
    renderTab();
}

function applyTheme(idx) {
    const theme = THEMES[idx]; 
    const root = document.documentElement;
    for (const [key, value] of Object.entries(theme.vars)) {
        root.style.setProperty(key, value);
    }
    localStorage.setItem('selectedThemeIdx', idx);
}

function changeFont(val) { 
    State.fontSize = Math.max(12, Math.min(24, State.fontSize + val)); 
    localStorage.setItem('fontSize', State.fontSize); 
    applyFontSize(); 
}

function applyFontSize() { 
document.documentElement.style.fontSize = State.fontSize + 'px';}

function renderTab() {
    if(!DOM.content) return; 
    let html = '';
    
    switch(State.tab) { 
        case 'mindmap': html = renderMindmap(); break; 
        case 'cards': html = renderCards(); break; 
        case 'tf': html = renderTF(); break; 
        case 'mcq': html = renderMCQ(); break; 
        case 'fill': html = renderFill(); break; 
        case 'comp': html = renderComp(); break; 
    }
    
    DOM.content.innerHTML = `<div class="animate-fade-in">${html}</div>`; 
    attachDynamicListeners();
}

function getProgressBar(current, total) {
    const perc = ((current) / total) * 100;
    return `
        <div class="flex justify-between text-xs font-bold text-[color:var(--text-muted)] mb-1">
            <span>مؤشر التقدم</span>
            <span>${current + 1 > total ? total : current + 1} / ${total}</span>
        </div>
        <div class="progress-container mb-3">
            <div class="progress-bar" style="width: ${perc}%"></div>
        </div>
    `;
}

function renderFinishScreen(title, score, total, tabKey) {
    const perc = Math.round((score / total) * 100);
    return `
        <div class="text-center py-6 flex flex-col items-center animate-fade-in">
            <div class="text-5xl mb-4">🏆</div>
            <h2 class="text-xl font-black mb-2 text-[color:var(--accent-primary)]">إنجاز قسم: ${title}</h2>
            <div class="bg-[color:var(--bg-panel-solid)] border-2 border-[color:var(--border-color)] rounded-2xl p-6 mb-6 w-full max-w-xs shadow-sm">
                <div class="text-4xl font-black text-[color:var(--accent-primary)] mb-2">
                    ${score} <span class="text-xl text-[color:var(--text-muted)] opacity-60">/ ${total}</span>
                </div>
                <div class="text-sm font-bold text-[color:var(--text-muted)] bg-[color:var(--bg-panel)] py-1 px-4 rounded-full border border-[color:var(--border-color)] inline-block">
                    النسبة: ${perc}%
                </div>
            </div>
            <button class="action-btn max-w-xs text-sm py-3" onclick="window.restartQuiz('${tabKey}')">
                🔄 إعادة الاختبار مجدداً
            </button>
        </div>
    `;
}

window.toggleNode = function(element) { 
    const ul = element.nextElementSibling; 
    const icon = element.querySelector('.toggle-icon'); 
    
    if (ul && ul.tagName === 'UL') { 
        ul.classList.toggle('hidden'); 
        if (icon) icon.textContent = ul.classList.contains('hidden') ? '+' : '−'; 
    } 
};

function buildTreeHTML(node, level = 0) {
    const hasChildren = node.children && node.children.length > 0; 
    const toggleIcon = hasChildren ? `<span class="toggle-icon">−</span>` : ''; 
    const pointerClass = hasChildren ? 'cursor-pointer' : 'cursor-default'; 
    const rootClass = level === 0 ? 'root-node' : '';
    
    let html = `
        <li class="tree-node">
            <div class="tree-content text-sm ${rootClass} ${pointerClass}" ${hasChildren ? `onclick="window.toggleNode(this)"` : ''}>
                <span>${node.title}</span>${toggleIcon}
            </div>
    `;
    
    if (hasChildren) { 
        html += `<ul class="tree-list pr-6 mt-2 transition-all">`; 
        node.children.forEach(child => { 
            html += buildTreeHTML(child, level + 1); 
        }); 
        html += `</ul>`; 
    }
    
    return html + `</li>`;
}

function renderMindmap() {
    if(!DB.mindmapTree) return '<div class="text-center p-4">لا توجد بيانات للمشجرة</div>';
    
    let treeHTML = `<ul class="tree-list root-list pr-0">`; 
    DB.mindmapTree.forEach(node => { 
        treeHTML += buildTreeHTML(node, 0); 
    }); 
    treeHTML += `</ul>`;
    
    return `
        <div class="mb-4 text-center bg-[color:var(--bg-panel-solid)] border-2 border-[color:var(--border-color)] p-2 rounded-xl">
            <p class="text-xs font-bold text-[color:var(--text-muted)]">انقر على العُقَد للتوسيع والطي.</p>
        </div>
        <div class="overflow-x-auto pb-4 px-1">${treeHTML}</div>
    `;
}

function renderCards() {
    if(!DB.cards || DB.cards.length === 0) return '<div class="text-center p-4">لا توجد بطاقات</div>';
    if (State.cardsIdx >= DB.cards.length) return renderFinishScreen('البطاقات الذكية', DB.cards.length, DB.cards.length, 'cards');
    
    const data = DB.cards[State.cardsIdx];
    return `
        ${getProgressBar(State.cardsIdx, DB.cards.length)}
        <div class="flip-card mt-4 mb-4" id="action-flip">
            <div class="flip-card-inner ${State.cardsFlipped ? 'rotate-y-180' : ''}" style="transform: ${State.cardsFlipped ? 'rotateY(180deg)' : 'none'}">
                <div class="flip-card-front p-4">
                    <div class="text-xs font-bold mb-2 bg-[color:var(--bg-main)] px-3 py-1 rounded-full border border-[color:var(--border-color)]">👆 انقر للقلب</div>
                    <div class="mt-2 text-base md:text-lg">${data.q}</div>
                </div>
                <div class="flip-card-back p-4">
                    <div class="text-xs font-bold mb-2 bg-black/20 px-3 py-1 rounded-full text-[color:var(--accent-text)] border border-[color:var(--accent-text)]">الإجابة</div>
                    <div class="mt-2 text-sm md:text-base">${data.a}</div>
                </div>
            </div>
        </div>
        <div class="flex justify-center gap-2">
            <button class="action-btn text-sm py-2 max-w-[100px] bg-[color:var(--bg-panel-solid)] text-[color:var(--text-main)] border border-[color:var(--border-color)]" onclick="move(-1)" ${State.cardsIdx === 0 ? 'disabled' : ''}>السابق</button>
            <button class="action-btn text-sm py-2 max-w-[150px]" id="btn-next">التالي 🡄</button>
        </div>
    `;
}

function renderTF() {
    if(!DB.tf || DB.tf.length === 0) return '<div class="text-center p-4">لا توجد أسئلة صواب وخطأ</div>';
    if (State.tfIdx >= DB.tf.length) return renderFinishScreen('الصواب والخطأ', State.tfScore, DB.tf.length, 'tf');
    
    const data = DB.tf[State.tfIdx]; 
    let msgHTML = '';
    
    if (State.tfChecked) {
        const isCorrect = State.tfSelected === data.a;
        msgHTML = `
            <div class="p-3 mt-4 rounded-xl border-2 animate-fade-in ${isCorrect ? 'bg-[color:var(--accent-green)] text-white border-[color:var(--accent-green)]' : 'bg-[color:var(--accent-danger)] text-white border-[color:var(--accent-danger)]'}">
                <div class="font-black text-sm text-center mb-2">${isCorrect ? '✅ دقيق!' : '❌ خطأ! الجواب: ' + (data.a ? 'صواب' : 'خطأ')}</div>
                <div class="pt-2 border-t border-white/30 text-xs font-bold leading-relaxed text-right">💡 ${data.exp}</div>
            </div>
        `;
    }
    
    return `
        ${getProgressBar(State.tfIdx, DB.tf.length)}
        <div class="relative bg-[color:var(--bg-panel-solid)] border-2 border-[color:var(--border-color)] p-4 md:p-6 rounded-2xl mt-5 mb-4">
            <div class="absolute -top-3 right-4 bg-[color:var(--accent-primary)] text-[color:var(--accent-text)] px-3 py-1 rounded-lg text-xs font-black border border-[color:var(--bg-panel)]">حقيقة أم خرافة؟</div>
            <h3 class="text-base md:text-lg font-black text-center leading-relaxed mt-2">${data.q}</h3>
        </div>
        <div class="grid grid-cols-2 gap-3">
            <button class="opt-btn p-3 rounded-xl font-black text-sm md:text-base ${State.tfSelected === true ? 'selected' : ''}" data-val="true">✅ صواب</button>
            <button class="opt-btn p-3 rounded-xl font-black text-sm md:text-base ${State.tfSelected === false ? 'selected' : ''}" data-val="false">❌ خطأ</button>
        </div>
        ${msgHTML}
        <div class="flex justify-center mt-5">
            <button class="action-btn max-w-xs text-sm py-3" id="btn-next" ${!State.tfChecked ? 'disabled' : ''}>
                ${State.tfIdx === DB.tf.length - 1 ? 'إنهاء الاختبار' : 'التالي 🡄'}
            </button>
        </div>
    `;
}

function renderMCQ() {
    if(!DB.mcq || DB.mcq.length === 0) return '<div class="text-center p-4">لا توجد أسئلة اختيارات</div>';
    if (State.mcqIdx >= DB.mcq.length) return renderFinishScreen('الاختيار من متعدد', State.mcqScore, DB.mcq.length, 'mcq');
    
    const data = DB.mcq[State.mcqIdx]; 
    let msgHTML = '';
    
    let optsHTML = data.opts.map((opt, i) => {
        let classes = "opt-btn p-3 rounded-xl font-bold text-right mb-2 block w-full text-sm md:text-base transition-all ";
        if (State.mcqChecked) { 
            if (i === data.correct) classes += "correct"; 
            else if (i === State.mcqSelected) classes += "wrong"; 
            else classes += "opacity-50 grayscale"; 
        } else if (State.mcqSelected === i) {
            classes += "selected";
        }
        return `
            <button class="${classes}" data-idx="${i}">
                <span class="inline-block bg-[color:var(--bg-main)] text-[color:var(--text-main)] rounded px-2 py-0.5 text-xs ml-2 border border-[color:var(--border-color)]">${String.fromCharCode(1613 + i)}</span> 
                ${opt}
            </button>
        `;
    }).join('');
    
    if (State.mcqChecked) {
        const isCorrect = State.mcqSelected === data.correct;
        msgHTML = `
            <div class="p-3 mt-4 rounded-xl border-2 animate-fade-in ${isCorrect ? 'bg-[color:var(--accent-green)] text-white border-[color:var(--accent-green)]' : 'bg-[color:var(--accent-danger)] text-white border-[color:var(--accent-danger)]'}">
                <div class="font-black text-sm text-center mb-2">${isCorrect ? '✅ صح!' : '❌ خطأ!'}</div>
                <div class="pt-2 border-t border-white/30 text-xs font-bold leading-relaxed text-right">💡 ${data.exp}</div>
            </div>
        `;
    }
    
    return `
        ${getProgressBar(State.mcqIdx, DB.mcq.length)}
        <div class="bg-[color:var(--bg-panel-solid)] border-2 border-[color:var(--border-color)] border-r-4 border-r-[color:var(--accent-primary)] p-4 rounded-xl mt-4 mb-4">
            <h3 class="text-base md:text-lg font-black leading-relaxed">${data.q}</h3>
        </div>
        <div class="mt-2">${optsHTML}</div>
        ${msgHTML}
        <div class="flex justify-center mt-5">
            <button class="action-btn max-w-xs text-sm py-3" id="btn-next" ${!State.mcqChecked ? 'disabled' : ''}>
                ${State.mcqIdx === DB.mcq.length - 1 ? 'إنهاء الاختبار' : 'التالي 🡄'}
            </button>
        </div>
    `;
}

function renderFill() {
    if(!DB.fill || DB.fill.length === 0) return '<div class="text-center p-4">لا توجد أسئلة فراغات</div>';
    if (State.fillIdx >= DB.fill.length) return renderFinishScreen('املأ الفراغ', State.fillScore, DB.fill.length, 'fill');
    
    const data = DB.fill[State.fillIdx]; 
    let msgHTML = '';
    const textHTML = data.q.replace('______', `<span class="inline-block border-b-2 border-dashed border-[color:var(--accent-primary)] w-20 mx-2 align-middle h-6 text-[color:var(--text-muted)] bg-[color:var(--bg-main)] rounded-t"></span>`);
    
    if(State.fillChecked) {
        const userVal = State.fillVal.trim(); 
        let isCorrect = false;
        
        if (userVal !== '') {
            isCorrect = data.a.some(ans => ans.includes(userVal) || userVal.includes(ans));
        }
        
        if (isCorrect) State.fillScore++;
        
        msgHTML = `
            <div class="p-3 mt-4 rounded-xl border-2 text-center animate-fade-in text-sm font-black ${isCorrect ? 'bg-[color:var(--accent-green)] text-white border-[color:var(--accent-green)]' : 'bg-[color:var(--accent-danger)] text-white border-[color:var(--accent-danger)]'}">
                ${isCorrect ? '🎉 إجابة صحيحة.' : '💡 الجواب المقبول: ' + data.a.join(' أو ')}
            </div>
        `;
    }
    
    return `
        ${getProgressBar(State.fillIdx, DB.fill.length)}
        <div class="bg-[color:var(--bg-panel-solid)] border-2 border-[color:var(--border-color)] p-4 rounded-xl mt-4 mb-4 text-center">
            <div class="text-base md:text-lg font-black leading-loose">${textHTML}</div>
        </div>
        <div class="relative w-full">
            <input type="text" id="fill-input" class="input-stylish text-center text-sm md:text-base font-black py-2" placeholder="اكتب الكلمة هنا..." value="${State.fillVal}" ${State.fillChecked ? 'disabled' : ''} autocomplete="off">
        </div>
        ${msgHTML}
        ${!State.fillChecked ? `
            <div class="flex justify-center mt-4">
                <button class="action-btn max-w-xs bg-[color:var(--bg-panel-solid)] text-[color:var(--text-main)] text-sm py-2 border-2 border-[color:var(--border-color)] hover:bg-[color:var(--bg-panel-hover)]" id="btn-check">تحقق</button>
            </div>
        ` : ''}
        <div class="flex justify-center mt-5">
            <button class="action-btn max-w-xs text-sm py-3" id="btn-next" ${!State.fillChecked ? 'disabled' : ''}>
                ${State.fillIdx === DB.fill.length - 1 ? 'إنهاء الاختبار' : 'التالي 🡄'}
            </button>
        </div>
    `;
}

function renderComp() {
    if(!DB.comp || DB.comp.length === 0) return '<div class="text-center p-4">لا توجد أسئلة مقارنات</div>';
    if (State.compIdx >= DB.comp.length) return renderFinishScreen('المقارنات', DB.comp.length, DB.comp.length, 'comp');
    
    const data = DB.comp[State.compIdx]; 
    let ansHTML = '';
    
    if (State.compChecked) {
        ansHTML = `
            <div class="mt-6 border-t border-dashed border-[color:var(--border-color)] pt-6 relative animate-fade-in">
                <div class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[color:var(--accent-primary)] text-[color:var(--accent-text)] px-4 py-0.5 rounded-full text-xs font-black">الإجابة النموذجية</div>
                <div class="p-4 bg-[color:var(--bg-panel-solid)] rounded-xl text-sm leading-relaxed border border-[color:var(--accent-green)] text-right mt-2">${data.a}</div>
            </div>
        `;
    }
    
    return `
        ${getProgressBar(State.compIdx, DB.comp.length)}
        <div class="bg-[color:var(--bg-panel-solid)] border-2 border-[color:var(--border-color)] p-3 rounded-xl mt-4 mb-4">
            <h3 class="text-base font-black text-center text-[color:var(--accent-primary)]">${data.q}</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div>
                <div class="p-2 bg-[color:var(--accent-primary)] text-[color:var(--accent-text)] rounded-t-xl text-center font-black text-xs">المفهوم الأول</div>
                <textarea class="input-stylish rounded-t-none rounded-b-xl h-20 text-sm p-2" placeholder="اكتب هنا..." ${State.compChecked ? 'disabled' : ''}></textarea>
            </div>
            <div>
                <div class="p-2 bg-[color:var(--accent-primary)] text-[color:var(--accent-text)] rounded-t-xl text-center font-black text-xs">المفهوم الثاني</div>
                <textarea class="input-stylish rounded-t-none rounded-b-xl h-20 text-sm p-2" placeholder="اكتب هنا..." ${State.compChecked ? 'disabled' : ''}></textarea>
            </div>
        </div>
        ${!State.compChecked ? `
            <div class="flex justify-center mt-4">
                <button class="action-btn max-w-xs bg-[color:var(--bg-panel-solid)] text-[color:var(--text-main)] text-sm py-2 border-2 border-[color:var(--border-color)] hover:bg-[color:var(--bg-panel-hover)]" id="btn-check">عرض الإجابة</button>
            </div>
        ` : ''}
        ${ansHTML}
        <div class="flex justify-center mt-6">
            <button class="action-btn max-w-xs text-sm py-3" id="btn-next" ${!State.compChecked ? 'disabled' : ''}>
                ${State.compIdx === DB.comp.length - 1 ? 'إنهاء القسم' : 'التالية 🡄'}
            </button>
        </div>
    `;
}

function attachDynamicListeners() {
    const next = document.getElementById('btn-next'); 
    const check = document.getElementById('btn-check'); 
    const flip = document.getElementById('action-flip'); 
    const fillInp = document.getElementById('fill-input');
    
    if(next) next.addEventListener('click', () => move(1));
    
    if(check) {
        check.addEventListener('click', () => { 
            if(State.tab === 'fill' && !State.fillChecked) State.fillChecked = true; 
            if(State.tab === 'comp' && !State.compChecked) State.compChecked = true; 
            renderTab(); 
        });
    }
    
    if(fillInp) fillInp.addEventListener('input', (e) => State.fillVal = e.target.value);
    
    if(flip) {
        flip.addEventListener('click', () => { 
            State.cardsFlipped = !State.cardsFlipped; 
            renderTab(); 
        });
    }
    
    document.querySelectorAll('.opt-btn').forEach(btn => btn.addEventListener('click', (e) => {
        if (State.tab === 'tf' && !State.tfChecked) { 
            const t = e.target.closest('.opt-btn'); 
            State.tfSelected = t.dataset.val === 'true'; 
            State.tfChecked = true; 
            if (State.tfSelected === DB.tf[State.tfIdx].a) State.tfScore++; 
            renderTab(); 
        }
        
        if (State.tab === 'mcq' && !State.mcqChecked) { 
            const t = e.target.closest('.opt-btn'); 
            State.mcqSelected = parseInt(t.dataset.idx); 
            State.mcqChecked = true; 
            if (State.mcqSelected === DB.mcq[State.mcqIdx].correct) State.mcqScore++; 
            renderTab(); 
        }
    }));
}

window.move = function(dir) {
    if (State.tab === 'cards') { State.cardsIdx += dir; State.cardsFlipped = false; }
    if (State.tab === 'tf') { State.tfIdx += dir; State.tfChecked = false; State.tfSelected = null; }
    if (State.tab === 'mcq') { State.mcqIdx += dir; State.mcqChecked = false; State.mcqSelected = null; }
    if (State.tab === 'fill') { State.fillIdx += dir; State.fillChecked = false; State.fillVal = ''; }
    if (State.tab === 'comp') { State.compIdx += dir; State.compChecked = false; }
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
    renderTab();
}

window.restartQuiz = function(tab) {
    if (tab === 'cards') { State.cardsIdx = 0; State.cardsFlipped = false; }
    if (tab === 'tf') { State.tfIdx = 0; State.tfScore = 0; State.tfChecked = false; State.tfSelected = null; }
    if (tab === 'mcq') { State.mcqIdx = 0; State.mcqScore = 0; State.mcqChecked = false; State.mcqSelected = null; }
    if (tab === 'fill') { State.fillIdx = 0; State.fillScore = 0; State.fillChecked = false; State.fillVal = ''; }
    if (tab === 'comp') { State.compIdx = 0; State.compChecked = false; }
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
    renderTab();
}

document.addEventListener('DOMContentLoaded', initApp);
