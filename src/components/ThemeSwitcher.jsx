import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../hooks/useTheme'

export default function ThemeSwitcher() {
    const { theme, setTheme, themes } = useTheme()
    const [open, setOpen] = useState(false)
    const ref = useRef()

    useEffect(() => {
        function handleClick(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener('click', handleClick)
        return () => document.removeEventListener('click', handleClick)
    }, [])

    return (
        <div className="theme-switcher" ref={ref}>
            <button
                className="theme-btn"
                onClick={() => setOpen(!open)}
                title="Mudar Tema"
            >
                <i className="fa-solid fa-palette" />
                <span>Tema</span>
            </button>

            <div className={`theme-dropdown ${open ? 'open' : ''}`}>
                {Object.entries(themes).map(([key, t]) => (
                    <button
                        key={key}
                        className={`theme-opt ${theme === key ? 'active' : ''}`}
                        onClick={() => { setTheme(key); setOpen(false) }}
                    >
                        <div className="theme-colors">
                            {t.colors.map((c, i) => (
                                <span key={i} style={{ background: c }} />
                            ))}
                        </div>
                        <span>{t.label}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}
