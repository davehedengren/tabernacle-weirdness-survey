(function () {
  const STORAGE_KEY = 'weirdness_voter_uuid';
  let voterUuid = localStorage.getItem(STORAGE_KEY);
  if (!voterUuid) {
    voterUuid = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, voterUuid);
  }

  const container = document.getElementById('single-item');
  const banner = document.getElementById('round-banner');
  const itemTpl = document.getElementById('item-template');
  const doneTpl = document.getElementById('done-template');

  // Track which item+phase the voter has just locally voted on, so we can
  // show "✓ Voted X" without round-tripping. Keyed by `${phase}:${itemId}`.
  const localVotes = {};

  // Last rendered (phase, itemId) so we don't redraw every poll.
  let renderedKey = null;

  function bannerText(phase, idx, total) {
    if (phase === 'round1') {
      return `Round 1 — first impressions  ·  Item ${idx} of ${total}`;
    }
    if (phase === 'round2') {
      return `Round 2 — after the meaning  ·  Item ${idx} of ${total}`;
    }
    return 'Voting complete';
  }

  function renderDone() {
    container.innerHTML = '';
    container.appendChild(doneTpl.content.cloneNode(true));
  }

  function renderItem(phase, idx, total, item) {
    container.innerHTML = '';
    const node = itemTpl.content.cloneNode(true);
    const article = node.querySelector('.item');
    article.dataset.itemId = item.id;
    article.dataset.phase = phase;

    node.querySelector('.item-progress').textContent =
      `${phase === 'round1' ? 'Round 1' : 'Round 2'} — Item ${idx} of ${total}`;
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

    const meaningBlock = node.querySelector('.meaning-block');
    if (phase === 'round2' && item.meaning) {
      meaningBlock.hidden = false;
      node.querySelector('.meaning').textContent = item.meaning;
    }

    const buttons = node.querySelectorAll('.rating-btn');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => handleVote(phase, item.id, parseInt(btn.dataset.rating, 10)));
    });

    container.appendChild(node);
    applyVoteUI(phase, item.id);
  }

  function applyVoteUI(phase, itemId) {
    const article = container.querySelector('.item');
    if (!article) return;
    const rating = localVotes[`${phase}:${itemId}`];
    const status = article.querySelector('.vote-status');
    if (rating) {
      status.hidden = false;
      status.textContent = `✓ You voted ${rating}. Tap a different number to change. Waiting for the next item...`;
    } else {
      status.hidden = true;
    }
    article.querySelectorAll('.rating-btn').forEach((b) => {
      b.classList.toggle('selected', parseInt(b.dataset.rating, 10) === rating);
    });
  }

  async function handleVote(phase, itemId, rating) {
    if (phase !== 'round1' && phase !== 'round2') return;
    localVotes[`${phase}:${itemId}`] = rating;
    applyVoteUI(phase, itemId);
    try {
      await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voter_uuid: voterUuid, rating: rating }),
      });
    } catch (e) {
      console.error('vote failed', e);
    }
  }

  async function tick() {
    try {
      const res = await fetch('/api/state');
      const state = await res.json();
      banner.textContent = bannerText(state.phase, state.current_item_index, state.total_items);

      if (state.phase === 'done') {
        if (renderedKey !== 'done') {
          renderedKey = 'done';
          renderDone();
        }
        return;
      }

      const item = state.current_item;
      if (!item) {
        container.innerHTML = '<p class="loading">Waiting for the teacher...</p>';
        renderedKey = 'waiting';
        return;
      }
      const key = `${state.phase}:${item.id}`;
      if (renderedKey !== key) {
        renderedKey = key;
        renderItem(state.phase, state.current_item_index, state.total_items, item);
      }
    } catch (e) {
      console.error('tick failed', e);
    }
  }

  tick();
  setInterval(tick, 2500);
})();
