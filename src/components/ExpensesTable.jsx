function fmt(v) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

export default function ExpensesTable({ expenses, totalOverall, onDelete }) {
    if (expenses.length === 0) {
        return (
            <section className="glass-panel table-section">
                <h3><i className="fa-solid fa-list" /> Gastos (Conta Corrente)</h3>
                <div className="empty-state">
                    <i className="fa-solid fa-receipt" />
                    <p>Nenhum gasto à vista registrado neste mês.</p>
                </div>
            </section>
        )
    }

    return (
        <section className="glass-panel table-section">
            <h3><i className="fa-solid fa-list" /> Gastos (Conta Corrente)</h3>
            <div className="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Dia</th>
                            <th>Descrição</th>
                            <th>Categoria</th>
                            <th>Valor</th>
                            <th>%</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenses.map(exp => {
                            const pct = totalOverall > 0 ? ((exp.amount / totalOverall) * 100).toFixed(1) + '%' : '0%'
                            const day = exp.date.substring(8, 10) + '/' + exp.date.substring(5, 7)
                            return (
                                <tr key={exp.id}>
                                    <td>{day}</td>
                                    <td><strong>{exp.desc}</strong></td>
                                    <td><span className={`badge badge-${exp.category}`}>{exp.category}</span></td>
                                    <td>{fmt(exp.amount)}</td>
                                    <td>{pct}</td>
                                    <td>
                                        <button className="btn-delete" onClick={() => onDelete(exp.id)}>
                                            <i className="fa-solid fa-trash" />
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    )
}
