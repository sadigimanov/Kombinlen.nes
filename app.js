let db;
let indexes = { papaq: 0, koynek: 0, salvar: 0, ayaqqabi: 0 };

// 🔹 IndexedDB açılır
const request = indexedDB.open("KombinDB", 1);

request.onupgradeneeded = (event) => {
  db = event.target.result;
  ["papaq", "koynek", "salvar", "ayaqqabi"].forEach(type => {
    if (!db.objectStoreNames.contains(type)) {
      db.createObjectStore(type, { keyPath: "id", autoIncrement: true });
    }
  });
};

request.onsuccess = (event) => {
  db = event.target.result;
  loadAll();
};

request.onerror = (event) => {
  console.error("DB error:", event.target.error);
};

// 🔹 Şəkil yükləmə
function uploadImage(event, type) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const tx = db.transaction(type, "readwrite");
    const store = tx.objectStore(type);
    store.add({ src: e.target.result });
    tx.oncomplete = () => loadImages(type);
  };
  reader.readAsDataURL(file);
}

// 🔹 Şəkilləri DB-dən yüklə
function loadImages(type) {
  const tx = db.transaction(type, "readonly");
  const store = tx.objectStore(type);
  const req = store.getAll();

  req.onsuccess = () => {
    const images = req.result;
    if (images.length > 0) {
      if (indexes[type] >= images.length) indexes[type] = 0;
      updateDisplay(type, images[indexes[type]].src);
    } else {
      document.getElementById(type + "-display").src = "";
      document.getElementById("kombin-" + type).src = "";
    }
  };
}

// 🔹 Bütün kateqoriyaları yüklə
function loadAll() {
  ["papaq", "koynek", "salvar", "ayaqqabi"].forEach(type => loadImages(type));
}

// 🔹 Şəkli göstər
function updateDisplay(type, src) {
  document.getElementById(type + "-display").src = src;
  document.getElementById("kombin-" + type).src = src;
}

// 🔹 Növbəti
function next(type) {
  const tx = db.transaction(type, "readonly");
  const store = tx.objectStore(type);
  const req = store.getAll();

  req.onsuccess = () => {
    const images = req.result;
    if (images.length > 0) {
      indexes[type] = (indexes[type] + 1) % images.length;
      updateDisplay(type, images[indexes[type]].src);
    }
  };
}

// 🔹 Əvvəlki
function prev(type) {
  const tx = db.transaction(type, "readonly");
  const store = tx.objectStore(type);
  const req = store.getAll();

  req.onsuccess = () => {
    const images = req.result;
    if (images.length > 0) {
      indexes[type] = (indexes[type] - 1 + images.length) % images.length;
      updateDisplay(type, images[indexes[type]].src);
    }
  };
}

// 🔹 Sil (hazırda göstərilən şəkil silinir!)
function deleteImage(type) {
  const tx = db.transaction(type, "readwrite");
  const store = tx.objectStore(type);
  const req = store.getAll();

  req.onsuccess = () => {
    const images = req.result;
    if (images.length === 0) return;

    let currentIndex = indexes[type];
    const toDelete = images[currentIndex].id;

    // DB-dən sil
    store.delete(toDelete);

    tx.oncomplete = () => {
      const refreshTx = db.transaction(type, "readonly");
      const refreshStore = refreshTx.objectStore(type);
      const refreshReq = refreshStore.getAll();

      refreshReq.onsuccess = () => {
        const newImages = refreshReq.result;

        if (newImages.length > 0) {
          if (currentIndex >= newImages.length) currentIndex = newImages.length - 1;
          indexes[type] = currentIndex;
          updateDisplay(type, newImages[currentIndex].src);
        } else {
          indexes[type] = 0;
          document.getElementById(type + "-display").src = "";
          document.getElementById("kombin-" + type).src = "";
        }
      };
    };
  };
}
