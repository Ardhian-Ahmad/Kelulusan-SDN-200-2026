// === MASUKKAN LINK CSV PUBLISH TO WEB GOOGLE SHEET DI SINI ===
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR72t5w1Sctplm_oFYboEtKHJqO-iZqgHjGDvt6F1eBTMHdfqmfYHNTqhelbKlxX6fDIP1ZLo5YRRW_/pub?output=csv";

let dataSiswa = {};

// 1. Ambil data dari Google Sheet saat web dibuka
window.addEventListener('DOMContentLoaded', () => {
    // Jika URL belum diisi, kita pakai data dummy untuk tes lokal
    if (SHEET_CSV_URL === "URL_CSV_DARI_GOOGLE_SHEET_ANDA_DISINI") {
        dataSiswa = {
            "123456": { NAMA: "Budi Santoso", STATUS: "LULUS", LINK_SKL: "https://drive.google.com/" },
            "654321": { NAMA: "Siti Aminah", STATUS: "LULUS", LINK_SKL: "https://drive.google.com/" }
        };
        siapkanTombolLogin();
        return;
    }

    Papa.parse(SHEET_CSV_URL, {
        download: true,
        header: true,
        complete: function(results) {
            results.data.forEach(row => {
                if(row.NISN && row.NISN.trim() !== "") {
                    dataSiswa[row.NISN.trim()] = {
                        NAMA: row.NAMA,
                        STATUS: row.STATUS,
                        LINK_SKL: row.LINK_SKL
                    };
                }
            });
            siapkanTombolLogin();
        },
        error: function(error) {
            console.error("Gagal mengambil data Sheet:", error);
            document.getElementById("btn-login").innerText = "Gagal Memuat Data";
        }
    });
});

function siapkanTombolLogin() {
    const btn = document.getElementById("btn-login");
    btn.innerText = "Buka Amplop";
    btn.removeAttribute("disabled");
}

// 2. Logika Cek NISN
function cekKelulusan() {
    const nisn = document.getElementById("nisn-input").value.trim();
    const errorMsg = document.getElementById("error-msg");
    const data = dataSiswa[nisn];
    
    if (data) {
        errorMsg.classList.add("hidden");
        
        // Isi data ke kartu
        document.getElementById("nama-siswa-lulus").innerText = data.NAMA;
        document.getElementById("status-lulus").innerText = data.STATUS;
        
        const btnDownload = document.getElementById("btn-download");
        btnDownload.href = data.LINK_SKL;
        // Sembunyikan tombol download hingga selesai digosok
        btnDownload.classList.add("hidden"); 

        // Ganti Tampilan
        document.getElementById("login-section").style.display = "none";
        const scratchSection = document.getElementById("scratch-section");
        scratchSection.classList.remove("hidden");
        scratchSection.classList.add("flex");
        
        // Render Canvas SETELAH elemen ditampilkan agar ukurannya akurat
        setTimeout(initCanvas, 50); 
    } else {
        errorMsg.classList.remove("hidden");
    }
}

// 3. Logika Kartu Gosok
const canvas = document.getElementById('scratch-canvas');
const ctx = canvas.getContext('2d');
let isScratching = false;
let revealed = false;

function initCanvas() {
    // Kunci ukuran kanvas
    canvas.width = 320;
    canvas.height = 220;

    // Gambar lapisan penutup
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#a1a1aa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Tekstur statik
    ctx.fillStyle = '#d4d4d8';
    for (let i = 0; i < canvas.width; i += 4) {
        for (let j = 0; j < canvas.height; j += 4) {
            if (Math.random() > 0.5) ctx.fillRect(i, j, 4, 4);
        }
    }
    
    // Teks instruksi
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
    
    // Kalkulasi presisi tinggi jika layar di-*zoom*
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
    
    // Mengecek berapa banyak area transparan
    for (let i = 3; i < imageData.length; i += 16) { 
        if (imageData[i] === 0) clearPixels++; 
    }
    
    const totalPixels = imageData.length / 16;
    if ((clearPixels / totalPixels) > 0.45) { // Jika sudah 45% digosok
        revealed = true;
        
        // Animasi buka sisa kartu
        canvas.style.transition = 'opacity 0.6s ease-out';
        canvas.style.opacity = '0';
        
        // Tampilkan tombol SKL (Bisa di-klik karena canvas menghilang)
        document.getElementById("btn-download").classList.remove("hidden");
        
        // Tembak Confetti dari library!
        setTimeout(() => {
            canvas.style.pointerEvents = 'none'; // Matikan deteksi mouse di canvas
            confetti({
                particleCount: 150,
                spread: 80,
                origin: { y: 0.6 },
                colors: ['#fbbf24', '#ef4444', '#3b82f6', '#10b981', '#ec4899']
            });
        }, 200);
    }
}

// Event Listeners (Support Mouse & Touch Screen)
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
