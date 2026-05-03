(function () {
  const STORAGE_KEY = 'weirdness_voter_uuid';
  let voterUuid = localStorage.getItem(STORAGE_KEY);
  if (!voterUuid) {
    voterUuid = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, voterUuid);
  }

  const container = document.getElementById('items-container');
  const banner = document.getElementById('round-banner');
  const tpl = document.getElementById('item-template');

  // votes for the *current* round, keyed by item_id
  let currentRound = null;
  let items = [];
  let myVotes = {};

  function roundLabel(r) {
    if (r === '1') return 'Round 1: Rate the weirdness (1 = totally normal, 5 = what on earth)';
    if (r === '2') return "Round 2: Now that you know what it meant, rate it again";
    if (r === 'comparison') return 'Voting closed';
    return '';
  }

  function renderClosed() {
    container.innerHTML = '<p class="closed-msg">Voting closed &mdash; look at the screen.</p>';
  }

  function renderItems() {
    container.innerHTML = '';
    items.forEach((item) => {
      const node = tpl.content.cloneNode(true);
      const article = node.querySelector('.item');
      article.dataset.itemId = item.id;
      node.querySelector('.item-title').textContent = item.title;
      const img = node.querySelector('.item-image');
      if (item.image_url) {
        img.src = item.image_url;
        img.alt = item.title;
      } else {
        img.remove();
      }
      node.querySelector('.scripture-ref').textContent = item.scripture_ref;
      node.querySelector('.scripture-text').textContent = item.scripture_text;

      const meaningEl = node.querySelector('.meaning');
      if (currentRound === '2' && item.meaning) {
        meaningEl.textContent = item.meaning;
        meaningEl.hidden = false;
      }

      const buttons = node.querySelectorAll('.rating-btn');
      buttons.forEach((btn) => {
        btn.addEventListener('click', () => handleVote(item.id, parseInt(btn.dataset.rating, 10)));
      });

      container.appendChild(node);
    });
    applyVoteUI();
  }

  function applyVoteUI() {
    document.querySelectorAll('.item').forEach((article) => {
      const itemId = parseInt(article.dataset.itemId, 10);
      const rating = myVotes[itemId];
      const mark = article.querySelector('.voted-mark');
      mark.hidden = !rating;
      article.querySelectorAll('.rating-btn').forEach((b) => {
        b.classList.toggle('selected', parseInt(b.dataset.rating, 10) === rating);
      });
    });
  }

  async function handleVote(itemId, rating) {
    if (currentRound !== '1' && currentRound !== '2') return;
    myVotes[itemId] = rating;
    applyVoteUI();
    try {
      await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voter_uuid: voterUuid, item_id: itemId, rating: rating }),
      });
    } catch (e) {
      console.error('vote failed', e);
    }
  }

  async function loadItems() {
    const res = await fetch('/api/items');
    const data = await res.json();
    items = data.items;
    return data.current_round;
  }

  async function loadStateAndMaybeRender(initial) {
    let newRound;
    if (initial) {
      newRound = await loadItems();
    } else {
      const res = await fetch('/api/state');
      const data = await res.json();
      newRound = data.current_round;
    }

    if (newRound !== currentRound) {
      currentRound = newRound;
      myVotes = {}; // fresh round = fresh local vote tracking
      banner.textContent = roundLabel(currentRound);
      if (currentRound === 'comparison') {
        renderClosed();
      } else {
        // ensure items are loaded
        if (!items.length) await loadItems();
        renderItems();
      }
    }
  }

  loadStateAndMaybeRender(true);
  setInterval(() => loadStateAndMaybeRender(false), 3000);
})();
