// Data statis siswa (Bisa dipisah ke file JSON nanti)
const dataSiswa = {
    "123456": { nama: "Budi Santoso", status: "LULUS" },
    "654321": { nama: "Siti Aminah", status: "LULUS" }
};

function cekKelulusan() {
    const nisn = document.getElementById("nisn-input").value;
    if (dataSiswa[nisn]) {
        document.getElementById("login-section").style.display = "none";
        document.getElementById("scratch-section").style.display = "block";
        document.getElementById("nama-siswa").innerText = dataSiswa[nisn].nama;
        initScratchCard(); // Mulai fungsi gosok
    } else {
        document.getElementById("error-msg").style.display = "block";
    }
}

function initScratchCard() {
    const canvas = document.getElementById("scratch-pad");
    const ctx = canvas.getContext("2d");
    
    // Set resolusi canvas sesuai ukuran kontainernya
    canvas.width = 300;
    canvas.height = 200;

    // Gambar lapisan penutup (bisa diganti dengan gambar logo sekolah nanti)
    ctx.fillStyle = "#888888"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Tambahkan teks petunjuk di atas lapisan abu-abu
    ctx.font = "20px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText("Gosok di sini", canvas.width / 2, canvas.height / 2);

    let isDrawing = false;

    // Fungsi untuk menghapus lapisan
    function scratch(e) {
        if (!isDrawing) return;
        
        // Mendapatkan posisi kursor/jari yang akurat
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2, false); // Angka 20 adalah ketebalan 'koin' penggosok
        ctx.fill();
    }

    // Event listeners untuk Mouse (PC)
    canvas.addEventListener("mousedown", () => isDrawing = true);
    canvas.addEventListener("mousemove", scratch);
    canvas.addEventListener("mouseup", () => isDrawing = false);
    canvas.addEventListener("mouseleave", () => isDrawing = false);

    // Event listeners untuk Touch (Mobile/Tablet) - Support Android/iOS
    canvas.addEventListener("touchstart", (e) => { isDrawing = true; scratch(e); e.preventDefault(); });
    canvas.addEventListener("touchmove", (e) => { scratch(e); e.preventDefault(); });
    canvas.addEventListener("touchend", () => isDrawing = false);
}
