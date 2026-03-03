import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Auth() {
    const { login, register } = useAuth()
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            if (isLogin) {
                await login(email, password)
            } else {
                await register(email, password)
            }
        } catch (err) {
            setError(isLogin
                ? 'Erro ao entrar. E-mail ou senha incorretos.'
                : 'Erro ao cadastrar: ' + err.message
            )
        }
        setLoading(false)
    }

    return (
        <div className="auth-screen">
            <div className="auth-particles">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className={`auth-orb orb-${i + 1}`} />
                ))}
            </div>

            <div className="auth-card">
                <div className="auth-logo">
                    <i className="fa-solid fa-wallet" />
                    <h1>LGestão</h1>
                </div>
                <p className="auth-subtitle">
                    {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="field">
                        <label>E-mail</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            placeholder="seu@email.com"
                        />
                    </div>
                    <div className="field">
                        <label>Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            minLength={6}
                            placeholder="••••••"
                        />
                    </div>

                    {error && <div className="auth-error">{error}</div>}

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? <i className="fa-solid fa-spinner fa-spin" /> : null}
                        {isLogin ? 'Entrar' : 'Cadastrar'}
                    </button>
                </form>

                <div className="auth-toggle" onClick={() => { setIsLogin(!isLogin); setError('') }}>
                    {isLogin ? 'Não tem conta? ' : 'Já tem conta? '}
                    <span>{isLogin ? 'Cadastre-se' : 'Faça login'}</span>
                </div>
            </div>
        </div>
    )
}
