// State
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let cards = JSON.parse(localStorage.getItem('cards')) || [];
let cardExpenses = JSON.parse(localStorage.getItem('cardExpenses')) || [];
let incomes = JSON.parse(localStorage.getItem('incomes')) || {};
let defaultIncome = parseFloat(localStorage.getItem('defaultIncome')) || 0;
let currentDate = new Date();

// --- CONFIGURAÇÃO FIREBASE NUVEM ---
const firebaseConfig = {
    apiKey: "AIzaSyDXKYLdSr6vZvQurmzB5lSx22TwgDX_GLg",
    authDomain: "lgfinanceiro.firebaseapp.com",
    projectId: "lgfinanceiro",
    databaseURL: "https://lgfinanceiro-default-rtdb.firebaseio.com",
    storageBucket: "lgfinanceiro.firebasestorage.app",
    messagingSenderId: "703508618933",
    appId: "1:703508618933:web:519136ef9ab8d6698328fc"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

let currentUser = null;
let currentDbRef = null;
let isLoginMode = true;

// Handle Auth State Changes
auth.onAuthStateChanged((user) => {
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');

    if (user) {
        currentUser = user;
        authContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');

        // Sincronizar dados do Firebase para este usuário específico
        if (currentDbRef) currentDbRef.off();
        currentDbRef = database.ref('/users/' + user.uid);

        currentDbRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                expenses = data.expenses || [];
                cards = data.cards || [];
                cardExpenses = data.cardExpenses || [];
                incomes = data.incomes || {};
                defaultIncome = parseFloat(data.defaultIncome) || 0;

                // Backup local extra
                localStorage.setItem('expenses', JSON.stringify(expenses));
                localStorage.setItem('cards', JSON.stringify(cards));
                localStorage.setItem('cardExpenses', JSON.stringify(cardExpenses));
                localStorage.setItem('incomes', JSON.stringify(incomes));
                localStorage.setItem('defaultIncome', defaultIncome.toString());

                render();
            } else {
                // Primeira vez do usuário, se houver dado local, envia para a nuvem
                if (expenses.length > 0 || cards.length > 0 || defaultIncome > 0 || cardExpenses.length > 0) {
                    saveData();
                } else {
                    render();
                }
            }
        });
    } else {
        // Deslogado
        currentUser = null;
        if (currentDbRef) {
            currentDbRef.off();
            currentDbRef = null;
        }

        authContainer.classList.remove('hidden');
        appContainer.classList.add('hidden');

        // Limpar dados locais da memória temporária ao sair
        expenses = [];
        cards = [];
        cardExpenses = [];
        incomes = {};
        defaultIncome = 0;
        localStorage.clear();

        // Resetar interface manual para evitar vazamentos
        document.getElementById('total-income').textContent = 'R$ 0,00';
        document.getElementById('total-expense').textContent = 'R$ 0,00';
        document.getElementById('total-balance').textContent = 'R$ 0,00';
        document.getElementById('expenses-body').innerHTML = '';
        document.getElementById('cards-grid').innerHTML = '';
        document.getElementById('card-expenses-body').innerHTML = '';
    }
});
// -----------------------------------

// Logos
const bankLogos = {
    'nubank': 'https://logo.clearbit.com/nubank.com.br',
    'itau': 'https://logo.clearbit.com/itau.com.br',
    'bradesco': 'https://logo.clearbit.com/bradesco.com.br',
    'santander': 'https://logo.clearbit.com/santander.com.br',
    'bb': 'https://logo.clearbit.com/bb.com.br',
    'inter': 'https://logo.clearbit.com/bancointer.com.br',
    'c6': 'https://logo.clearbit.com/c6bank.com.br',
    'outros': 'https://logo.clearbit.com/visa.com'
};

