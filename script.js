import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, onSnapshot, collection, query, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- بيانات Firebase (استبدلها ببياناتك) ---
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "xo888.firebaseapp.com",
  projectId: "xo888",
  storageBucket: "xo888.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let myPlayerId = "";

// دالة لتوليد معرف عشوائي فريد
function generateShortId() {
    return 'ID-' + Math.random().toString(36).substr(2, 5).toUpperCase();
}

// الدالة الأساسية لبدء الموقع
async function startApp() {
    // 1. محاولة جلب الـ ID من الكاش (LocalStorage)
    let savedId = localStorage.getItem('player_unique_id');

    if (!savedId) {
        // إذا كان لاعباً جديداً (أول مرة يفتح الموقع)
        savedId = generateShortId();
        localStorage.setItem('player_unique_id', savedId);

        let userName = prompt("أهلاً بك! اختر اسماً يظهر للآخرين:");
        if (!userName) userName = "لاعب مجهول";

        await setDoc(doc(db, 'users', savedId), {
            id: savedId,
            username: userName,
            wins: 0,
            status: 'online'
        });
    } else {
        // إذا كان لاعباً قديماً، نحدث حالته فقط ليكون Online
        const userRef = doc(db, 'users', savedId);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
            await updateDoc(userRef, { status: 'online' });
        } else {
            // في حال تم مسح البيانات من Firebase، نصفر الكاش ونبدأ من جديد
            localStorage.clear();
            return startApp();
        }
    }

    myPlayerId = savedId;
    loadLobby();
}

// عرض شاشة الانتظار وقائمة اللاعبين
async function loadLobby() {
    const userSnap = await getDoc(doc(db, 'users', myPlayerId));
    const userData = userSnap.data();

    document.getElementById('my-name-display').innerText = userData.username;
    document.getElementById('my-id-display').innerText = myPlayerId;
    
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('game-lobby').style.display = 'block';

    listenToPlayers();
}

// مراقبة اللاعبين الآخرين وتحديث القائمة فوراً
function listenToPlayers() {
    const q = query(collection(db, 'users'), limit(15));
    onSnapshot(q, (snapshot) => {
        const list = document.getElementById('players-list');
        list.innerHTML = "";
        
        snapshot.forEach(docSnap => {
            const player = docSnap.data();
            if (player.id === myPlayerId) return; // لا تظهر اسمك في قائمة التحدي
            
            const li = document.createElement('li');
            li.innerHTML = `
                <div>
                    <b>${player.username}</b><br>
                    <small style="color:gray">${player.id}</small>
                </div>
                <button onclick="challenge('${player.id}')">تحدي</button>
            `;
            list.appendChild(li);
        });
    });
}

// ربط الدالة بـ window لتكون قابلة للاستدعاء من HTML
window.challenge = (id) => {
    alert("جاري إرسال طلب تحدي إلى: " + id);
    // هنا نضع كود بدء المباراة الفعلي مستقبلاً
};

// تشغيل التطبيق فور التحميل
startApp();
