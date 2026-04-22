// --- تهيئة قاعدة البيانات وربط المتغيرات الجديدة ---
const DB = {
    mindmapTree: typeof Mind_Map !== 'undefined' ? Mind_Map.children : null,
    
    cards: typeof Flash_Cards !== 'undefined' ? Flash_Cards.map(item => ({
        q: item.question, 
        a: item.answer
    })) : null,
    
    tf: typeof True_False !== 'undefined' ? True_False.map(item => ({
        q: item.text, 
        a: item.answer,
        exp: item.explanation // جلب التوضيح
    })) : null,
    
    mcq: typeof Multiple_Choice !== 'undefined' ? Multiple_Choice.map(item => ({
        q: item.q, 
        opts: item.options, 
        correct: item.correctIndex,
        exp: item.rationale // جلب التوضيح
    })) : null,
    
    fill: typeof Fill_Blank !== 'undefined' ? Fill_Blank.map(item => ({
        q: item.text, 
        a: item.answer
    })) : null,
    
    comp: typeof Compare !== 'undefined' ? Compare.map(item => {
        let ansText = item.criteria.map(c => 
            `<div class="mb-3 text-right">
                <span class="font-black text-[color:var(--accent-primary)] border-b-2 border-dashed border-[color:var(--border-color)] pb-1">▪️ ${c.label}</span>
                <div class="mt-2 text-sm">
                    <span class="font-bold">${item.caseA_label}:</span> ${c.answerA}<br>
                    <span class="font-bold mt-1 inline-block">${item.caseB_label}:</span> ${c.answerB}
                </div>
            </div>`
        ).join('');
        return { q: item.title, a: ansText };
    }) : null,
    
    qa: null 
};

// --- المظاهر الأربعة (تدرجات الأخضر حصراً) ---
const THEMES = [
    {
        name: "الأخضر الأصلي", 
        vars: {
            '--bg-main': 'linear-gradient(135deg, #4b6856 0%, #283b2f 100%)',
            '--bg-panel': 'rgba(170, 187, 165, 0.9)', '--bg-panel-solid': '#aabba5', '--bg-panel-hover': '#96a891',
            '--border-color': '#074344', '--accent-primary': '#074344', '--accent-text': '#ffffff', '--text-main': '#111111', '--text-muted': '#283b2f',
            '--accent-green': '#10b981', '--accent-danger': '#ef4444'
        }
    },
    {
        name: "الأخضر الرمادي", 
        vars: {
            '--bg-main': 'linear-gradient(135deg, #71897b 0%, #4b6856 100%)',
            '--bg-panel': 'rgba(245, 247, 245, 0.9)', '--bg-panel-solid': '#f4f7f5', '--bg-panel-hover': '#e2e8e4',
            '--border-color': '#4b6856', '--accent-primary': '#283b2f', '--accent-text': '#ffffff', '--text-main': '#111111', '--text-muted': '#4b6856',
            '--accent-green': '#10b981', '--accent-danger': '#ef4444'
        }
    },
    {
        name: "المريمية الهادئة", 
        vars: {
            '--bg-main': 'linear-gradient(135deg, #aabba5 0%, #768f71 100%)',
            '--bg-panel': 'rgba(255, 255, 255, 0.8)', '--bg-panel-solid': '#f0f5ee', '--bg-panel-hover': '#e1e9dd',
            '--border-color': '#4b6856', '--accent-primary': '#283b2f', '--accent-text': '#ffffff', '--text-main': '#111111', '--text-muted': '#4b6856',
            '--accent-green': '#10b981', '--accent-danger': '#ef4444'
        }
    },
    {
name: "الرمادي",
        vars: {
            '--bg-main': 'hsl(210, 13%, 95%)',
            '--bg-panel': 'hsl(204, 12.2%, 91.96%)', '--bg-panel-solid': 'hsl(210, 13%, 88%)', '--bg-panel-hover': 'hsl(204, 12%, 75%)',
            '--border-color': 'hsl(204, 12%, 65%)', '--accent-primary': 'hsl(203, 12%, 35%)', '--accent-text': '#ffffff', '--text-main': '#333333', '--text-muted': '#8d8d8d',
            '--accent-green': '#359c06', '--accent-danger': '#a94442'
        }
    }
];