document.addEventListener('DOMContentLoaded', () => {
    // Initial dates
    document.getElementById('expense-date').valueAsDate = new Date();
    document.getElementById('ce-date').valueAsDate = new Date();

    // Header Listeners
    document.getElementById('prev-month').addEventListener('click', () => changeMonth(-1));
    document.getElementById('next-month').addEventListener('click', () => changeMonth(1));

    // Tab Listeners
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Income Listeners
    document.getElementById('edit-income-btn').addEventListener('click', () => openModal('income-modal'));
    document.getElementById('income-form').addEventListener('submit', handleSetIncome);

    // Form Listeners
    document.getElementById('expense-form').addEventListener('submit', handleAddExpense);

    // Card Listeners
    document.getElementById('btn-add-card').addEventListener('click', () => openModal('card-modal'));
    document.getElementById('card-form').addEventListener('submit', handleAddCard);

    document.getElementById('btn-add-card-expense').addEventListener('click', () => {
        updateCardSelector();
        if (cards.length === 0) {
            alert('Você precisa adicionar um cartão de crédito primeiro!');
            return;
        }
        openModal('card-expense-modal');
    });
    document.getElementById('card-expense-form').addEventListener('submit', handleAddCardExpense);

    // Modal close
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal').classList.add('hidden');
        });
    });

    // Auth Listeners
    document.getElementById('toggle-auth').addEventListener('click', () => {
        isLoginMode = !isLoginMode;
        document.getElementById('auth-title').textContent = isLoginMode ? 'Entrar' : 'Cadastrar';
        document.getElementById('auth-submit-btn').textContent = isLoginMode ? 'Entrar' : 'Cadastrar';
        document.querySelector('#toggle-auth span').textContent = isLoginMode ? 'Registre-se' : 'Faça Login';
        document.getElementById('auth-error').style.display = 'none';
    });

    document.getElementById('auth-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('auth-email').value;
        const pass = document.getElementById('auth-password').value;
        const errorDiv = document.getElementById('auth-error');
        errorDiv.style.display = 'none';

        if (isLoginMode) {
            auth.signInWithEmailAndPassword(email, pass).catch(err => {
                errorDiv.textContent = 'Erro ao entrar. E-mail ou senha incorretos.';
                errorDiv.style.display = 'block';
            });
        } else {
            auth.createUserWithEmailAndPassword(email, pass).catch(err => {
                errorDiv.textContent = 'Erro ao cadastrar: ' + err.message;
                errorDiv.style.display = 'block';
            });
        }
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
        auth.signOut();
    });

    // Initialize Interactive Background
    initInteractiveBackground();

    // Initial Render
    render();
});

function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active', 'hidden'));

    document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
    document.querySelectorAll('.tab-content').forEach(c => {
        if (c.id === tabId) c.classList.add('active');
        else c.classList.add('hidden');
    });
}

function openModal(id) {
    const modal = document.getElementById(id);
    modal.classList.remove('hidden');
    // auto focus first input
    const firstInput = document.querySelector(`#${id} input`);
    if (firstInput) firstInput.focus();

    // Specific logic for income modal
    if (id === 'income-modal') {
        const incomeInput = document.getElementById('income-input');
        const key = getMonthKey(currentDate);
        incomeInput.value = incomes[key] || defaultIncome || '';
        const applyGlobalCheckbox = document.getElementById('apply-global');
        if (applyGlobalCheckbox) {
            // If there's a month-specific income, uncheck "apply globally"
            applyGlobalCheckbox.checked = !(incomes[key]);
        }
    }
}

function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
}

function getMonthKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getFullMonthName(date) {
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

function changeMonth(delta) {
    currentDate.setMonth(currentDate.getMonth() + delta);
    render();
}

// Data Handling Functions
function saveData() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
    localStorage.setItem('cards', JSON.stringify(cards));
    localStorage.setItem('cardExpenses', JSON.stringify(cardExpenses));
    localStorage.setItem('incomes', JSON.stringify(incomes));
    localStorage.setItem('defaultIncome', defaultIncome.toString());

    // Salvar na Nuvem (Firebase) separado por Usuário logado
    if (currentUser) {
        database.ref('/users/' + currentUser.uid).set({
            expenses: expenses,
            cards: cards,
            cardExpenses: cardExpenses,
            incomes: incomes,
            defaultIncome: defaultIncome
        });
    }
}

