import { useAuth } from '../contexts/AuthContext'
import ThemeSwitcher from './ThemeSwitcher'

export default function Header({ currentDate, onChangeMonth, income, totalExpense, balance, onEditIncome }) {
    const { logout } = useAuth()

    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    const label = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`

    function fmt(v) {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
    }

    return (
        <header className="glass-panel header">
            <div className="header-top">
                <div className="logo">
                    <i className="fa-solid fa-wallet" />
                    <h1 className="brand-logo">LGestão</h1>
                </div>
                <div className="header-actions">
                    <ThemeSwitcher />
                    <button className="btn-icon" onClick={logout} title="Sair">
                        <i className="fa-solid fa-right-from-bracket" />
                    </button>
                </div>
            </div>

            <div className="month-bar">
                <button className="nav-btn" onClick={() => onChangeMonth(-1)}>
                    <i className="fa-solid fa-chevron-left" />
                </button>
                <h2>{label}</h2>
                <button className="nav-btn" onClick={() => onChangeMonth(1)}>
                    <i className="fa-solid fa-chevron-right" />
                </button>
            </div>

            <div className="stats">
                <div className="stat-card stat-income" onClick={onEditIncome}>
                    <div className="stat-icon"><i className="fa-solid fa-arrow-up-right-dots" /></div>
                    <div className="stat-info">
                        <span className="stat-label">Salário / Renda</span>
                        <span className="stat-value">{fmt(income)}</span>
                    </div>
                    <button className="stat-edit"><i className="fa-solid fa-pen" /></button>
                </div>
                <div className="stat-card stat-expense">
                    <div className="stat-icon"><i className="fa-solid fa-arrow-trend-down" /></div>
                    <div className="stat-info">
                        <span className="stat-label">Total Gasto</span>
                        <span className="stat-value">{fmt(totalExpense)}</span>
                    </div>
                </div>
                <div className="stat-card stat-balance">
                    <div className="stat-icon"><i className="fa-solid fa-scale-balanced" /></div>
                    <div className="stat-info">
                        <span className="stat-label">Saldo Restante</span>
                        <span className="stat-value" style={{ color: balance < 0 ? 'var(--danger)' : undefined }}>
                            {fmt(balance)}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    )
}
