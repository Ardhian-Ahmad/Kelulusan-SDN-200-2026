// === LOGIKA COUNTDOWN WAKTU PENGUMUMAN ===
// Set tanggal dan waktu pengumuman: 2 Juni 2026, 08:00:00
const targetDate = new Date("March 2, 2026 08:00:00").getTime();

const countdownTimer = setInterval(function() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    const countdownSection = document.getElementById("countdown-section");
    const loginSection = document.getElementById("login-section");

    if (distance <= 0) {
        // Waktu pengumuman tiba! Hentikan hitung mundur.
        clearInterval(countdownTimer);
        
        // Sembunyikan countdown, tampilkan form login
        if (countdownSection) countdownSection.style.display = "none";
        if (loginSection) {
            loginSection.classList.remove("hidden");
            loginSection.classList.add("flex");
        }
    } else {
        // Kalkulasi sisa hari, jam, menit, detik
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Render ke HTML dengan tambahan '0' di depan jika angka < 10 (contoh: 09 Detik)
        document.getElementById("cd-days").innerText = days.toString().padStart(2, '0');
        document.getElementById("cd-hours").innerText = hours.toString().padStart(2, '0');
        document.getElementById("cd-minutes").innerText = minutes.toString().padStart(2, '0');
        document.getElementById("cd-seconds").innerText = seconds.toString().padStart(2, '0');
    }
}, 1000); // Diperbarui setiap 1 detik


// Link disandikan dengan Base64 agar tidak mudah dicari lewat CTRL+F
const kodeRahasia = "aHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vc3ByZWFkc2hlZXRzL2QvZS8yUEFDWC0xdlI3MnQ1dzFTY3RwbG1fb0ZZYm9FdEtISnFPLWlacWdIakdEdnQ2RjFlQlRNSGRmcW1mWUhOVHFoZWxiS2x4WDZmRElQMVpMbzVZUlJXXy9wdWI/b3V0cHV0PWNzdg==";
const SHEET_CSV_URL = atob(kodeRahasia); // atob() otomatis menerjemahkan sandi kembali menjadi link

let dataSiswa = {};

window.addEventListener('DOMContentLoaded', () => {
    Papa.parse(SHEET_CSV_URL, {
        download: true,
        header: true,
        skipEmptyLines: true,
        transformHeader: function(h) {
            return h.trim().toUpperCase(); 
        },
        complete: function(results) {
            results.data.forEach(row => {
                if(row.NISN && row.NISN.trim() !== "") {
                    dataSiswa[row.NISN.trim()] = {
                        NAMA: row.NAMA || "Nama Kosong",
                        STATUS: row.STATUS || "LULUS",
                        LINK_SKL: row.LINK_SKL || "#"
                    };
                }
            });
            siapkanTombolLogin();
        },
        error: function(error) {
            console.error("Gagal mengambil data Sheet:", error);
            document.getElementById("btn-login").innerText = "Gagal Memuat Data (Cek Koneksi)";
        }
    });
});

function siapkanTombolLogin() {
    const btn = document.getElementById("btn-login");
    btn.innerText = "Buka Amplop";
    btn.removeAttribute("disabled");
}

function cekKelulusan() {
    const nisn = document.getElementById("nisn-input").value.trim();
    const errorMsg = document.getElementById("error-msg");
    const data = dataSiswa[nisn];
    
    if (data) {
        errorMsg.classList.add("hidden");
        
        document.getElementById("nama-siswa-lulus").innerText = data.NAMA;
        document.getElementById("status-lulus").innerText = data.STATUS;
        
        const btnDownload = document.getElementById("btn-download");
        if (data.LINK_SKL !== "#" && data.LINK_SKL !== "") {
            btnDownload.href = data.LINK_SKL;
        } else {
            btnDownload.style.display = 'none'; 
        }
        btnDownload.classList.add("hidden"); 

        // Transisi dari form login ke kartu gosok
        document.getElementById("login-section").style.display = "none";
        const scratchSection = document.getElementById("scratch-section");
        scratchSection.classList.remove("hidden");
        scratchSection.classList.add("flex");
        
        setTimeout(initCanvas, 50); 
    } else {
        errorMsg.classList.remove("hidden");
    }
}

// === LOGIKA SCRATCH CARD (KARTU GOSOK) ===
const canvas = document.getElementById('scratch-canvas');
const ctx = canvas.getContext('2d');
let isScratching = false;
let revealed = false;

function initCanvas() {
    canvas.width = 320;
    canvas.height = 260;

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#a1a1aa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#d4d4d8';
    for (let i = 0; i < canvas.width; i += 4) {
        for (let j = 0; j < canvas.height; j += 4) {
            if (Math.random() > 0.5) ctx.fillRect(i, j, 4, 4);
        }
    }
    
    ctx.font = 'bold 22px DM Sans';
    ctx.fillStyle = '#3f3f46';
    ctx.textAlign = 'center';
    ctx.fillText('🎓 GOSOK DI SINI 🎓', canvas.width / 2, canvas.height / 2);

    ctx.globalCompositeOperation = 'destination-out';
}

function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return { 
        x: (clientX - rect.left) * scaleX, 
        y: (clientY - rect.top) * scaleY 
    };
}

function scratch(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.fill();
    checkReveal();
}

function checkReveal() {
    if (revealed) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let clearPixels = 0;
    
    for (let i = 3; i < imageData.length; i += 16) { 
        if (imageData[i] === 0) clearPixels++; 
    }
    
    const totalPixels = imageData.length / 16;
    if ((clearPixels / totalPixels) > 0.45) { 
        revealed = true;
        
        canvas.style.transition = 'opacity 0.6s ease-out';
        canvas.style.opacity = '0';
        
        // Memunculkan tombol download bersamaan dengan matinya canvas
        document.getElementById("btn-download").classList.remove("hidden");
        
        setTimeout(() => {
            canvas.style.pointerEvents = 'none'; 
            confetti({
                particleCount: 150,
                spread: 80,
                origin: { y: 0.6 },
                colors: ['#fbbf24', '#ef4444', '#3b82f6', '#10b981', '#ec4899']
            });
        }, 200);
    }
}

canvas.addEventListener('mousedown', () => isScratching = true);
window.addEventListener('mouseup', () => isScratching = false);
canvas.addEventListener('mousemove', (e) => { 
    if (isScratching) scratch(getPos(e).x, getPos(e).y); 
});

canvas.addEventListener('touchstart', (e) => { 
    isScratching = true; 
    e.preventDefault(); 
});
window.addEventListener('touchend', () => isScratching = false);
canvas.addEventListener('touchmove', (e) => { 
    if (isScratching) {
        e.preventDefault(); 
        scratch(getPos(e).x, getPos(e).y); 
    }
});

// === SISTEM KEAMANAN FRONT-END ===
// 1. Blokir Klik Kanan
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

// 2. Blokir Kombinasi Tombol Tertentu (CTRL+U, F12, CTRL+SHIFT+I/J/C)
document.addEventListener('keydown', function(e) {
    // Blokir F12
    if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
    }
    // Blokir CTRL + U (View Source)
    if (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.keyCode === 85)) {
        e.preventDefault();
    }
    // Blokir CTRL + SHIFT + I / J / C (Developer Tools)
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
    }
    // Blokir CTRL + S (Save Page)
    if (e.ctrlKey && (e.key === 's' || e.key === 'S' || e.keyCode === 83)) {
        e.preventDefault();
    }
});
