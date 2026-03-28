import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, onSnapshot, collection, query, orderBy, limit, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSy...", // استبدلها بمفتاحك
  authDomain: "xo888.firebaseapp.com",
  projectId: "xo888",
  storageBucket: "xo888.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let myName = "";
let currentGameId = null;

// --- نظام الدخول والحماية ---
window.login = async () => {
    const input = document.getElementById('username-input').value.trim();
    if (!input) return alert("اكتب اسمك أولاً!");

    const userRef = doc(db, 'users', input);
    const snap = await getDoc(userRef);

    if (snap.exists() && snap.data().status === 'banned') {
        alert("Nice try, Scammer! 🚫 حسابك محظور.");
        return;
    }

    if (!snap.exists()) {
        await setDoc(userRef, { username: input, wins: 0, status: 'online' });
    } else {
        await updateDoc(userRef, { status: 'online' });
    }

    myName = input;
    document.getElementById('my-name-display').innerText = myName;
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('game-lobby').style.display = 'block';
    listenToPlayers();
};

// --- مراقبة اللاعبين وقائمة المتصدرين ---
function listenToPlayers() {
    const q = query(collection(db, 'users'), orderBy('wins', 'desc'), limit(10));
    onSnapshot(q, (snapshot) => {
        const list = document.getElementById('players-list');
        list.innerHTML = "";
        snapshot.forEach(doc => {
            const user = doc.data();
            if (user.status === 'banned') return;
            
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${user.username} (🏆 ${user.wins})</span>
                ${user.username !== myName ? `<button onclick="challenge('${user.username}')">تحدي</button>` : ''}
            `;
            list.appendChild(li);
        });
    });
}

// --- نظام الباند التلقائي عند الفوز الزائد ---
async function handleWin(winnerName) {
    const userRef = doc(db, 'users', winnerName);
    const snap = await getDoc(userRef);
    const currentWins = snap.data().wins || 0;

    if (currentWins >= 999) {
        await updateDoc(userRef, { status: 'banned', wins: 1000 });
        alert("تم حظرك لتجاوز الحد المسموح للفوز! 💀");
        location.reload();
    } else {
        await updateDoc(userRef, { wins: increment(1) });
    }
}

// أضف دوال التحدي (challenge) واللعب هنا بنفس المنطق السابق...
