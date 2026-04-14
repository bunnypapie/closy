(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const App = window.ClosyApp;
    const storage = window.ClosyStorage;
    const list = document.getElementById('savedList');
    const modal = document.getElementById('savedDetailModal');
    const closeBtn = document.getElementById('closeSavedDetailModal');
    const content = document.getElementById('savedDetailContent');

    function render() {
      const outfits = storage.getOutfits();
      if (!outfits.length) {
        list.innerHTML = App.emptyHTML('ยังไม่มีชุดที่บันทึก', 'ไปที่หน้า Generate Outfit แล้วบันทึกชุดที่ชอบก่อน');
        return;
      }

      list.innerHTML = outfits.map((outfit) => `
        <article class="card item-card">
          <div class="saved-mini-grid">
            ${outfit.items.map((item) => `
              <div class="saved-mini-card">
                <img src="${item.image}" alt="${item.name}" />
                <strong>${item.name}</strong>
                <span class="subtle">${item.mainCategory}</span>
              </div>
            `).join('')}
          </div>
          <div>
            <h3>${outfit.occasion || 'สุ่มทั่วไป'} · ${outfit.mood || 'ทุก Mood'}</h3>
            <p class="subtle">บันทึกเมื่อ ${App.formatDate(outfit.createdAt)}</p>
          </div>
          <div class="card-actions">
            <button class="btn btn-secondary view-btn" data-id="${outfit.id}">ดูรายละเอียด</button>
            <button class="btn btn-danger delete-btn" data-id="${outfit.id}">ลบ</button>
          </div>
        </article>
      `).join('');

      App.qsa('.view-btn', list).forEach((btn) => btn.addEventListener('click', () => showDetail(btn.dataset.id)));
      App.qsa('.delete-btn', list).forEach((btn) => btn.addEventListener('click', () => {
        if (confirm('ต้องการลบชุดนี้หรือไม่?')) {
          storage.deleteOutfit(btn.dataset.id);
          App.showToast('ลบชุดที่บันทึกแล้ว');
          render();
        }
      }));
    }

    function showDetail(id) {
      const outfit = storage.getOutfits().find((entry) => entry.id === id);
      if (!outfit) return;
      modal.classList.remove('hidden');
      content.innerHTML = `
        <p class="subtle">บันทึกเมื่อ ${App.formatDate(outfit.createdAt)}</p>
        <p><strong>Mood:</strong> ${outfit.mood} · <strong>Occasion:</strong> ${outfit.occasion} · <strong>Weather:</strong> ${outfit.weather}</p>
        <div class="saved-mini-grid">
          ${outfit.items.map((item) => `
            <article class="card saved-mini-card">
              <img src="${item.image}" alt="${item.name}" />
              <h3>${item.name}</h3>
              <p class="subtle">${item.mainCategory} · ${item.subCategory}</p>
              <p>${item.meaning || 'ไม่มีคำอธิบายเพิ่มเติม'}</p>
            </article>
          `).join('')}
        </div>
      `;
    }

    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });
    render();
  });
})();