// ---------------- INCOMES -----------------
function handleSetIncome(e) {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('income-input').value);
    const applyGlobal = document.getElementById('apply-global')?.checked ?? true; // fallback true

    if (!isNaN(amount)) {
        if (applyGlobal) {
            defaultIncome = amount;
            // Optionally clear specific month incomes so default takes over
            incomes = {};
        } else {
            incomes[getMonthKey(currentDate)] = amount;
        }

        saveData();
        closeModal('income-modal');
        render();
    }
}

// ---------------- CASH EXPENSES -----------------
function handleAddExpense(e) {
    e.preventDefault();
    const desc = document.getElementById('expense-desc').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const category = document.getElementById('expense-category').value;
    const dateStr = document.getElementById('expense-date').value;

    expenses.push({
        id: Date.now().toString(),
        desc, amount, category,
        date: dateStr,
        monthKey: dateStr.substring(0, 7)
    });

    saveData();
    e.target.reset();
    document.getElementById('expense-date').valueAsDate = new Date();
    render();
}

function deleteExpense(id) {
    if (confirm('Apagar gasto à vista?')) {
        expenses = expenses.filter(exp => exp.id !== id);
        saveData();
        render();
    }
}

// ---------------- CARDS -----------------
function handleAddCard(e) {
    e.preventDefault();
    const name = document.getElementById('card-name').value;
    const bank = document.getElementById('card-bank').value;
    const closingDay = parseInt(document.getElementById('card-closing').value);
    const dueDay = parseInt(document.getElementById('card-due').value);

    cards.push({
        id: Date.now().toString(),
        name, bank, closingDay, dueDay
    });

    saveData();
    e.target.reset();
    closeModal('card-modal');
    render();
}

function deleteCard(id) {
    if (confirm('Tem certeza? Isso apagará o cartão, mas não as compras já registradas nele (ficarão orfãs).')) {
        cards = cards.filter(c => c.id !== id);
        saveData();
        render();
    }
}

function updateCardSelector() {
    const select = document.getElementById('expense-card-id');
    select.innerHTML = '';
    cards.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.name;
        select.appendChild(opt);
    });
}

function handleAddCardExpense(e) {
    e.preventDefault();
    const cardId = document.getElementById('expense-card-id').value;
    const desc = document.getElementById('ce-desc').value;
    const amount = parseFloat(document.getElementById('ce-amount').value);
    const installments = parseInt(document.getElementById('ce-installments').value);
    const dateStr = document.getElementById('ce-date').value;

    cardExpenses.push({
        id: Date.now().toString(),
        cardId, desc, amount, installments,
        date: dateStr
    });

    saveData();
    e.target.reset();
    document.getElementById('ce-date').valueAsDate = new Date();
    closeModal('card-expense-modal');
    render();
}

function deleteCardExpense(id) {
    if (confirm('Apagar esta compra inteira e todas as suas parcelas?')) {
        cardExpenses = cardExpenses.filter(ce => ce.id !== id);
        saveData();
        render();
    }
}

// ---------------- CALCULATIONS & RENDER -----------------

// This function processes all card expenses and maps which installments hit the CURRENT VIEWING MONTH
function getInvoicesForCurrentMonth() {
    const viewY = currentDate.getFullYear();
    const viewM = currentDate.getMonth() + 1; // 1 to 12

    let installmentsThisMonth = [];

    cardExpenses.forEach(ce => {
        const card = cards.find(c => c.id === ce.cardId);
        if (!card) return; // card deleted

        const purchaseDate = new Date(ce.date + 'T00:00:00');
        const pY = purchaseDate.getFullYear();
        const pM = purchaseDate.getMonth() + 1;
        const pD = purchaseDate.getDate();

        // Find the "base" invoice month for installment 1
        // Usually: if purchased before closing day, falls in the SAME month (but due next month sometimes depending on bank)
        // Brazilian Credit Card Rule (approximation):
        // If purchase day >= closing day, it falls into next month's invoice.
        // Fatura do Mês M (ex: Fatura de Março) is the group of expenses closed in Mar and Paid in Mar or early Apr.
        // Let's standardise: The invoice of Month X includes purchases from (closingDay of X-1) to (closingDay of X - 1).

        let firstInvoiceM = pM;
        let firstInvoiceY = pY;

        if (pD >= card.closingDay) {
            firstInvoiceM += 1;
            if (firstInvoiceM > 12) {
                firstInvoiceM = 1;
                firstInvoiceY += 1;
            }
        }

        // Loop through all installments to see if any fall in viewY/viewM
        for (let i = 0; i < ce.installments; i++) {
            let instM = firstInvoiceM + i;
            let instY = firstInvoiceY;

            while (instM > 12) { instM -= 12; instY += 1; }

            if (instM === viewM && instY === viewY) {
                installmentsThisMonth.push({
                    expenseId: ce.id,
                    cardId: ce.cardId,
                    cardName: card.name,
                    desc: ce.desc,
                    date: ce.date,
                    amount: ce.amount / ce.installments,
                    currentInstallment: i + 1,
                    totalInstallments: ce.installments
                });
            }
        }
    });

    return installmentsThisMonth; // Array of installments due this month
}

