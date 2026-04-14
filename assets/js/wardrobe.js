(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const App = window.ClosyApp;
    const storage = window.ClosyStorage;
    const list = document.getElementById('wardrobeList');
    const filterCategory = document.getElementById('filterCategory');
    const filterMood = document.getElementById('filterMood');
    const filterOccasion = document.getElementById('filterOccasion');
    const searchInput = document.getElementById('searchWardrobe');
    const editModal = document.getElementById('editModal');
    const closeEditModal = document.getElementById('closeEditModal');
    const editItemForm = document.getElementById('editItemForm');

    App.renderOptions(filterMood, storage.MOODS, true, 'ทุก Mood');
    App.renderOptions(filterOccasion, storage.OCCASIONS, true, 'ทุก Occasion');

    function getFilteredItems() {
      return storage.getItems().filter((item) => {
        const categoryPass = filterCategory.value === 'all' || item.mainCategory === filterCategory.value;
        const moodPass = filterMood.value === 'all' || item.moods.includes(filterMood.value);
        const occasionPass = filterOccasion.value === 'all' || item.occasions.includes(filterOccasion.value);
        const searchPass = item.name.toLowerCase().includes(searchInput.value.trim().toLowerCase());
        return categoryPass && moodPass && occasionPass && searchPass;
      });
    }

    function render() {
      const items = getFilteredItems();
      if (!items.length) {
        list.innerHTML = App.emptyHTML('ยังไม่พบเสื้อผ้า', 'ลองเปลี่ยนตัวกรอง หรือเพิ่มเสื้อผ้าใหม่ก่อน');
        return;
      }

      list.innerHTML = items.map((item) => App.itemCardHTML(item, `
        <button class="btn btn-secondary edit-btn" data-id="${item.id}">แก้ไข</button>
        <button class="btn btn-danger delete-btn" data-id="${item.id}">ลบ</button>
      `)).join('');

      App.qsa('.delete-btn', list).forEach((btn) => {
        btn.addEventListener('click', () => {
          if (confirm('ต้องการลบเสื้อผ้าชิ้นนี้หรือไม่?')) {
            storage.deleteItem(btn.dataset.id);
            App.showToast('ลบเสื้อผ้าแล้ว');
            render();
          }
        });
      });

      App.qsa('.edit-btn', list).forEach((btn) => {
        btn.addEventListener('click', () => openEdit(btn.dataset.id));
      });
    }

    function openEdit(id) {
      const item = storage.getItems().find((entry) => entry.id === id);
      if (!item) return;
      editModal.classList.remove('hidden');
      editItemForm.innerHTML = `
        <input type="hidden" id="editId" value="${item.id}" />
        <div class="field full-width">
          <label>ชื่อเสื้อผ้า</label>
          <input id="editName" value="${item.name}" required />
        </div>
        <div class="field">
          <label>หมวดหลัก</label>
          <select id="editMainCategory"></select>
        </div>
        <div class="field">
          <label>หมวดย่อย</label>
          <select id="editSubCategory"></select>
        </div>
        <div class="field full-width">
          <label>สี</label>
          <input id="editColor" value="${item.color}" required />
        </div>
        <div class="field full-width"><label>Occasion</label><div id="editOccasionGroup" class="checkbox-grid"></div></div>
        <div class="field full-width"><label>Mood</label><div id="editMoodGroup" class="checkbox-grid"></div></div>
        <div class="field">
          <label>Weather</label>
          <select id="editWeather">
            <option value="ร้อน">ร้อน</option>
            <option value="ฝนตก">ฝนตก</option>
            <option value="เย็น">เย็น</option>
            <option value="ได้ทุกสภาพอากาศ">ได้ทุกสภาพอากาศ</option>
          </select>
        </div>
        <div class="field">
          <label>Comfort</label>
          <input id="editComfort" type="range" min="1" max="5" value="${item.comfort}" />
        </div>
        <div class="field">
          <label>Confidence</label>
          <input id="editConfidence" type="range" min="1" max="5" value="${item.confidence}" />
        </div>
        <div class="field full-width">
          <label>ความหมายส่วนตัว</label>
          <textarea id="editMeaning" rows="4">${item.meaning || ''}</textarea>
        </div>
        <div class="field full-width two-buttons">
          <button class="btn btn-primary" type="submit">บันทึกการแก้ไข</button>
          <button class="btn btn-secondary" type="button" id="cancelEditBtn">ยกเลิก</button>
        </div>
      `;

      const editMainCategory = document.getElementById('editMainCategory');
      const editSubCategory = document.getElementById('editSubCategory');
      editMainCategory.innerHTML = Object.keys(storage.SUB_CATEGORIES).map(cat => `<option value="${cat}" ${cat === item.mainCategory ? 'selected' : ''}>${cat}</option>`).join('');

      const fillSub = () => {
        editSubCategory.innerHTML = storage.SUB_CATEGORIES[editMainCategory.value].map(sub => `<option value="${sub}" ${sub === item.subCategory ? 'selected' : ''}>${sub}</option>`).join('');
      };
      fillSub();
      editMainCategory.addEventListener('change', fillSub);
      document.getElementById('editWeather').value = item.weather;
      App.createCheckboxGroup(document.getElementById('editOccasionGroup'), storage.OCCASIONS, 'editOccasion', item.occasions);
      App.createCheckboxGroup(document.getElementById('editMoodGroup'), storage.MOODS, 'editMood', item.moods);
      document.getElementById('cancelEditBtn').addEventListener('click', closeModal);
    }

    function closeModal() { editModal.classList.add('hidden'); }

    editItemForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('editId').value;
      const original = storage.getItems().find((item) => item.id === id);
      if (!original) return;

      const updated = {
        ...original,
        name: document.getElementById('editName').value.trim(),
        mainCategory: document.getElementById('editMainCategory').value,
        subCategory: document.getElementById('editSubCategory').value,
        color: document.getElementById('editColor').value.trim(),
        occasions: App.getCheckedValues('input[name="editOccasion"]'),
        moods: App.getCheckedValues('input[name="editMood"]'),
        weather: document.getElementById('editWeather').value,
        comfort: Number(document.getElementById('editComfort').value),
        confidence: Number(document.getElementById('editConfidence').value),
        meaning: document.getElementById('editMeaning').value.trim()
      };

      if (!updated.name || updated.occasions.length === 0 || updated.moods.length === 0) {
        App.showToast('กรุณากรอกข้อมูลให้ครบก่อนบันทึก', 'error');
        return;
      }
      storage.updateItem(updated);
      App.showToast('แก้ไขข้อมูลเสื้อผ้าแล้ว');
      closeModal();
      render();
    });

    [filterCategory, filterMood, filterOccasion].forEach(el => el.addEventListener('change', render));
    searchInput.addEventListener('input', render);
    closeEditModal.addEventListener('click', closeModal);
    editModal.addEventListener('click', (e) => { if (e.target === editModal) closeModal(); });

    render();
  });
})();
