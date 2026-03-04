import { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Auth from './components/Auth'
import Header from './components/Header'
import ExpenseForm from './components/ExpenseForm'
import ExpensesTable from './components/ExpensesTable'
import CardsGrid from './components/CardsGrid'
import CardInvoicesTable from './components/CardInvoicesTable'
import Modal from './components/Modal'

function Dashboard() {
    const { data, saveData, loading } = useAuth()
    const [currentDate, setCurrentDate] = useState(new Date())
    const [activeTab, setActiveTab] = useState('cash')

    // Modal states
    const [incomeModal, setIncomeModal] = useState(false)
    const [cardModal, setCardModal] = useState(false)
    const [cardExpenseModal, setCardExpenseModal] = useState(false)
    const [editExpenseModal, setEditExpenseModal] = useState(false)

    // Edit expense states
    const [editId, setEditId] = useState(null)
    const [editDesc, setEditDesc] = useState('')
    const [editAmount, setEditAmount] = useState('')
    const [editCategory, setEditCategory] = useState('alimentacao')
    const [editDate, setEditDate] = useState('')

    // Modal form states
    const [incomeInput, setIncomeInput] = useState('')
    const [applyGlobal, setApplyGlobal] = useState(true)
    const [cardName, setCardName] = useState('')
    const [cardBank, setCardBank] = useState('nubank')
    const [cardClosing, setCardClosing] = useState('')
    const [cardDue, setCardDue] = useState('')
    const [ceCardId, setCeCardId] = useState('')
    const [ceDesc, setCeDesc] = useState('')
    const [ceAmount, setCeAmount] = useState('')
    const [ceInstallments, setCeInstallments] = useState('1')
    const [ceDate, setCeDate] = useState(new Date().toISOString().split('T')[0])

    if (loading) {
        return <div className="loading-screen"><div className="spinner" /></div>
    }

    const key = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    const monthLabel = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`

    const income = data.incomes[key] || data.defaultIncome || 0

    // Cash expenses
    const monthlyExpenses = (data.expenses || [])
        .filter(exp => exp.monthKey === key)
        .sort((a, b) => Number(a.id) - Number(b.id))
    const totalCash = monthlyExpenses.reduce((s, e) => s + e.amount, 0)

    // Card invoices
    const cardInstallments = getInvoicesForMonth(data.cards || [], data.cardExpenses || [], currentDate)
    const totalCard = cardInstallments.reduce((s, inst) => s + inst.amount, 0)

    const totalExpense = totalCash + totalCard
    const balance = income - totalExpense

    function changeMonth(delta) {
        const d = new Date(currentDate)
        d.setMonth(d.getMonth() + delta)
        setCurrentDate(d)
    }

    function addExpense(expense) {
        const newExpenses = [...(data.expenses || []), expense]
        saveData({ ...data, expenses: newExpenses })
    }

    function deleteExpense(id) {
        if (!confirm('Apagar gasto à vista?')) return
        saveData({ ...data, expenses: data.expenses.filter(e => e.id !== id) })
    }

    function openEditExpense(exp) {
        setEditId(exp.id)
        setEditDesc(exp.desc)
        setEditAmount(String(exp.amount))
        setEditCategory(exp.category)
        setEditDate(exp.date)
        setEditExpenseModal(true)
    }

    function handleEditExpense(e) {
        e.preventDefault()
        const updatedExpenses = (data.expenses || []).map(exp =>
            exp.id === editId
                ? { ...exp, desc: editDesc, amount: parseFloat(editAmount), category: editCategory, date: editDate, monthKey: editDate.substring(0, 7) }
                : exp
        )
        saveData({ ...data, expenses: updatedExpenses })
        setEditExpenseModal(false)
    }

    function handleSetIncome(e) {
        e.preventDefault()
        const amount = parseFloat(incomeInput)
        if (isNaN(amount)) return

        let newData = { ...data }
        if (applyGlobal) {
            newData.defaultIncome = amount
            newData.incomes = {}
        } else {
            newData.incomes = { ...newData.incomes, [key]: amount }
        }
        saveData(newData)
        setIncomeModal(false)
    }

    function openIncomeModal() {
        setIncomeInput(data.incomes[key] || data.defaultIncome || '')
        setApplyGlobal(!data.incomes[key])
        setIncomeModal(true)
    }

    function handleAddCard(e) {
        e.preventDefault()
        const newCard = {
            id: Date.now().toString(),
            name: cardName,
            bank: cardBank,
            closingDay: parseInt(cardClosing),
            dueDay: parseInt(cardDue)
        }
        saveData({ ...data, cards: [...(data.cards || []), newCard] })
        setCardModal(false)
        setCardName(''); setCardBank('nubank'); setCardClosing(''); setCardDue('')
    }

    function deleteCard(id) {
        if (!confirm('Tem certeza? Isso apagará o cartão.')) return
        saveData({ ...data, cards: data.cards.filter(c => c.id !== id) })
    }

    function openCardExpenseModal() {
        if (!data.cards || data.cards.length === 0) {
            alert('Adicione um cartão primeiro!')
            return
        }
        setCeCardId(data.cards[0].id)
        setCeDate(new Date().toISOString().split('T')[0])
        setCardExpenseModal(true)
    }

    function handleAddCardExpense(e) {
        e.preventDefault()
        const newCE = {
            id: Date.now().toString(),
            cardId: ceCardId,
            desc: ceDesc,
            amount: parseFloat(ceAmount),
            installments: parseInt(ceInstallments),
            date: ceDate
        }
        saveData({ ...data, cardExpenses: [...(data.cardExpenses || []), newCE] })
        setCardExpenseModal(false)
        setCeDesc(''); setCeAmount(''); setCeInstallments('1')
    }

    function deleteCardExpense(id) {
        if (!confirm('Apagar esta compra e todas as parcelas?')) return
        saveData({ ...data, cardExpenses: data.cardExpenses.filter(ce => ce.id !== id) })
    }

    return (
        <div className="app-shell">
            <Header
                currentDate={currentDate}
                onChangeMonth={changeMonth}
                income={income}
                totalExpense={totalExpense}
                balance={balance}
                onEditIncome={openIncomeModal}
            />

            <div className="tabs-bar glass-panel">
                <button className={`tab ${activeTab === 'cash' ? 'active' : ''}`} onClick={() => setActiveTab('cash')}>
                    <i className="fa-solid fa-money-bill-transfer" /> Conta Corrente
                </button>
                <button className={`tab ${activeTab === 'cards' ? 'active' : ''}`} onClick={() => setActiveTab('cards')}>
                    <i className="fa-solid fa-credit-card" /> Cartões
                </button>
            </div>

            <main className="main-area">
                {activeTab === 'cash' && (
                    <div className="tab-cash">
                        <ExpenseForm onAdd={addExpense} />
                        <ExpensesTable expenses={monthlyExpenses} totalOverall={totalExpense} onDelete={deleteExpense} onEdit={openEditExpense} />
                    </div>
                )}

                {activeTab === 'cards' && (
                    <div className="tab-cards">
                        <section className="glass-panel">
                            <div className="section-top">
                                <h3><i className="fa-solid fa-credit-card" /> Meus Cartões</h3>
                                <div className="section-actions">
                                    <button className="btn-primary btn-sm" onClick={() => setCardModal(true)}>
                                        <i className="fa-solid fa-plus" /> Cartão
                                    </button>
                                    <button className="btn-secondary btn-sm" onClick={openCardExpenseModal}>
                                        <i className="fa-solid fa-cart-shopping" /> Comprar
                                    </button>
                                </div>
                            </div>
                            <CardsGrid cards={data.cards || []} installments={cardInstallments} onDeleteCard={deleteCard} />
                        </section>
                        <CardInvoicesTable installments={cardInstallments} monthLabel={monthLabel} onDelete={deleteCardExpense} />
                    </div>
                )}
            </main>

            {/* Income Modal */}
            <Modal open={incomeModal} onClose={() => setIncomeModal(false)} title="Definir Renda" icon="fa-solid fa-money-bill-wave">
                <form onSubmit={handleSetIncome}>
                    <div className="field">
                        <label>Valor (R$)</label>
                        <input type="number" step="0.01" min="0" value={incomeInput} onChange={e => setIncomeInput(e.target.value)} required />
                    </div>
                    <label className="checkbox-row">
                        <input type="checkbox" checked={applyGlobal} onChange={e => setApplyGlobal(e.target.checked)} />
                        Definir para todos os meses
                    </label>
                    <div className="modal-btns">
                        <button type="button" className="btn-secondary" onClick={() => setIncomeModal(false)}>Cancelar</button>
                        <button type="submit" className="btn-primary">Salvar</button>
                    </div>
                </form>
            </Modal>

            {/* Card Modal */}
            <Modal open={cardModal} onClose={() => setCardModal(false)} title="Adicionar Cartão" icon="fa-solid fa-credit-card">
                <form onSubmit={handleAddCard}>
                    <div className="field">
                        <label>Nome do Cartão</label>
                        <input value={cardName} onChange={e => setCardName(e.target.value)} placeholder="Ex: Nubank Pessoal" required />
                    </div>
                    <div className="field">
                        <label>Banco</label>
                        <select value={cardBank} onChange={e => setCardBank(e.target.value)}>
                            <option value="nubank">Nubank</option>
                            <option value="itau">Itaú</option>
                            <option value="bradesco">Bradesco</option>
                            <option value="santander">Santander</option>
                            <option value="bb">Banco do Brasil</option>
                            <option value="inter">Banco Inter</option>
                            <option value="c6">C6 Bank</option>
                            <option value="outros">Outro</option>
                        </select>
                    </div>
                    <div className="field-row">
                        <div className="field">
                            <label>Dia Fechamento</label>
                            <input type="number" min="1" max="31" value={cardClosing} onChange={e => setCardClosing(e.target.value)} required />
                        </div>
                        <div className="field">
                            <label>Dia Vencimento</label>
                            <input type="number" min="1" max="31" value={cardDue} onChange={e => setCardDue(e.target.value)} required />
                        </div>
                    </div>
                    <div className="modal-btns">
                        <button type="button" className="btn-secondary" onClick={() => setCardModal(false)}>Cancelar</button>
                        <button type="submit" className="btn-primary">Salvar</button>
                    </div>
                </form>
            </Modal>

            {/* Card Expense Modal */}
            <Modal open={cardExpenseModal} onClose={() => setCardExpenseModal(false)} title="Comprar no Cartão" icon="fa-solid fa-cart-shopping">
                <form onSubmit={handleAddCardExpense}>
                    <div className="field">
                        <label>Cartão</label>
                        <select value={ceCardId} onChange={e => setCeCardId(e.target.value)}>
                            {(data.cards || []).map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="field">
                        <label>Descrição</label>
                        <input value={ceDesc} onChange={e => setCeDesc(e.target.value)} placeholder="Ex: Celular Novo" required />
                    </div>
                    <div className="field">
                        <label>Valor Total (R$)</label>
                        <input type="number" step="0.01" min="0" value={ceAmount} onChange={e => setCeAmount(e.target.value)} required />
                    </div>
                    <div className="field-row">
                        <div className="field">
                            <label>Nº Parcelas</label>
                            <input type="number" min="1" max="48" value={ceInstallments} onChange={e => setCeInstallments(e.target.value)} required />
                        </div>
                        <div className="field">
                            <label>Data Compra</label>
                            <input type="date" value={ceDate} onChange={e => setCeDate(e.target.value)} required />
                        </div>
                    </div>
                    <div className="modal-btns">
                        <button type="button" className="btn-secondary" onClick={() => setCardExpenseModal(false)}>Cancelar</button>
                        <button type="submit" className="btn-primary">Adicionar</button>
                    </div>
                </form>
            </Modal>

            {/* Edit Expense Modal */}
            <Modal open={editExpenseModal} onClose={() => setEditExpenseModal(false)} title="Editar Gasto" icon="fa-solid fa-pen-to-square">
                <form onSubmit={handleEditExpense}>
                    <div className="field">
                        <label>Descrição</label>
                        <input value={editDesc} onChange={e => setEditDesc(e.target.value)} required />
                    </div>
                    <div className="field">
                        <label>Valor (R$)</label>
                        <input type="number" step="0.01" min="0" value={editAmount} onChange={e => setEditAmount(e.target.value)} required />
                    </div>
                    <div className="field">
                        <label>Categoria</label>
                        <select value={editCategory} onChange={e => setEditCategory(e.target.value)}>
                            <option value="alimentacao">🍏 Alimentação</option>
                            <option value="transporte">🚗 Transporte</option>
                            <option value="moradia">🏠 Moradia</option>
                            <option value="lazer">🎉 Lazer</option>
                            <option value="saude">💊 Saúde</option>
                            <option value="educacao">📚 Educação</option>
                            <option value="outros">🛒 Outros</option>
                        </select>
                    </div>
                    <div className="field">
                        <label>Data</label>
                        <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} required />
                    </div>
                    <div className="modal-btns">
                        <button type="button" className="btn-secondary" onClick={() => setEditExpenseModal(false)}>Cancelar</button>
                        <button type="submit" className="btn-primary">Salvar</button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

// Business logic — same as original
function getInvoicesForMonth(cards, cardExpenses, currentDate) {
    const viewY = currentDate.getFullYear()
    const viewM = currentDate.getMonth() + 1
    let results = []

    cardExpenses.forEach(ce => {
        const card = cards.find(c => c.id === ce.cardId)
        if (!card) return

        const purchaseDate = new Date(ce.date + 'T00:00:00')
        const pY = purchaseDate.getFullYear()
        const pM = purchaseDate.getMonth() + 1
        const pD = purchaseDate.getDate()

        let firstInvoiceM = pM
        let firstInvoiceY = pY

        if (pD >= card.closingDay) {
            firstInvoiceM += 1
            if (firstInvoiceM > 12) { firstInvoiceM = 1; firstInvoiceY += 1 }
        }

        for (let i = 0; i < ce.installments; i++) {
            let instM = firstInvoiceM + i
            let instY = firstInvoiceY
            while (instM > 12) { instM -= 12; instY += 1 }

            if (instM === viewM && instY === viewY) {
                results.push({
                    expenseId: ce.id,
                    cardId: ce.cardId,
                    cardName: card.name,
                    desc: ce.desc,
                    date: ce.date,
                    amount: ce.amount / ce.installments,
                    currentInstallment: i + 1,
                    totalInstallments: ce.installments
                })
            }
        }
    })

    return results.sort((a, b) => new Date(b.date) - new Date(a.date))
}

export default function App() {
    return (
        <AuthProvider>
            <AppRouter />
        </AuthProvider>
    )
}

function AppRouter() {
    const { currentUser, loading } = useAuth()

    if (loading) {
        return <div className="loading-screen"><div className="spinner" /></div>
    }

    return currentUser ? <Dashboard /> : <Auth />
}
