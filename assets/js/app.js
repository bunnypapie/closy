(function () {
  const App = {
    storage: window.ClosyStorage,
    init() {
      this.storage.seedDemoData();
      this.renderUserNav();
      this.renderFooterSync();
    },
    qs(selector, parent = document) { return parent.querySelector(selector); },
    qsa(selector, parent = document) { return Array.from(parent.querySelectorAll(selector)); },
    showToast(message, type = 'success') {
      const container = this.qs('#toastContainer');
      if (!container) return;
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      toast.textContent = message;
      container.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-4px)';
      }, 2600);
      setTimeout(() => toast.remove(), 3200);
    },
    renderUserNav() {
      const box = this.qs('#navUserBox');
      if (!box) return;
      const user = this.storage.getUser();
      box.innerHTML = user
        ? `<a class="user-chip" href="login.html">👋 ${user.displayName}</a>`
        : `<a class="user-chip" href="login.html">Guest Mode</a>`;
    },
    renderFooterSync() {
      const el = this.qs('#syncFooterStatus');
      if (!el) return;
      const user = this.storage.getUser();
      el.textContent = user ? `Sync พร้อมใช้งาน: ${user.email}` : 'สถานะ: Local only';
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });
    },
    renderOptions(select, values, withAll = true, allLabel = 'ทั้งหมด') {
      if (!select) return;
      const options = [];
      if (withAll) options.push(`<option value="all">${allLabel}</option>`);
      values.forEach((value) => options.push(`<option value="${value}">${value}</option>`));
      select.innerHTML = options.join('');
    },
    createCheckboxGroup(container, values, name, selected = []) {
      if (!container) return;
      container.innerHTML = values.map((value) => `
        <label class="checkbox-chip">
          <input type="checkbox" name="${name}" value="${value}" ${selected.includes(value) ? 'checked' : ''} />
          <span>${value}</span>
        </label>
      `).join('');
    },
    getCheckedValues(selector) {
      return this.qsa(selector).filter((input) => input.checked).map((input) => input.value);
    },
    makeTags(items = []) {
      return items.map((item) => `<span class="tag">${item}</span>`).join('');
    },
    itemCardHTML(item, actions = '') {
      return `
        <article class="card item-card">
          <img src="${item.image}" alt="${item.name}" />
          <div>
            <h3>${item.name}</h3>
            <p class="subtle">${item.mainCategory} · ${item.subCategory} · ${item.color}</p>
          </div>
          <div class="tag-row">${this.makeTags(item.occasions)}${this.makeTags(item.moods)}</div>
          <p>${item.meaning || 'ไม่มีคำอธิบายเพิ่มเติม'}</p>
          <div class="card-actions">${actions}</div>
        </article>
      `;
    },
    emptyHTML(title, text) {
      return `
        <div class="empty-state card">
          <div class="empty-emoji">🫧</div>
          <h3>${title}</h3>
          <p>${text}</p>
        </div>
      `;
    },
    copyText(text) {
      navigator.clipboard.writeText(text).then(() => this.showToast('คัดลอกข้อความสำหรับแชร์แล้ว'));
    }
  };

  window.ClosyApp = App;
  document.addEventListener('DOMContentLoaded', () => App.init());
})();
