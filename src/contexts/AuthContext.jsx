import { createContext, useContext, useState, useEffect } from 'react'
import { auth, database } from '../firebase'

const AuthContext = createContext()

export function useAuth() {
    return useContext(AuthContext)
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState({
        expenses: [],
        cards: [],
        cardExpenses: [],
        incomes: {},
        defaultIncome: 0,
        theme: 'cyberpunk'
    })

    useEffect(() => {
        let dbRef = null

        // Timeout de segurança: se o Firebase demorar mais de 10s, para de carregar
        const safetyTimeout = setTimeout(() => {
            setLoading(false)
        }, 10000)

        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setCurrentUser(user)
                dbRef = database.ref('/users/' + user.uid)

                dbRef.on('value', (snapshot) => {
                    const d = snapshot.val()
                    if (d) {
                        setData({
                            expenses: d.expenses || [],
                            cards: d.cards || [],
                            cardExpenses: d.cardExpenses || [],
                            incomes: d.incomes || {},
                            defaultIncome: parseFloat(d.defaultIncome) || 0,
                            theme: d.theme || 'cyberpunk'
                        })
                    }
                    clearTimeout(safetyTimeout)
                    setLoading(false)
                }, (error) => {
                    // Se o Database falhar, ainda assim para de carregar
                    console.error('Erro ao conectar ao Firebase Database:', error)
                    clearTimeout(safetyTimeout)
                    setLoading(false)
                })
            } else {
                setCurrentUser(null)
                setData({
                    expenses: [],
                    cards: [],
                    cardExpenses: [],
                    incomes: {},
                    defaultIncome: 0,
                    theme: 'cyberpunk'
                })
                if (dbRef) dbRef.off()
                clearTimeout(safetyTimeout)
                setLoading(false)
            }
        })

        return () => {
            clearTimeout(safetyTimeout)
            unsubscribe()
            if (dbRef) dbRef.off()
        }
    }, [])

    function saveData(newData) {
        const merged = { ...data, ...newData }
        setData(merged)
        if (currentUser) {
            database.ref('/users/' + currentUser.uid).set(merged)
        }
    }

    function login(email, password) {
        return auth.signInWithEmailAndPassword(email, password)
    }

    function register(email, password) {
        return auth.createUserWithEmailAndPassword(email, password)
    }

    function logout() {
        return auth.signOut()
    }

    const value = {
        currentUser,
        data,
        saveData,
        login,
        register,
        logout,
        loading
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