function render() {
    const label = getFullMonthName(currentDate);
    document.getElementById('current-month-display').textContent = label;
    document.getElementById('invoice-month-display').textContent = label;

    const key = getMonthKey(currentDate);
    const income = incomes[key] || defaultIncome || 0;

    // CASH Expenses
    const monthlyCashExpenses = expenses.filter(exp => exp.monthKey === key).sort((a, b) => new Date(b.date) - new Date(a.date));
    const totalCashExpense = monthlyCashExpenses.reduce((s, e) => s + e.amount, 0);

    // CARD Expenses for this month
    const cardInstallmentsThisMonth = getInvoicesForCurrentMonth();
    const totalCardExpense = cardInstallmentsThisMonth.reduce((s, inst) => s + inst.amount, 0);

    const totalOverallExpense = totalCashExpense + totalCardExpense;
    const balance = income - totalOverallExpense;

    // Update Header
    document.getElementById('total-income').textContent = formatCurrency(income);
    document.getElementById('total-expense').textContent = formatCurrency(totalOverallExpense);
    document.getElementById('total-balance').textContent = formatCurrency(balance);

    const balanceEl = document.getElementById('total-balance');
    balanceEl.style.color = balance < 0 ? 'var(--danger)' : 'var(--text-main)';

    // Render Cash Table
    renderCashTable(monthlyCashExpenses, totalOverallExpense);

    // Render Cards Grid
    renderCardsGrid(cardInstallmentsThisMonth);

    // Render Card Invoices Table
    renderCardInvoicesTable(cardInstallmentsThisMonth);
}

