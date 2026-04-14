(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const App = window.ClosyApp;
    const storage = window.ClosyStorage;
    const loginCard = document.getElementById('loginCard');
    const profileCard = document.getElementById('profileCard');
    const loginForm = document.getElementById('loginForm');
    const guestBtn = document.getElementById('guestBtn');
    const profileInfo = document.getElementById('profileInfo');
    const forceSyncBtn = document.getElementById('forceSyncBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    function render() {
      const user = storage.getUser();
      if (!user) {
        loginCard.classList.remove('hidden');
        profileCard.classList.add('hidden');
        return;
      }

      loginCard.classList.add('hidden');
      profileCard.classList.remove('hidden');
      const cloud = storage.getCloud()[user.email];
      profileInfo.innerHTML = [
        ['ชื่อผู้ใช้', user.displayName],
        ['อีเมล', user.email],
        ['จำนวนเสื้อผ้า', storage.getItems().length],
        ['จำนวนชุดที่บันทึก', storage.getOutfits().length],
        ['ซิงก์ล่าสุด', cloud?.syncedAt ? App.formatDate(cloud.syncedAt) : '-']
      ].map(([label, value]) => `
        <div class="profile-info-card">
          <strong>${label}</strong>
          <div class="top-space">${value}</div>
        </div>
      `).join('');
    }

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const displayName = document.getElementById('displayName').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();
      if (!displayName || !email || !password) {
        App.showToast('กรุณากรอกข้อมูลให้ครบ', 'error');
        return;
      }
      storage.login({ displayName, email });
      storage.syncToCloud();
      App.showToast('เข้าสู่ระบบสำเร็จ และซิงก์ข้อมูลแล้ว');
      App.renderUserNav();
      App.renderFooterSync();
      render();
    });

    guestBtn.addEventListener('click', () => {
      App.showToast('ใช้งานแบบ Guest ได้ทันที ข้อมูลจะถูกเก็บในเครื่อง');
      window.location.href = 'index.html';
    });

    forceSyncBtn.addEventListener('click', () => {
      storage.syncToCloud();
      App.showToast('ซิงก์ข้อมูลล่าสุดแล้ว');
      render();
    });

    logoutBtn.addEventListener('click', () => {
      if (confirm('ต้องการออกจากระบบหรือไม่?')) {
        storage.logout();
        App.showToast('ออกจากระบบแล้ว');
        App.renderUserNav();
        App.renderFooterSync();
        render();
      }
    });

    render();
  });
})();
