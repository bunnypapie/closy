(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const App = window.ClosyApp;
    const storage = window.ClosyStorage;

    const fileInput = document.getElementById('itemImage');
    const previewImage = document.getElementById('previewImage');
    const placeholder = document.getElementById('uploadPlaceholder');
    const uploadBox = document.getElementById('uploadBox');
    const form = document.getElementById('itemForm');
    const mainCategory = document.getElementById('mainCategory');
    const subCategory = document.getElementById('subCategory');
    const comfort = document.getElementById('comfort');
    const confidence = document.getElementById('confidence');
    const comfortValue = document.getElementById('comfortValue');
    const confidenceValue = document.getElementById('confidenceValue');
    const changeImageBtn = document.getElementById('changeImageBtn');
    const removeImageBtn = document.getElementById('removeImageBtn');

    App.createCheckboxGroup(document.getElementById('occasionGroup'), storage.OCCASIONS, 'occasion');
    App.createCheckboxGroup(document.getElementById('moodGroup'), storage.MOODS, 'mood');

    function renderSubCategories() {
      const categories = storage.SUB_CATEGORIES[mainCategory.value] || [];
      subCategory.innerHTML = '<option value="">เลือกหมวดย่อย</option>' + categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
    }

    function loadPreview(file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        previewImage.src = event.target.result;
        previewImage.classList.remove('hidden');
        placeholder.classList.add('hidden');
      };
      reader.readAsDataURL(file);
    }

    mainCategory.addEventListener('change', renderSubCategories);
    comfort.addEventListener('input', () => comfortValue.textContent = comfort.value);
    confidence.addEventListener('input', () => confidenceValue.textContent = confidence.value);
    changeImageBtn.addEventListener('click', () => fileInput.click());

    removeImageBtn.addEventListener('click', () => {
      fileInput.value = '';
      previewImage.src = '';
      previewImage.classList.add('hidden');
      placeholder.classList.remove('hidden');
    });

    fileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) loadPreview(file);
    });

    ['dragenter', 'dragover'].forEach(evt => uploadBox.addEventListener(evt, (e) => {
      e.preventDefault();
      uploadBox.style.borderColor = '#ff8fc1';
    }));
    ['dragleave', 'drop'].forEach(evt => uploadBox.addEventListener(evt, (e) => {
      e.preventDefault();
      uploadBox.style.borderColor = '#c9ddf2';
    }));
    uploadBox.addEventListener('drop', (e) => {
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        fileInput.files = e.dataTransfer.files;
        loadPreview(file);
      }
    });

    form.addEventListener('reset', () => {
      setTimeout(() => {
        renderSubCategories();
        comfortValue.textContent = '3';
        confidenceValue.textContent = '3';
        previewImage.src = '';
        previewImage.classList.add('hidden');
        placeholder.classList.remove('hidden');
        App.createCheckboxGroup(document.getElementById('occasionGroup'), storage.OCCASIONS, 'occasion');
        App.createCheckboxGroup(document.getElementById('moodGroup'), storage.MOODS, 'mood');
      }, 0);
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const occasions = App.getCheckedValues('input[name="occasion"]');
      const moods = App.getCheckedValues('input[name="mood"]');
      if (!previewImage.src) {
        App.showToast('กรุณาอัปโหลดรูปภาพเสื้อผ้าก่อน', 'error');
        return;
      }
      if (occasions.length === 0 || moods.length === 0) {
        App.showToast('กรุณาเลือก Occasion และ Mood อย่างน้อย 1 รายการ', 'error');
        return;
      }

      const item = {
        id: storage.makeId('item'),
        name: document.getElementById('itemName').value.trim(),
        mainCategory: mainCategory.value,
        subCategory: subCategory.value,
        color: document.getElementById('color').value.trim(),
        occasions,
        moods,
        weather: document.getElementById('weather').value,
        comfort: Number(comfort.value),
        confidence: Number(confidence.value),
        meaning: document.getElementById('meaning').value.trim(),
        image: previewImage.src,
        createdAt: new Date().toISOString()
      };

      if (!item.name || !item.mainCategory || !item.subCategory || !item.color || !item.weather) {
        App.showToast('กรุณากรอกข้อมูลให้ครบ', 'error');
        return;
      }

      storage.addItem(item);
      const user = storage.getUser();
      App.showToast(user ? 'บันทึกเสื้อผ้าสำเร็จ และ sync ไป cloud แล้ว' : 'บันทึกเสื้อผ้าสำเร็จในเครื่องแล้ว');
      form.reset();
    });

    renderSubCategories();
  });
})();
