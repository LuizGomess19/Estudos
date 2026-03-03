const bankLogos = {
    'nubank': 'https://logo.clearbit.com/nubank.com.br',
    'itau': 'https://logo.clearbit.com/itau.com.br',
    'bradesco': 'https://logo.clearbit.com/bradesco.com.br',
    'santander': 'https://logo.clearbit.com/santander.com.br',
    'bb': 'https://logo.clearbit.com/bb.com.br',
    'inter': 'https://logo.clearbit.com/bancointer.com.br',
    'c6': 'https://logo.clearbit.com/c6bank.com.br',
    'outros': 'https://logo.clearbit.com/visa.com'
}

function fmt(v) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

export default function CardsGrid({ cards, installments, onDeleteCard }) {
    if (cards.length === 0) {
        return (
            <div className="empty-state" style={{ marginTop: '1rem' }}>
                <i className="fa-solid fa-credit-card" />
                <p>Nenhum cartão cadastrado.</p>
            </div>
        )
    }

    return (
        <div className="cards-grid">
            {cards.map(card => {
                const invoiceTotal = installments
                    .filter(inst => inst.cardId === card.id)
                    .reduce((s, inst) => s + inst.amount, 0)

                const logo = bankLogos[card.bank] || bankLogos['outros']

                return (
                    <div key={card.id} className={`credit-card bank-${card.bank}`}>
                        <div className="cc-top">
                            <div className="cc-name">{card.name}</div>
                            <div className="cc-bank-logo">
                                <img src={logo} alt={card.bank} onError={e => { e.target.src = bankLogos['outros'] }} />
                            </div>
                        </div>
                        <div className="cc-middle">
                            <div>Fech: {card.closingDay}</div>
                            <div>Venc: {card.dueDay}</div>
                        </div>
                        <div className="cc-bottom">
                            <div className="cc-invoice">{fmt(invoiceTotal)}</div>
                            <button className="cc-delete" onClick={() => onDeleteCard(card.id)} title="Apagar Cartão">
                                <i className="fa-solid fa-trash" />
                            </button>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
