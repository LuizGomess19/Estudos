import { useState } from 'react'

export default function ExpenseForm({ onAdd }) {
    const [desc, setDesc] = useState('')
    const [amount, setAmount] = useState('')
    const [category, setCategory] = useState('alimentacao')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])

    function handleSubmit(e) {
        e.preventDefault()
        onAdd({
            id: Date.now().toString(),
            desc,
            amount: parseFloat(amount),
            category,
            date,
            monthKey: date.substring(0, 7)
        })
        setDesc('')
        setAmount('')
        setDate(new Date().toISOString().split('T')[0])
    }

    return (
        <section className="glass-panel form-section">
            <h3><i className="fa-solid fa-plus-circle" /> Gasto à Vista</h3>
            <form onSubmit={handleSubmit}>
                <div className="field">
                    <label>Descrição</label>
                    <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ex: Conta de Luz" required />
                </div>
                <div className="field">
                    <label>Valor (R$)</label>
                    <input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" required />
                </div>
                <div className="field">
                    <label>Categoria</label>
                    <select value={category} onChange={e => setCategory(e.target.value)}>
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
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                </div>
                <button type="submit" className="btn-primary">Adicionar</button>
            </form>
        </section>
    )
}
