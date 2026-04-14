(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const App = window.ClosyApp;
    const storage = window.ClosyStorage;
    const statsBox = document.getElementById('homeStats');
    if (!statsBox) return;

    const items = storage.getItems();
    const outfits = storage.getOutfits();
    const user = storage.getUser();

    const stats = [
      { number: items.length, label: 'จำนวนเสื้อผ้าทั้งหมด' },
      { number: items.filter(i => i.mainCategory === 'Top').length, label: 'จำนวน Top' },
      { number: outfits.length, label: 'Outfit ที่บันทึกแล้ว' },
      { number: user ? 'Cloud' : 'Local', label: 'โหมดการบันทึกข้อมูล' }
    ];

    statsBox.innerHTML = stats.map((stat) => `
      <div class="stat-card">
        <div class="stat-number">${stat.number}</div>
        <div class="stat-label">${stat.label}</div>
      </div>
    `).join('');
  });
})();
