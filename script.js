import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getFirestore, doc, onSnapshot, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// إعدادات مشروعك xo-public
const firebaseConfig = {
    apiKey: "AIzaSyCQe_MC24CjBwJzgwmQ8-gQValsEp-Gst4",
    authDomain: "xo-public.firebaseapp.com",
    projectId: "xo-public",
    storageBucket: "xo-public.firebasestorage.app",
    messagingSenderId: "664560761287",
    appId: "1:664560761287:web:63192cb6adceb8d79d01e2",
    measurementId: "G-KDDBNZ4MPV"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const gameRef = doc(db, "games", "live_session");

let board = Array(9).fill("");
let turn = "X";

// تحديث اللوحة تلقائياً عند أي تغيير (مزامنة فورية)
onSnapshot(gameRef, (snap) => {
    if (snap.exists()) {
        const data = snap.data();
        board = data.board;
        turn = data.turn;
        
        board.forEach((val, i) => {
            const cell = document.getElementById('c' + i);
            cell.innerText = val;
            cell.style.color = (val === 'X') ? '#00d4ff' : '#ffcc00';
        });
        document.getElementById('status').innerText = "دور اللاعب: " + turn;
    } else {
        // إذا كانت اللعبة جديدة، قم بتصفيرها
        resetGame();
    }
});

// دالة اللعب عند الضغط على المربعات
document.querySelectorAll('.cell').forEach((cell, i) => {
    cell.addEventListener('click', async () => {
        if (board[i] === "") {
            board[i] = turn;
            const nextTurn = (turn === "X") ? "O" : "X";
            await updateDoc(gameRef, { board: board, turn: nextTurn });
        }
    });
});

// دالة إعادة التصفير
async function resetGame() {
    await setDoc(gameRef, {
        board: Array(9).fill(""),
        turn: "X"
    });
}

document.getElementById('reset-btn').addEventListener('click', resetGame);

