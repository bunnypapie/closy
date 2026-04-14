(function () {
  const KEYS = {
    items: 'closy_items',
    outfits: 'closy_outfits',
    user: 'closy_user',
    cloud: 'closy_cloud'
  };

  const SUB_CATEGORIES = {
    Top: ['T-Shirt', 'Shirt', 'Blouse', 'Tank Top', 'Sweater', 'Hoodie'],
    Bottom: ['Jeans', 'Trousers', 'Skirt', 'Shorts'],
    Shoes: ['Sneakers', 'Loafers', 'Sandals', 'Boots'],
    Outerwear: ['Jacket', 'Cardigan', 'Coat', 'Blazer']
  };

  const OCCASIONS = ['ไปมหาลัย', 'ทำงาน', 'เที่ยว', 'อยู่บ้าน', 'ออกเดต', 'งานทางการ'];
  const MOODS = ['ชิล', 'มั่นใจ', 'สดใส', 'สุภาพ', 'เท่', 'สบายๆ'];

  const read = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
      return fallback;
    }
  };

  const write = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
    return value;
  };

  const makeId = (prefix = 'id') => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const clone = (value) => JSON.parse(JSON.stringify(value));

  const storage = {
    KEYS,
    OCCASIONS,
    MOODS,
    SUB_CATEGORIES,
    getItems() { return read(KEYS.items, []); },
    saveItems(items) { return write(KEYS.items, items); },
    addItem(item) {
      const items = this.getItems();
      items.unshift(item);
      this.saveItems(items);
      this.syncIfLoggedIn();
      return item;
    },
    updateItem(updated) {
      const items = this.getItems().map((item) => item.id === updated.id ? updated : item);
      this.saveItems(items);
      this.syncIfLoggedIn();
      return updated;
    },
    deleteItem(id) {
      const items = this.getItems().filter((item) => item.id !== id);
      this.saveItems(items);
      const outfits = this.getOutfits().filter((outfit) => !outfit.items.some((item) => item.id === id));
      this.saveOutfits(outfits);
      this.syncIfLoggedIn();
    },
    getOutfits() { return read(KEYS.outfits, []); },
    saveOutfits(outfits) { return write(KEYS.outfits, outfits); },
    addOutfit(outfit) {
      const outfits = this.getOutfits();
      outfits.unshift(outfit);
      this.saveOutfits(outfits);
      this.syncIfLoggedIn();
      return outfit;
    },
    deleteOutfit(id) {
      const outfits = this.getOutfits().filter((outfit) => outfit.id !== id);
      this.saveOutfits(outfits);
      this.syncIfLoggedIn();
    },
    getUser() { return read(KEYS.user, null); },
    saveUser(user) { return write(KEYS.user, user); },
    logout() { localStorage.removeItem(KEYS.user); },
    getCloud() { return read(KEYS.cloud, {}); },
    saveCloud(cloud) { return write(KEYS.cloud, cloud); },
    syncToCloud() {
      const user = this.getUser();
      if (!user) return false;
      const cloud = this.getCloud();
      cloud[user.email] = {
        items: clone(this.getItems()),
        outfits: clone(this.getOutfits()),
        syncedAt: new Date().toISOString(),
        profile: clone(user)
      };
      this.saveCloud(cloud);
      return true;
    },
    pullFromCloud(email) {
      const cloud = this.getCloud();
      if (!cloud[email]) return false;
      this.saveItems(clone(cloud[email].items || []));
      this.saveOutfits(clone(cloud[email].outfits || []));
      return true;
    },
    syncIfLoggedIn() {
      if (this.getUser()) this.syncToCloud();
    },
    login({ displayName, email }) {
      const user = {
        displayName,
        email,
        isLoggedIn: true,
        loginAt: new Date().toISOString()
      };
      this.saveUser(user);
      const hasCloudData = this.pullFromCloud(email);
      if (!hasCloudData) this.syncToCloud();
      return user;
    },
    makeId,
    seedDemoData() {
      if (this.getItems().length > 0) return;
      const placeholders = [
        { name: 'เสื้อยืดขาว', mainCategory: 'Top', subCategory: 'T-Shirt', color: 'ขาว', occasions: ['ไปมหาลัย', 'เที่ยว'], moods: ['ชิล', 'สดใส'], weather: 'ร้อน', comfort: 5, confidence: 4, meaning: 'ใส่ง่ายทุกวัน', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80' },
        { name: 'กางเกงยีนส์ฟ้า', mainCategory: 'Bottom', subCategory: 'Jeans', color: 'ฟ้า', occasions: ['ไปมหาลัย', 'เที่ยว'], moods: ['ชิล', 'เท่'], weather: 'ได้ทุกสภาพอากาศ', comfort: 4, confidence: 4, meaning: 'เข้ากับหลายลุค', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80' },
        { name: 'รองเท้าผ้าใบชมพู', mainCategory: 'Shoes', subCategory: 'Sneakers', color: 'ชมพู', occasions: ['ไปมหาลัย', 'เที่ยว'], moods: ['สดใส', 'ชิล'], weather: 'ได้ทุกสภาพอากาศ', comfort: 5, confidence: 4, meaning: 'ใส่แล้วดูสดใส', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80' },
        { name: 'เสื้อคาร์ดิแกนฟ้าอ่อน', mainCategory: 'Outerwear', subCategory: 'Cardigan', color: 'ฟ้าอ่อน', occasions: ['ทำงาน', 'ไปมหาลัย'], moods: ['สุภาพ', 'สบายๆ'], weather: 'เย็น', comfort: 4, confidence: 5, meaning: 'เหมาะกับห้องแอร์', image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80' },
        { name: 'กางเกงผ้าสีครีม', mainCategory: 'Bottom', subCategory: 'Trousers', color: 'ครีม', occasions: ['ทำงาน', 'งานทางการ'], moods: ['สุภาพ', 'มั่นใจ'], weather: 'ได้ทุกสภาพอากาศ', comfort: 4, confidence: 5, meaning: 'ลุคเรียบร้อย', image: 'https://images.unsplash.com/photo-1506629905607-d9f8b4f3d0b0?auto=format&fit=crop&w=900&q=80' },
        { name: 'รองเท้าโลฟเฟอร์', mainCategory: 'Shoes', subCategory: 'Loafers', color: 'น้ำตาล', occasions: ['ทำงาน', 'งานทางการ'], moods: ['สุภาพ', 'มั่นใจ'], weather: 'ได้ทุกสภาพอากาศ', comfort: 3, confidence: 5, meaning: 'เหมาะกับวันที่ต้องการความเรียบร้อย', image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=900&q=80' }
      ];
      this.saveItems(placeholders.map((item) => ({ ...item, id: makeId('item'), createdAt: new Date().toISOString() })));
    }
  };

  window.ClosyStorage = storage;
})();
