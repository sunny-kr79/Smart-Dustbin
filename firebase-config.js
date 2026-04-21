// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyA25Fl6o28NzfcPpLGxQqAY8Nq6d646QCg",
    authDomain: "smart-dustbin-9a7a6.firebaseapp.com",
    databaseURL: "https://smart-dustbin-9a7a6-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "smart-dustbin-9a7a6",
    storageBucket: "smart-dustbin-9a7a6.firebasestorage.app",
    messagingSenderId: "309170484863",
    appId: "1:309170484863:web:074e82d9fdc40d5a3ef14a"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);