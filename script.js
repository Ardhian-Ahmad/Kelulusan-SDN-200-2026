const dataSiswa = {
    "123456": { nama: "Budi Santoso", status: "LULUS" },
    "654321": { nama: "Siti Aminah", status: "LULUS" }
};

function cekKelulusan() {
    const nisn = document.getElementById("nisn-input").value;
    if (dataSiswa[nisn]) {
        // Transisi halus ke kartu gosok
        document.getElementById("login-section").style.display = "none";
        const scratchSection = document.getElementById("scratch-section");
        scratchSection.style.display = "block";
        scratchSection.classList.add("fade-in");
        
        document.getElementById("nama-siswa").innerText = dataSiswa[nisn].nama;
        initScratchCard(); 
    } else {
        document.getElementById("error-msg").style.display = "block";
    }
}

function initScratchCard() {
    const canvas = document.getElementById("scratch-pad");
    const ctx = canvas.getContext("2d");
    
    // Sesuaikan dengan ukuran CSS (100% width = ~390px di mobile)
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;

    // Membuat efek warna perak metalik untuk kartu gosok
    let gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#e0e0e0");
    gradient.addColorStop(0.5, "#b8b8b8");
    gradient.addColorStop(1, "#888888");
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Teks di atas lapisan perak
    ctx.font = "bold 22px Poppins";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("GOSOK DI SINI", canvas.width / 2, canvas.height / 2);

    let isDrawing = false;
    let scratchCount = 0;
    let confettiFired = false;

    function scratch(e) {
        if (!isDrawing) return;
        
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.arc(x, y, 25, 0, Math.PI * 2, false); 
        ctx.fill();

        // Hitung gerakan gosok untuk memicu Confetti
        scratchCount++;
        if (scratchCount > 40 && !confettiFired) {
            tembakConfetti();
            confettiFired = true;
        }
    }

    function tembakConfetti() {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
        });
    }

    canvas.addEventListener("mousedown", () => isDrawing = true);
    canvas.addEventListener("mousemove", scratch);
    canvas.addEventListener("mouseup", () => isDrawing = false);
    canvas.addEventListener("mouseleave", () => isDrawing = false);

    canvas.addEventListener("touchstart", (e) => { isDrawing = true; scratch(e); e.preventDefault(); });
    canvas.addEventListener("touchmove", (e) => { scratch(e); e.preventDefault(); });
    canvas.addEventListener("touchend", () => isDrawing = false);
}
