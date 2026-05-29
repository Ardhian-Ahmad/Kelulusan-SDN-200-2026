// --- LOGIKA DATA & LOGIN ---
const dataSiswa = {
    "123456": { nama: "Budi Santoso", status: "LULUS" },
    "654321": { nama: "Siti Aminah", status: "LULUS" }
};

function cekKelulusan() {
    const nisn = document.getElementById("nisn-input").value;
    const errorMsg = document.getElementById("error-msg");
    
    if (dataSiswa[nisn]) {
        errorMsg.classList.add("hidden");
        // Sembunyikan login, tampilkan area gosok
        document.getElementById("login-section").style.display = "none";
        const scratchSection = document.getElementById("scratch-section");
        scratchSection.classList.remove("hidden");
        scratchSection.classList.add("flex");
        
        // Isi nama siswa
        document.getElementById("nama-siswa-lulus").innerText = dataSiswa[nisn].nama;
        
        // Mulai inisiasi canvas
        initCanvas();
    } else {
        errorMsg.classList.remove("hidden");
    }
}

// --- LOGIKA SCRATCH CARD ---
const canvas = document.getElementById('scratch-canvas');
const ctx = canvas.getContext('2d');
let isScratching = false;
let revealed = false;

function initCanvas() {
    ctx.fillStyle = '#a1a1aa';
    ctx.fillRect(0, 0, 320, 200);
    ctx.fillStyle = '#d4d4d8';
    for (let i = 0; i < 320; i += 4) {
        for (let j = 0; j < 200; j += 4) {
            if (Math.random() > 0.5) ctx.fillRect(i, j, 4, 4);
        }
    }
    ctx.font = 'bold 20px DM Sans';
    ctx.fillStyle = '#52525b';
    ctx.textAlign = 'center';
    ctx.fillText('🎓 GOSOK DI SINI 🎓', 160, 105);

    ctx.globalCompositeOperation = 'destination-out';
}

function scratch(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();
}

function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - rect.left, y: t.clientY - rect.top };
}

function checkReveal() {
    if (revealed) return;
    const data = ctx.getImageData(0, 0, 320, 200).data;
    let clear = 0;
    for (let i = 3; i < data.length; i += 16) { if (data[i] === 0) clear++; }
    if (clear / (data.length / 16) > 0.45) {
        revealed = true;
        canvas.style.transition = 'opacity 0.5s';
        canvas.style.opacity = '0';
        launchConfetti();
    }
}

// Event Listeners
canvas.addEventListener('mousedown', () => isScratching = true);
canvas.addEventListener('mouseup', () => { isScratching = false; checkReveal(); });
canvas.addEventListener('mousemove', (e) => { if (isScratching) scratch(getPos(e).x, getPos(e).y); });
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); isScratching = true; });
canvas.addEventListener('touchend', () => { isScratching = false; checkReveal(); });
canvas.addEventListener('touchmove', (e) => { e.preventDefault(); if (isScratching) scratch(getPos(e).x, getPos(e).y); });

// --- LOGIKA CONFETTI ---
function launchConfetti() {
    const container = document.getElementById('confetti');
    container.classList.add('active');
    const colors = ['#fbbf24','#ef4444','#3b82f6','#10b981','#8b5cf6','#ec4899'];
    for (let i = 0; i < 80; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = Math.random() * 1.5 + 's';
        piece.style.transform = `rotate(${Math.random()*360}deg)`;
        container.appendChild(piece);
    }
    setTimeout(() => container.classList.remove('active'), 4000);
}
