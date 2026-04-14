(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const App = window.ClosyApp;
    const storage = window.ClosyStorage;

    const tabs = App.qsa('.tab-btn');
    const panels = App.qsa('.tab-panel');
    const randomMood = document.getElementById('randomMood');
    const occasionSelect = document.getElementById('occasionSelect');
    const occasionMood = document.getElementById('occasionMood');
    const outfitGrid = document.getElementById('outfitGrid');
    const outfitMeta = document.getElementById('outfitMeta');
    const outfitResult = document.getElementById('outfitResult');
    const generateEmpty = document.getElementById('generateEmpty');
    const randomOutfitBtn = document.getElementById('randomOutfitBtn');
    const suggestOutfitBtn = document.getElementById('suggestOutfitBtn');
    const rerollBtn = document.getElementById('rerollBtn');
    const saveOutfitBtn = document.getElementById('saveOutfitBtn');
    const shareOutfitBtn = document.getElementById('shareOutfitBtn');

    let lastCriteria = null;
    let currentOutfit = null;

    App.renderOptions(randomMood, storage.MOODS, true, 'ทุก Mood');
    App.renderOptions(occasionMood, storage.MOODS, true, 'ทุก Mood');
    App.renderOptions(occasionSelect, storage.OCCASIONS, false);

    tabs.forEach((tab) => tab.addEventListener('click', () => {
      tabs.forEach((btn) => btn.classList.remove('active'));
      panels.forEach((panel) => panel.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`${tab.dataset.tab}Panel`).classList.add('active');
    }));

    function randomPick(list) {
      return list[Math.floor(Math.random() * list.length)];
    }

    function filterItems(category, criteria) {
      return storage.getItems().filter((item) => {
        const categoryPass = item.mainCategory === category || (category === 'Top' && item.mainCategory === 'Outerwear' ? false : item.mainCategory === category);
        const moodPass = criteria.mood === 'all' || item.moods.includes(criteria.mood);
        const occasionPass = !criteria.occasion || item.occasions.includes(criteria.occasion);
        const weatherPass = criteria.weather === 'all' || item.weather === criteria.weather || item.weather === 'ได้ทุกสภาพอากาศ';
        return categoryPass && moodPass && occasionPass && weatherPass;
      });
    }

    function buildOutfit(criteria) {
      const topPool = filterItems('Top', criteria);
      const bottomPool = filterItems('Bottom', criteria);
      const shoesPool = filterItems('Shoes', criteria);

      if (!topPool.length || !bottomPool.length || !shoesPool.length) {
        return null;
      }

      return {
        id: storage.makeId('preview'),
        mood: criteria.mood === 'all' ? 'ทุก Mood' : criteria.mood,
        occasion: criteria.occasion || 'สุ่มทั่วไป',
        weather: criteria.weather === 'all' ? 'ทุกสภาพอากาศ' : criteria.weather,
        items: [randomPick(topPool), randomPick(bottomPool), randomPick(shoesPool)],
        createdAt: new Date().toISOString()
      };
    }

    function renderOutfit(outfit) {
      currentOutfit = outfit;
      generateEmpty.classList.add('hidden');
      outfitResult.classList.remove('hidden');
      outfitMeta.textContent = `Mood: ${outfit.mood} · Occasion: ${outfit.occasion} · Weather: ${outfit.weather}`;
      outfitGrid.innerHTML = outfit.items.map((item) => `
        <article class="card outfit-card">
          <img src="${item.image}" alt="${item.name}" />
          <h3>${item.name}</h3>
          <p class="subtle">${item.mainCategory} · ${item.subCategory}</p>
          <div class="tag-row">
            <span class="tag">สี ${item.color}</span>
            <span class="tag">Comfort ${item.comfort}/5</span>
            <span class="tag">Confidence ${item.confidence}/5</span>
          </div>
          <p>${item.meaning || 'ไม่มีคำอธิบายเพิ่มเติม'}</p>
        </article>
      `).join('');
    }

    function handleBuild(criteria) {
      lastCriteria = criteria;
      const outfit = buildOutfit(criteria);
      if (!outfit) {
        App.showToast('ไม่พบข้อมูลเสื้อผ้าที่ตรงเงื่อนไขพอจะจัดชุดได้', 'error');
        return;
      }
      renderOutfit(outfit);
    }

    randomOutfitBtn.addEventListener('click', () => {
      handleBuild({
        mode: 'random',
        mood: randomMood.value,
        weather: document.getElementById('randomWeather').value
      });
    });

    suggestOutfitBtn.addEventListener('click', () => {
      handleBuild({
        mode: 'occasion',
        occasion: occasionSelect.value,
        mood: occasionMood.value,
        weather: document.getElementById('occasionWeather').value
      });
    });

    rerollBtn.addEventListener('click', () => {
      if (!lastCriteria) return;
      handleBuild(lastCriteria);
    });

    saveOutfitBtn.addEventListener('click', () => {
      if (!currentOutfit) return;
      storage.addOutfit({ ...currentOutfit, id: storage.makeId('outfit') });
      App.showToast(storage.getUser() ? 'บันทึกชุดและซิงก์ขึ้น cloud แล้ว' : 'บันทึกชุดลงเครื่องแล้ว');
    });

    shareOutfitBtn.addEventListener('click', () => {
      if (!currentOutfit) return;
      const text = `Closy Outfit\n${currentOutfit.items.map((item) => `${item.mainCategory}: ${item.name}`).join('\n')}\nMood: ${currentOutfit.mood}\nOccasion: ${currentOutfit.occasion}`;
      App.copyText(text);
    });
  });
})();
