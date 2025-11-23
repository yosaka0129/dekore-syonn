const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let photo = null;
let currentStamp = null;
let placedStamps = [];

canvas.width = window.innerWidth * 0.9;
canvas.height = window.innerHeight * 0.6;

// 写真アップロード
document.getElementById('upload').onchange = e => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    photo = new Image();
    photo.onload = () => draw();
    photo.src = reader.result;
  };
  reader.readAsDataURL(file);
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
showCategory("stamps"); // デフォルトはスタンプ表示

// キャンバスにスタンプ配置
canvas.onclick = e => {
  if (currentStamp) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    placedStamps.push({img: currentStamp, x, y, size: 80});
    draw();
  }
};

// 描画処理
function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if (photo) ctx.drawImage(photo,0,0,canvas.width,canvas.height);
  placedStamps.forEach(s => {
    ctx.drawImage(s.img, s.x - s.size/2, s.y - s.size/2, s.size, s.size);
  });
}