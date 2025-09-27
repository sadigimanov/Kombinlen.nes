// Kateqoriyalar
const categories = ["papaq", "koynek", "salvar", "ayaqqabi", "saat", "eynek", "canta"];

// Hər geyim üçün şəkil siyahıları
let clothes = {
  papaq: [],
  koynek: [],
  salvar: [],
  ayaqqabi: [],
  saat: [],
  eynek: [],
  canta: []
};

// Cari indexlər
let indexes = {
  papaq: 0,
  koynek: 0,
  salvar: 0,
  ayaqqabi: 0,
  saat: 0,
  eynek: 0,
  canta: 0
};

// ✅ LocalStorage-dan yükləmə
window.onload = () => {
  const saved = localStorage.getItem("clothesData");
  if (saved) {
    clothes = JSON.parse(saved);
    for (let type of categories) {
      if (clothes[type] && clothes[type].length > 0) {
        indexes[type] = 0;
        updateDisplay(type);
      }
    }
  }
};

// ✅ LocalStorage-a saxlama
function saveData() {
  localStorage.setItem("clothesData", JSON.stringify(clothes));
}

// ✅ Şəkil yükləmə
function uploadImage(event, type) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    clothes[type].push(e.target.result);
    indexes[type] = clothes[type].length - 1;
    updateDisplay(type);
    saveData();
  };
  reader.readAsDataURL(file);
}

// ✅ Şəkil göstərmə
function updateDisplay(type) {
  const display = document.getElementById(type + "-display");
  if (clothes[type].length > 0) {
    display.src = clothes[type][indexes[type]];
    document.getElementById("kombin-" + type).src = clothes[type][indexes[type]];
  } else {
    display.src = "";
    document.getElementById("kombin-" + type).src = "";
  }
}

// ✅ Növbəti şəkil
function next(type) {
  if (clothes[type].length === 0) return;
  indexes[type] = (indexes[type] + 1) % clothes[type].length;
  updateDisplay(type);
  saveData();
}

// ✅ Əvvəlki şəkil
function prev(type) {
  if (clothes[type].length === 0) return;
  indexes[type] = (indexes[type] - 1 + clothes[type].length) % clothes[type].length;
  updateDisplay(type);
  saveData();
}

// ✅ Şəkli silmək
function deleteImage(type) {
  if (clothes[type].length === 0) return;

  // Cari şəkli sil
  clothes[type].splice(indexes[type], 1);

  // Index düzəlt
  if (indexes[type] >= clothes[type].length) {
    indexes[type] = clothes[type].length - 1;
  }
  if (indexes[type] < 0) {
    indexes[type] = 0;
  }

  // Əgər şəkil qalmayıbsa boş göstər
  if (clothes[type].length === 0) {
    document.getElementById(type + "-display").src = "";
    document.getElementById("kombin-" + type).src = "";
  } else {
    updateDisplay(type);
  }

  // ⚡ LocalStorage-da da saxla
  saveData();
}