function renderCashTable(expensesList, totalGlobalFilter) {
    const tbody = document.getElementById('expenses-body');
    const emptyState = document.getElementById('empty-state');
    const tableEl = document.getElementById('expenses-table');

    tbody.innerHTML = '';

    if (expensesList.length === 0) {
        emptyState.classList.remove('hidden');
        tableEl.classList.add('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    tableEl.classList.remove('hidden');

    expensesList.forEach(exp => {
        const pctGlobal = totalGlobalFilter > 0 ? ((exp.amount / totalGlobalFilter) * 100).toFixed(1) + '%' : '0%';
        const dayStr = exp.date.substring(8, 10) + '/' + exp.date.substring(5, 7);

        tbody.innerHTML += `
            <tr>
                <td>${dayStr}</td>
                <td><strong>${exp.desc}</strong></td>
                <td><span class="badge badge-${exp.category}">${exp.category.toUpperCase()}</span></td>
                <td>${formatCurrency(exp.amount)}</td>
                <td>${pctGlobal}</td>
                <td><button class="action-btn" onclick="deleteExpense('${exp.id}')"><i class="fa-solid fa-trash"></i></button></td>
            </tr>
        `;
    });
}

function renderCardsGrid(installmentsThisMonth) {
    const grid = document.getElementById('cards-grid');
    grid.innerHTML = '';

    cards.forEach(card => {
        // Find total invoice for this specific card
        const invoiceTotal = installmentsThisMonth
            .filter(inst => inst.cardId === card.id)
            .reduce((s, inst) => s + inst.amount, 0);

        const logoUrl = bankLogos[card.bank] || bankLogos['outros'];

        grid.innerHTML += `
            <div class="credit-card bank-${card.bank}">
                <div class="cc-top">
                    <div class="cc-name">${card.name}</div>
                    <div class="cc-bank-logo"><img src="${logoUrl}" alt="${card.bank}" onerror="this.src='https://logo.clearbit.com/visa.com'"></div>
                </div>
                <div class="cc-middle">
                    <div>Fech: ${card.closingDay}</div>
                    <div>Venc: ${card.dueDay}</div>
                </div>
                <div class="cc-bottom">
                    <div class="cc-invoice">${formatCurrency(invoiceTotal)}</div>
                    <button class="cc-delete" onclick="deleteCard('${card.id}')" title="Apagar Cartão"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;
    });
}

function renderCardInvoicesTable(installments) {
    const tbody = document.getElementById('card-expenses-body');
    const emptyState = document.getElementById('empty-cards-state');
    const tableEl = document.getElementById('card-expenses-table');

    tbody.innerHTML = '';

    if (installments.length === 0) {
        emptyState.classList.remove('hidden');
        tableEl.classList.add('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    tableEl.classList.remove('hidden');

    // Sort by date inside invoice
    installments.sort((a, b) => new Date(b.date) - new Date(a.date));

    installments.forEach(inst => {
        const dayStr = inst.date.substring(8, 10) + '/' + inst.date.substring(5, 7);
        const parcelStr = inst.totalInstallments > 1 ? `${inst.currentInstallment}/${inst.totalInstallments}` : 'À vista';

        tbody.innerHTML += `
            <tr>
                <td><strong>${inst.cardName}</strong></td>
                <td>${dayStr}</td>
                <td>${inst.desc}</td>
                <td>${parcelStr}</td>
                <td>${formatCurrency(inst.amount)}</td>
                <td><button class="action-btn" onclick="deleteCardExpense('${inst.expenseId}')"><i class="fa-solid fa-trash"></i></button></td>
            </tr>
        `;
    });
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

// ---------------- INTERACTIVE BACKGROUND -----------------
function initInteractiveBackground() {
    const canvas = document.createElement('canvas');
    canvas.id = 'bg-canvas';
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let width, height;

    let particles = [];
    let mouse = { x: -1000, y: -1000 };

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        initParticles();
    }

    function initParticles() {
        particles = [];
        const numParticles = Math.min(Math.floor((width * height) / 15000), 100);
        for (let i = 0; i < numParticles; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 2 + 1,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                baseAlpha: Math.random() * 0.5 + 0.1
            });
        }
    }

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseout', () => {
        mouse.x = -1000;
        mouse.y = -1000;
    });

    resize();

    function animate() {
        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
            // Move
            p.x += p.vx;
            p.y += p.vy;

            // Wrap
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;

            // Mouse interaction
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            let alpha = p.baseAlpha;
            if (dist < 180) {
                alpha += (180 - dist) / 180 * 0.9;

                // Cyberpunk data lines connecting to mouse
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                // Draw rigid/tech-looking angled lines rather than direct straight lines
                // or just straight sharp lines with neon color
                ctx.lineTo(mouse.x, mouse.y);
                ctx.strokeStyle = `rgba(0, 240, 255, ${((180 - dist) / 180) * 0.4})`;
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }

            // Draw tech elements (small squares/nodes) instead of circles
            ctx.fillStyle = `rgba(188, 19, 254, ${alpha})`;
            if (p.radius > 2) {
                // Draw a cross/target node for larger particles
                ctx.fillRect(p.x - p.radius, p.y - 1, p.radius * 2, 2);
                ctx.fillRect(p.x - 1, p.y - p.radius, 2, p.radius * 2);
            } else {
                // Draw standard square data node
                ctx.fillRect(p.x - p.radius, p.y - p.radius, p.radius * 2, p.radius * 2);
            }
        });

        requestAnimationFrame(animate);
    }

    animate();
}
