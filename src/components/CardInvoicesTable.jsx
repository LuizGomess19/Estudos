function fmt(v) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

export default function CardInvoicesTable({ installments, monthLabel, onDelete }) {
    if (installments.length === 0) {
        return (
            <section className="glass-panel table-section">
                <h3><i className="fa-solid fa-file-invoice-dollar" /> Faturas — {monthLabel}</h3>
                <div className="empty-state">
                    <i className="fa-solid fa-receipt" />
                    <p>Nenhuma parcela a pagar neste mês.</p>
                </div>
            </section>
        )
    }

    return (
        <section className="glass-panel table-section">
            <h3><i className="fa-solid fa-file-invoice-dollar" /> Faturas — {monthLabel}</h3>
            <div className="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Cartão</th>
                            <th>Data Compra</th>
                            <th>Descrição</th>
                            <th>Parcela</th>
                            <th>Valor</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {installments.map((inst, i) => {
                            const day = inst.date.substring(8, 10) + '/' + inst.date.substring(5, 7)
                            const parcel = inst.totalInstallments > 1
                                ? `${inst.currentInstallment}/${inst.totalInstallments}`
                                : 'À vista'
                            return (
                                <tr key={inst.expenseId + '-' + i}>
                                    <td><strong>{inst.cardName}</strong></td>
                                    <td>{day}</td>
                                    <td>{inst.desc}</td>
                                    <td>{parcel}</td>
                                    <td>{fmt(inst.amount)}</td>
                                    <td>
                                        <button className="btn-delete" onClick={() => onDelete(inst.expenseId)}>
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
