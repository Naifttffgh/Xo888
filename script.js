import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, onSnapshot, collection, query, where, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSy...", // كودك هنا
  authDomain: "xo888.firebaseapp.com",
  projectId: "xo888",
  storageBucket: "xo888.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let myId = "";

async function start() {
    // جلب الـ ID من الكاش
    let savedId = localStorage.getItem('player_id');

    if (!savedId) {
        // إذا أول مرة يدخل
        savedId = 'User-' + Math.random().toString(36).substr(2, 4).toUpperCase();
        localStorage.setItem('player_id', savedId);
        
        let name = prompt("مرحباً! اختر اسمك المستعار:");
        if (!name) name = "لاعب " + savedId;

        await setDoc(doc(db, 'users', savedId), {
            id: savedId,
            username: name,
            status: 'online',
            wins: 0
        });
    } else {
        // تحديث الحالة لـ Online
        await updateDoc(doc(db, 'users', savedId), { status: 'online' });
    }

    myId = savedId;
    showLobby();
}

async function showLobby() {
    const snap = await getDoc(doc(db, 'users', myId));
    document.getElementById('my-name-display').innerText = snap.data().username;
    document.getElementById('my-id-display').innerText = myId;
    
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('game-lobby').style.display = 'block';

    // مراقبة اللاعبين الأونلاين فقط
    const q = query(collection(db, 'users'), where('status', '==', 'online'), limit(10));
    onSnapshot(q, (snapshot) => {
        const list = document.getElementById('players-list');
        list.innerHTML = "";
        
        snapshot.forEach(docSnap => {
            const player = docSnap.data();
            if (player.id === myId) return; // لا تظهر نفسك

            const li = document.createElement('li');
            li.innerHTML = `
                <div style="text-align:right">
                    <b>${player.username}</b><br>
                    <small>🏆 ${player.wins} فوز</small>
                </div>
                <button onclick="challenge('${player.id}')">تحدي ⚔️</button>
            `;
            list.appendChild(li);
        });
    });
}

window.challenge = (targetId) => {
    alert("تم إرسال طلب تحدي إلى " + targetId + "\n(انتظر تفعيل كود المباراة في التحديث القادم!)");
};

// تشغيل
start();
