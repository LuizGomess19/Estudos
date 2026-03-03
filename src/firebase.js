import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import 'firebase/compat/database'

const firebaseConfig = {
    apiKey: "AIzaSyDXKYLdSr6vZvQurmzB5lSx22TwgDX_GLg",
    authDomain: "lgfinanceiro.firebaseapp.com",
    projectId: "lgfinanceiro",
    databaseURL: "https://lgfinanceiro-default-rtdb.firebaseio.com",
    storageBucket: "lgfinanceiro.firebasestorage.app",
    messagingSenderId: "703508618933",
    appId: "1:703508618933:web:519136ef9ab8d6698328fc"
}

firebase.initializeApp(firebaseConfig)

export const auth = firebase.auth()
export const database = firebase.database()
export default firebase