const State = {
    tab: 'mindmap',
    fontSize: parseInt(localStorage.getItem('fontSize')) || 18,
    
    cardsIdx: 0, cardsFlipped: false,
    tfIdx: 0, tfSelected: null, tfChecked: false, tfScore: 0,
    mcqIdx: 0, mcqSelected: null, mcqChecked: false, mcqScore: 0,
    fillIdx: 0, fillVal: '', fillChecked: false, fillScore: 0,
    compIdx: 0, compChecked: false, compScore: 0
};

const DOM = {
    app: document.getElementById('app-container'),
    content: document.getElementById('content-area'),
    tabs: document.querySelectorAll('.pill-btn'),
    mobileSelect: document.getElementById('mobile-tab-select'),
    themeSelect: document.getElementById('theme-select'),
    btnFontUp: document.getElementById('btn-font-up'),
    btnFontDown: document.getElementById('btn-font-down')
};

function updateTabCounters() {
    const counts = {
        cards: DB.cards ? DB.cards.length : 0,
        tf: DB.tf ? DB.tf.length : 0,
        mcq: DB.mcq ? DB.mcq.length : 0,
        fill: DB.fill ? DB.fill.length : 0,
        comp: DB.comp ? DB.comp.length : 0
    };
    
    if(DOM.mobileSelect) {
        DOM.mobileSelect.querySelectorAll('option').forEach(opt => {
            const val = opt.value;
            if (counts[val] !== undefined && counts[val] > 0) {
                opt.textContent = opt.textContent.split(' (')[0] + ` (${counts[val]})`;
            }
        });
    }
    
    if(DOM.tabs) {
        DOM.tabs.forEach(btn => {
            const val = btn.dataset.tab;
            if (counts[val] !== undefined && counts[val] > 0) {
                btn.textContent = btn.textContent.split(' (')[0] + ` (${counts[val]})`;
            }
        });
    }
}

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

function initApp() {
    randomizeAllQuestions(); 
    updateTabCounters();
    applyFontSize();
    
    const savedTheme = localStorage.getItem('selectedThemeIdx');
    const defaultThemeIdx = savedTheme !== null && THEMES[savedTheme] ? parseInt(savedTheme) : 0;
    if(DOM.themeSelect) DOM.themeSelect.value = defaultThemeIdx;
    applyTheme(defaultThemeIdx);

    if(DOM.themeSelect) {
        DOM.themeSelect.addEventListener('change', (e) => {
            applyTheme(parseInt(e.target.value));
        });
    }

    if(DOM.btnFontUp) DOM.btnFontUp.addEventListener('click', () => changeFont(2));
    if(DOM.btnFontDown) DOM.btnFontDown.addEventListener('click', () => changeFont(-2));
    
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
        DOM.tabs.forEach(btn => {
            btn.addEventListener('click', (e) => {
                DOM.tabs.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                State.tab = e.target.dataset.tab;
                if(DOM.mobileSelect) DOM.mobileSelect.value = State.tab; 
                randomizeAllQuestions();
                window.restartQuiz(State.tab); 
            });
        });
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
    State.fontSize = Math.max(14, Math.min(32, State.fontSize + val));
    localStorage.setItem('fontSize', State.fontSize); 
    applyFontSize();
}

function applyFontSize() { 
    if(DOM.app) DOM.app.style.fontSize = State.fontSize + 'px'; 
}

