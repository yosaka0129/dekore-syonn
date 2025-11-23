const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let photo = null;
let currentStamp = null;
let placedStamps = [];
let selectedStamp = null;

canvas.width = window.innerWidth * 0.9;
canvas.height = window.innerHeight * 0.6;

// 写真アップロード & Cropperでトリミング
let cropper;
document.getElementById('upload').onchange = e => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    const img = document.createElement('img');
    img.src = reader.result;
    document.body.appendChild(img);
    cropper = new Cropper(img, { aspectRatio: 1 });
  };
  reader.readAsDataURL(file);
};

document.getElementById('cropBtn').onclick = () => {
  if (cropper) {
    const croppedCanvas = cropper.getCroppedCanvas();
    photo = new Image();
    photo.onload = () => draw();
    photo.src = croppedCanvas.toDataURL();
    cropper.destroy();
    document.querySelector('img').remove();
  }
};

// JSONからカテゴリを読み込んで自動生成
function loadCategory(name) {
  fetch(`assets/${name}/list.json`)
    .then(res => res.json())
    .then(files => {
      const container = document.getElementById(name);
      container.innerHTML = "";
      files.forEach(file => {
        const img = document.createElement("img");
        img.src = `assets/${name}/${file}`;
        img.onclick = () => currentStamp = img;
        container.appendChild(img);
      });
    });
}

// カテゴリ切り替え
function showCategory(name) {
  document.querySelectorAll('.category').forEach(div => div.style.display = 'none');
  document.getElementById(name).style.display = 'block';
}

// 初期ロード
["frames","stamps","phrases"].forEach(loadCategory);
showCategory("stamps");

// キャンバスクリックでスタンプ配置 or 選択
canvas.onclick = e => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // 既存スタンプ選択判定
  selectedStamp = placedStamps.find(s =>
    x >= s.x - s.size/2 && x <= s.x + s.size/2 &&
    y >= s.y - s.size/2 && y <= s.y + s.size/2
  );

  if (!selectedStamp && currentStamp) {
    placedStamps.push({img: currentStamp, x, y, size: 80, angle: 0});
    draw();
  }
};

// スタンプ移動・拡大・回転（簡易版）
canvas.onmousemove = e => {
  if (selectedStamp && e.buttons === 1) {
    const rect = canvas.getBoundingClientRect();
    selectedStamp.x = e.clientX - rect.left;
    selectedStamp.y = e.clientY - rect.top;
    draw();
  }
};

// Undoボタン
document.getElementById('undoBtn').onclick = () => {
  placedStamps.pop();
  draw();
};

// 削除ボタン
document.getElementById('deleteBtn').onclick = () => {
  if (selectedStamp) {
    placedStamps = placedStamps.filter(s => s !== selectedStamp);
    selectedStamp = null;
    draw();
  }
};

// 保存ボタン
document.getElementById('saveBtn').onclick = () => {
  const link = document.createElement('a');
  link.download = 'decorated.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
};

// 描画処理
function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if (photo) ctx.drawImage(photo,0,0,canvas.width,canvas.height);
  placedStamps.forEach(s => {
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.angle * Math.PI/180);
    ctx.drawImage(s.img, -s.size/2, -s.size/2, s.size, s.size);
    ctx.restore();
  });
}