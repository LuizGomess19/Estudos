import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'

const THEMES = {
    cyberpunk: { label: '⚡ Cyberpunk', layout: 'sidebar', colors: ['#050505', '#00f0ff', '#bc13fe'] },
    light: { label: '☀️ Clássico Claro', layout: 'sidebar', colors: ['#f0f2f5', '#3b82f6', '#8b5cf6'] },
    midnight: { label: '🌙 Midnight Blue', layout: 'sidebar', colors: ['#0a0e27', '#daa520', '#5b7fff'] },
    nature: { label: '🌿 Natureza', layout: 'sidebar', colors: ['#0d1f0d', '#4caf50', '#a1887f'] },
    dracula: { label: '🧛 Dracula', layout: 'sidebar', colors: ['#282a36', '#bd93f9', '#ff79c6'] },
    rosegold: { label: '🌸 Rose Gold', layout: 'sidebar', colors: ['#1a1015', '#e8a0bf', '#c97b9a'] },
    ocean: { label: '🌊 Oceano', layout: 'sidebar', colors: ['#0a1628', '#0ea5e9', '#06b6d4'] },
    sunset: { label: '🌅 Pôr do Sol', layout: 'sidebar', colors: ['#1a0a0a', '#f97316', '#ef4444'] }
}

export function useTheme() {
    const { data, saveData } = useAuth()
    const [theme, setThemeState] = useState(() => {
        return localStorage.getItem('selectedTheme') || 'cyberpunk'
    })

    // Sync from Firebase data
    useEffect(() => {
        if (data.theme && data.theme !== theme) {
            setThemeState(data.theme)
        }
    }, [data.theme])

    // Apply to DOM
    useEffect(() => {
        const html = document.documentElement
        if (theme === 'cyberpunk') {
            html.removeAttribute('data-theme')
        } else {
            html.setAttribute('data-theme', theme)
        }
        html.setAttribute('data-layout', THEMES[theme]?.layout || 'sidebar')
        localStorage.setItem('selectedTheme', theme)
    }, [theme])

    const setTheme = useCallback((newTheme) => {
        if (!THEMES[newTheme]) return
        setThemeState(newTheme)
        localStorage.setItem('selectedTheme', newTheme)
        saveData({ ...data, theme: newTheme })
    }, [data, saveData])

    return { theme, setTheme, themes: THEMES }
}