function renderTab() {
    if(!DOM.content) return;
    let html = '';
    switch(State.tab) {
        case 'mindmap': html = renderMindmap(); break;
        case 'qa': html = renderQA(); break;
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
        <div class="flex justify-between text-sm font-bold text-[color:var(--text-muted)] mb-2">
            <span>مؤشر التقدم</span>
            <span>${current + 1 > total ? total : current + 1} / ${total}</span>
        </div>
        <div class="progress-container">
            <div class="progress-bar" style="width: ${perc}%"></div>
        </div>
    `;
}

function renderFinishScreen(title, score, total, tabKey) {
    const perc = Math.round((score / total) * 100);
    let msg = perc > 85 ? 'ممتاز جداً! نتيجة مبهرة 🌟' : (perc >= 50 ? 'جيد، استمر في المراجعة لتمكين المعلومات 👍' : 'تحتاج إلى إعادة القراءة بتركيز 📚');
    return `
        <div class="text-center py-12 flex flex-col items-center animate-fade-in">
            <div class="text-7xl mb-6">🏆</div>
            <h2 class="text-3xl font-black mb-3 text-[color:var(--accent-primary)]">إنجاز قسم: ${title}</h2>
            <p class="text-xl mb-8 font-bold text-[color:var(--text-muted)]">${msg}</p>
            
            <div class="bg-[color:var(--bg-panel-solid)] border-2 border-[color:var(--border-color)] rounded-3xl p-10 mb-8 inline-block shadow-sm">
                <div class="text-7xl font-black text-[color:var(--accent-primary)] mb-3">${score} <span class="text-3xl text-[color:var(--text-muted)] opacity-60">/ ${total}</span></div>
                <div class="text-xl font-bold text-[color:var(--text-muted)] bg-[color:var(--bg-panel)] py-2 px-6 rounded-full border-2 border-[color:var(--border-color)] inline-block">النسبة: ${perc}%</div>
            </div>
            
            <button class="action-btn max-w-sm text-lg py-4" onclick="window.restartQuiz('${tabKey}')">
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

    let html = `<li class="tree-node">`;
    html += `
        <div class="tree-content ${rootClass} ${pointerClass}" 
             ${hasChildren ? `onclick="window.toggleNode(this)"` : ''}>
            <span>${node.title}</span>
            ${toggleIcon}
        </div>
    `;
    if (hasChildren) {
        html += `<ul class="tree-list pr-10 mt-3 transition-all">`;
        node.children.forEach(child => { html += buildTreeHTML(child, level + 1); });
        html += `</ul>`;
    }
    html += `</li>`;
    return html;
}

function renderMindmap() {
    if(!DB.mindmapTree) return '<div class="text-center p-8">لا توجد بيانات للمشجرة</div>';
    let treeHTML = `<ul class="tree-list root-list pr-0">`;
    DB.mindmapTree.forEach(node => { treeHTML += buildTreeHTML(node, 0); });
    treeHTML += `</ul>`;
    return `
        <div class="mb-8 text-center bg-[color:var(--bg-panel-solid)] border-2 border-[color:var(--border-color)] p-4 rounded-xl">
            <h2 class="text-2xl font-black text-[color:var(--accent-primary)] mb-2">المشجرة التفصيلية</h2>
            <p class="text-sm font-bold text-[color:var(--text-muted)]">انقر على العُقَد للتوسيع والطي.</p>
        </div>
        <div class="overflow-x-auto pb-4 px-2">${treeHTML}</div>
    `;
}

function renderQA() {
    if(!DB.qa) return '<div class="text-center p-8">لا توجد بيانات للأسئلة</div>';
    return ''; // الكود المحذوف اختصاراً كونه لم يتغير
}

function renderCards() {
    if(!DB.cards || DB.cards.length === 0) return '<div class="text-center p-8">لا توجد بطاقات</div>';
    if (State.cardsIdx >= DB.cards.length) return renderFinishScreen('البطاقات الذكية', DB.cards.length, DB.cards.length, 'cards');
    const data = DB.cards[State.cardsIdx];
    return `
        ${getProgressBar(State.cardsIdx, DB.cards.length)}
        <div class="flip-card mt-10 mb-6" id="action-flip">
            <div class="flip-card-inner ${State.cardsFlipped ? 'rotate-y-180' : ''}" style="transform: ${State.cardsFlipped ? 'rotateY(180deg)' : 'none'}">
                <div class="flip-card-front">
                    <div class="text-sm font-bold text-[color:var(--text-muted)] mb-4 absolute top-6 bg-[color:var(--bg-main)] px-4 py-1 rounded-full border-2 border-[color:var(--border-color)]">👆 انقر لقلب البطاقة</div>
                    <div class="px-4 text-center mt-6">${data.q}</div>
                </div>
                <div class="flip-card-back">
                    <div class="text-sm font-bold mb-4 absolute top-6 bg-black/20 px-4 py-1 rounded-full text-[color:var(--accent-text)] border-2 border-[color:var(--accent-text)]">الإجابة</div>
                    <div class="px-4 text-center mt-6 text-xl">${data.a}</div>
                </div>
            </div>
        </div>
        <div class="flex justify-center mt-10 gap-4">
            <button class="action-btn max-w-[140px] bg-[color:var(--bg-panel-solid)] text-[color:var(--text-main)] hover:bg-[color:var(--bg-panel-hover)]" onclick="move(-1)" ${State.cardsIdx === 0 ? 'disabled' : ''}>السابق</button>
            <button class="action-btn max-w-[200px]" id="btn-next">التالي 🡄</button>
        </div>
    `;
}

function renderTF() {
    if(!DB.tf || DB.tf.length === 0) return '<div class="text-center p-8">لا توجد أسئلة صواب وخطأ</div>';
    if (State.tfIdx >= DB.tf.length) return renderFinishScreen('الصواب والخطأ', State.tfScore, DB.tf.length, 'tf');
    const data = DB.tf[State.tfIdx];
    let msgHTML = '';
    
    if (State.tfChecked) {
        const isCorrect = State.tfSelected === data.a;
        msgHTML = `<div class="p-6 mt-8 rounded-2xl border-2 animate-fade-in ${isCorrect ? 'bg-[color:var(--accent-green)] text-white border-[color:var(--accent-green)]' : 'bg-[color:var(--accent-danger)] text-white border-[color:var(--accent-danger)]'}">
            <div class="font-black text-2xl text-center mb-3">
                ${isCorrect ? '✅ إجابة دقيقة!' : '❌ إجابة خاطئة! الجواب الصحيح هو: ' + (data.a ? 'صواب' : 'خطأ')}
            </div>
            <div class="pt-4 mt-2 border-t border-white/30 text-lg font-bold leading-relaxed text-right">
                💡 التوضيح: ${data.exp}
            </div>
        </div>`;
    }
    
    return `
        ${getProgressBar(State.tfIdx, DB.tf.length)}
        <div class="relative bg-[color:var(--bg-panel-solid)] border-2 border-[color:var(--border-color)] p-8 md:p-10 rounded-3xl mt-12 mb-10">
            <div class="absolute -top-5 right-8 bg-[color:var(--accent-primary)] text-[color:var(--accent-text)] px-6 py-2 rounded-xl font-black border-2 border-[color:var(--bg-panel)]">حقيقة أم خرافة؟</div>
            <h3 class="text-2xl font-black text-center leading-relaxed text-[color:var(--text-main)] mt-4">${data.q}</h3>
        </div>
        <div class="grid grid-cols-2 gap-6">
            <button class="opt-btn p-6 rounded-2xl font-black text-2xl transition-all ${State.tfSelected === true ? 'selected' : ''}" data-val="true">✅ صواب</button>
            <button class="opt-btn p-6 rounded-2xl font-black text-2xl transition-all ${State.tfSelected === false ? 'selected' : ''}" data-val="false">❌ خطأ</button>
        </div>
        ${msgHTML}
        <div class="flex justify-center mt-10">
            <button class="action-btn max-w-sm text-xl py-4" id="btn-next" ${!State.tfChecked ? 'disabled' : ''}>
                ${State.tfIdx === DB.tf.length - 1 ? 'إنهاء الاختبار' : 'السؤال التالي 🡄'}
            </button>
        </div>
    `;
}

function renderMCQ() {
    if(!DB.mcq || DB.mcq.length === 0) return '<div class="text-center p-8">لا توجد أسئلة اختيارات</div>';
    if (State.mcqIdx >= DB.mcq.length) return renderFinishScreen('الاختيار من متعدد', State.mcqScore, DB.mcq.length, 'mcq');
    const data = DB.mcq[State.mcqIdx];
    let msgHTML = '';
    
    let optsHTML = data.opts.map((opt, i) => {
        let classes = "opt-btn p-5 rounded-2xl font-bold text-right mb-4 block w-full transition-all text-lg ";
        if (State.mcqChecked) {
            if (i === data.correct) classes += "correct relative z-10";
            else if (i === State.mcqSelected) classes += "wrong";
            else classes += "opacity-50 grayscale";
        } else if (State.mcqSelected === i) classes += "selected";
        return `<button class="${classes}" data-idx="${i}"><span class="inline-block bg-[color:var(--bg-main)] text-[color:var(--text-main)] rounded-lg px-3 py-1 font-black text-sm ml-3 border-2 border-[color:var(--border-color)]">${String.fromCharCode(1613 + i)}</span> ${opt}</button>`;
    }).join('');
    
    if (State.mcqChecked) {
        const isCorrect = State.mcqSelected === data.correct;
        msgHTML = `<div class="p-6 mt-6 rounded-2xl border-2 animate-fade-in ${isCorrect ? 'bg-[color:var(--accent-green)] text-white border-[color:var(--accent-green)]' : 'bg-[color:var(--accent-danger)] text-white border-[color:var(--accent-danger)]'}">
            <div class="font-black text-2xl text-center mb-3">
                ${isCorrect ? '✅ إجابة صحيحة!' : '❌ إجابة خاطئة!'}
            </div>
            <div class="pt-4 mt-2 border-t border-white/30 text-lg font-bold leading-relaxed text-right">
                💡 التوضيح: ${data.exp}
            </div>
        </div>`;
    }
    
    return `
        ${getProgressBar(State.mcqIdx, DB.mcq.length)}
        <div class="bg-[color:var(--bg-panel-solid)] border-2 border-[color:var(--border-color)] border-r-8 border-r-[color:var(--accent-primary)] p-6 md:p-8 rounded-2xl mt-8 mb-8">
            <h3 class="text-2xl font-black leading-relaxed text-[color:var(--text-main)]">${data.q}</h3>
        </div>
        <div class="mt-4">${optsHTML}</div>
        ${msgHTML}
        <div class="flex justify-center mt-10">
            <button class="action-btn max-w-sm text-xl py-4" id="btn-next" ${!State.mcqChecked ? 'disabled' : ''}>
                 ${State.mcqIdx === DB.mcq.length - 1 ? 'إنهاء الاختبار' : 'السؤال التالي 🡄'}
            </button>
        </div>
    `;
}

function renderFill() {
    if(!DB.fill || DB.fill.length === 0) return '<div class="text-center p-8">لا توجد أسئلة فراغات</div>';
    if (State.fillIdx >= DB.fill.length) return renderFinishScreen('املأ الفراغ', State.fillScore, DB.fill.length, 'fill');
    const data = DB.fill[State.fillIdx];
    const textHTML = data.q.replace('______', `<span class="inline-block border-b-4 border-dashed border-[color:var(--accent-primary)] w-32 mx-3 text-center text-sm align-middle h-10 text-[color:var(--text-muted)] bg-[color:var(--bg-main)] rounded-t-lg"></span>`);
    let msgHTML = '';
    
    if(State.fillChecked) {
        const userVal = State.fillVal.trim();
        let isCorrect = false;
        
        if (userVal !== '') {
            isCorrect = data.a.some(ans => ans.includes(userVal) || userVal.includes(ans));
        }

        if (isCorrect) State.fillScore++;
        
        // إظهار الإجابات المحتملة في حال الخطأ
        msgHTML = `<div class="p-6 mt-8 rounded-2xl border-2 text-center animate-fade-in ${isCorrect ? 'bg-[color:var(--accent-green)] text-white border-[color:var(--accent-green)]' : 'bg-[color:var(--accent-danger)] text-white border-[color:var(--accent-danger)]'}">
            <div class="font-black text-2xl">
                ${isCorrect ? '🎉 أحسنت! إجابة صحيحة.' : '💡 الإجابات الصحيحة المقبولة: ' + data.a.join(' أو ')}
            </div>
        </div>`;
    }
    return `
        ${getProgressBar(State.fillIdx, DB.fill.length)}
        <div class="bg-[color:var(--bg-panel-solid)] border-2 border-[color:var(--border-color)] p-8 md:p-12 rounded-3xl mt-10 mb-10 text-center">
            <div class="text-2xl font-black leading-loose text-[color:var(--text-main)]">${textHTML}</div>
        </div>
        
        <div class="relative max-w-lg mx-auto">
            <input type="text" id="fill-input" class="input-stylish text-center text-2xl font-black py-4" placeholder="اكتب الكلمة المفقودة هنا..." value="${State.fillVal}" ${State.fillChecked ? 'disabled' : ''} autocomplete="off">
        </div>
        
        ${msgHTML}
        
        ${!State.fillChecked ? `<div class="flex justify-center mt-8"><button class="action-btn max-w-xs bg-[color:var(--bg-panel-solid)] text-[color:var(--text-main)] hover:bg-[color:var(--bg-panel-hover)] border-2 border-[color:var(--border-color)]" id="btn-check">تحقق من الإجابة</button></div>` : ''}
        
        <div class="flex justify-center mt-10">
            <button class="action-btn max-w-sm text-xl py-4" id="btn-next" ${!State.fillChecked ? 'disabled' : ''}>
                ${State.fillIdx === DB.fill.length - 1 ? 'إنهاء الاختبار' : 'السؤال التالي 🡄'}
            </button>
        </div>
    `;
}

function renderComp() {
    if(!DB.comp || DB.comp.length === 0) return '<div class="text-center p-8">لا توجد أسئلة مقارنات</div>';
    if (State.compIdx >= DB.comp.length) return renderFinishScreen('المقارنات', DB.comp.length, DB.comp.length, 'comp');
    const data = DB.comp[State.compIdx];
    let ansHTML = '';
    
    if (State.compChecked) {
        ansHTML = `
            <div class="mt-10 border-t-2 border-dashed border-[color:var(--border-color)] pt-8 animate-fade-in relative">
                <div class="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[color:var(--accent-primary)] text-[color:var(--accent-text)] px-6 py-1 rounded-full font-black text-sm border-2 border-[color:var(--bg-panel)]">الإجابة النموذجية</div>
                <div class="grid grid-cols-1 gap-6 mt-4">
                    <div class="p-6 bg-[color:var(--bg-panel-solid)] text-[color:var(--text-main)] rounded-2xl text-lg leading-relaxed border-2 border-[color:var(--accent-green)] relative">
                        <div class="w-full text-right">${data.a}</div>
                    </div>
                </div>
            </div>
        `;
    }
    return `
        ${getProgressBar(State.compIdx, DB.comp.length)}
        <div class="bg-[color:var(--bg-panel-solid)] border-2 border-[color:var(--border-color)] p-6 rounded-2xl mt-10 mb-8">
            <h3 class="text-2xl font-black text-center text-[color:var(--accent-primary)]"> ${data.q} </h3>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
                <div class="p-4 bg-[color:var(--accent-primary)] text-[color:var(--accent-text)] rounded-t-2xl text-center font-black text-xl border-b-2 border-black/20">المفهوم الأول</div>
                <textarea class="input-stylish rounded-t-none rounded-b-2xl h-40 resize-none text-lg leading-relaxed" placeholder="اكتب الخصائص والفروق هنا..." ${State.compChecked ? 'disabled' : ''}></textarea>
            </div>
            <div>
                <div class="p-4 bg-[color:var(--accent-primary)] text-[color:var(--accent-text)] rounded-t-2xl text-center font-black text-xl border-b-2 border-black/20">المفهوم الثاني</div>
                <textarea class="input-stylish rounded-t-none rounded-b-2xl h-40 resize-none text-lg leading-relaxed" placeholder="اكتب الخصائص والفروق هنا..." ${State.compChecked ? 'disabled' : ''}></textarea>
            </div>
        </div>
        
        ${!State.compChecked ? `<div class="flex justify-center mt-6"><button class="action-btn max-w-sm bg-[color:var(--bg-panel-solid)] text-[color:var(--text-main)] hover:bg-[color:var(--bg-panel-hover)] border-2 border-[color:var(--border-color)] text-lg" id="btn-check">إنهاء المقارنة وعرض الإجابة</button></div>` : ''}
        
        ${ansHTML}
        
        <div class="flex justify-center mt-12">
            <button class="action-btn max-w-sm text-xl py-4" id="btn-next" ${!State.compChecked ? 'disabled' : ''}>
                ${State.compIdx === DB.comp.length - 1 ? 'إنهاء القسم' : 'انتقل للمقارنة التالية 🡄'}
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
    
    if(flip) flip.addEventListener('click', () => { State.cardsFlipped = !State.cardsFlipped; renderTab(); });

    document.querySelectorAll('.opt-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (State.tab === 'tf' && !State.tfChecked) {
                const target = e.target.closest('.opt-btn');
                State.tfSelected = target.dataset.val === 'true';
                State.tfChecked = true;
                if (State.tfSelected === DB.tf[State.tfIdx].a) State.tfScore++;
                renderTab();
            }
            if (State.tab === 'mcq' && !State.mcqChecked) {
                const target = e.target.closest('.opt-btn');
                State.mcqSelected = parseInt(target.dataset.idx);
                State.mcqChecked = true;
                if (State.mcqSelected === DB.mcq[State.mcqIdx].correct) State.mcqScore++;
                renderTab();
            }
        });
    });
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