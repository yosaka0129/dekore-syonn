// ===== トリミング画面 =====
let cropper;
const upload = document.getElementById('upload');
if (upload) {
  upload.onchange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const img = document.createElement('img');
      img.src = reader.result;
      document.getElementById('cropArea').innerHTML = "";
      document.getElementById('cropArea').appendChild(img);
      cropper = new Cropper(img, { aspectRatio: 1 });
    };
    reader.readAsDataURL(file);
  };
}

const rotateBtn = document.getElementById('rotateBtn');
if (rotateBtn) rotateBtn.onclick = () => cropper && cropper.rotate(90);

const confirmBtn = document.getElementById('confirmBtn');
if (confirmBtn) confirmBtn.onclick = () => {
  if (cropper) {
    const croppedCanvas = cropper.getCroppedCanvas();
    const dataUrl = croppedCanvas.toDataURL();
    sessionStorage.setItem("croppedPhoto", dataUrl);
    window.location.href = "decoration.html";
  }
};

// ===== デコレーション画面 =====
const canvas = document.getElementById('canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth * 0.9;
  canvas.height = window.innerHeight * 0.6;

  let photo = new Image();
  photo.src = sessionStorage.getItem("croppedPhoto");
  photo.onload = () => draw();

  let placedStamps = [];
  let selectedStamp = null;
  let currentStamp = null;
  let currentFrame = null;

  function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if (photo) ctx.drawImage(photo,0,0,canvas.width,canvas.height);

    placedStamps.forEach(s => {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle * Math.PI/180);
      ctx.drawImage(s.img, -s.size/2, -s.size/2, s.size, s.size);
      if (s === selectedStamp) {
        ctx.strokeStyle = "red";
        ctx.lineWidth = 3;
        ctx.strokeRect(-s.size/2, -s.size/2, s.size, s.size);
      }
      ctx.restore();
    });

    if (currentFrame) {
      ctx.drawImage(currentFrame,0,0,canvas.width,canvas.height);
    }
  }

  canvas.onclick = e => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    selectedStamp = placedStamps.find(s =>
      x >= s.x - s.size/2 && x <= s.x + s.size/2 &&
      y >= s.y - s.size/2 && y <= s.y + s.size/2
    );
    if (!selectedStamp && currentStamp) {
      placedStamps.push({img: currentStamp, x, y, size: 80, angle: 0});
      draw();
    }
  };

  document.getElementById('undoBtn').onclick = () => {
    placedStamps.pop();
    draw();
  };

  document.getElementById('deleteBtn').onclick = () => {
    if (selectedStamp) {
      placedStamps = placedStamps.filter(s => s !== selectedStamp);
      selectedStamp = null;
      draw();
    }
  };

  document.getElementById('saveBtn').onclick = () => {
    const link = document.createElement('a');
    link.download = 'decorated.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  function loadCategory(name) {
    fetch(`assets/${name}/list.json`)
      .then(res => res.json())
      .then(files => {
        const container = document.getElementById(name);
        container.innerHTML = "";
        files.forEach(file => {
          const img = document.createElement("img");
          img.src = `assets/${name}/${file}`;
          img.onclick = () => {
            if (name === "frames") currentFrame = img;
            else currentStamp = img;
            draw();
          };
          container.appendChild(img);
        });
      });
  }

  function showCategory(name) {
    document.querySelectorAll('.category').forEach(div => div.style.display = 'none');
    document.getElementById(name).style.display = 'block';
  }

  ["frames","stamps","phrases"].forEach(loadCategory);
  showCategory("stamps");
}