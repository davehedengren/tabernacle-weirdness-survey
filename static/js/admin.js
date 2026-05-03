(function () {
  const phaseEl = document.getElementById('state-phase');
  const itemEl = document.getElementById('state-item');
  const progressEl = document.getElementById('state-progress');
  const nextPreview = document.getElementById('next-preview');
  const voterCounts = document.getElementById('voter-counts');
  const nextBtn = document.getElementById('next-btn');
  const prevBtn = document.getElementById('prev-btn');
  const resetBtn = document.getElementById('reset-btn');
  const jumpPhase = document.getElementById('jump-phase');
  const jumpIndex = document.getElementById('jump-index');
  const jumpBtn = document.getElementById('jump-btn');

  let lastState = null;

  function phaseLabel(p) {
    if (p === 'round1') return 'ROUND 1 — first impressions';
    if (p === 'round2') return 'ROUND 2 — after the meaning';
    return 'DONE — show comparison';
  }

  function previewNext(state) {
    if (state.phase === 'round1') {
      if (state.current_item_index < state.total_items) {
        return `Next → Round 1, Item ${state.current_item_index + 1}`;
      }
      return `Next → Round 2, Item 1 (start the reveal)`;
    }
    if (state.phase === 'round2') {
      if (state.current_item_index < state.total_items) {
        return `Next → Round 2, Item ${state.current_item_index + 1}`;
      }
      return `Next → Done (full comparison)`;
    }
    return `(at the end — Back to revisit)`;
  }

  async function refresh() {
    try {
      const [stateRes, countsRes] = await Promise.all([
        fetch('/api/state'),
        fetch('/api/voter_count'),
      ]);
      const state = await stateRes.json();
      const counts = await countsRes.json();
      lastState = state;

      phaseEl.textContent = phaseLabel(state.phase);
      phaseEl.className = `state-phase phase-${state.phase}`;

      if (state.current_item) {
        itemEl.textContent = state.current_item.title;
        progressEl.textContent =
          `Item ${state.current_item_index} of ${state.total_items}`;
      } else {
        itemEl.textContent = '(no item)';
        progressEl.textContent = `(${state.total_items} items total)`;
      }

      nextPreview.textContent = previewNext(state);

      const inVote = state.phase === 'round1' || state.phase === 'round2';
      voterCounts.textContent =
        inVote
          ? `${counts.current_item} vote${counts.current_item === 1 ? '' : 's'} on this item  ·  ${counts.round1_total} unique in R1, ${counts.round2_total} in R2`
          : `${counts.round1_total} unique in R1, ${counts.round2_total} in R2`;
    } catch (e) {
      console.error('refresh failed', e);
    }
  }

  async function advance(direction) {
    const url = direction === 'next' ? '/api/next' : '/api/prev';
    await fetch(url, { method: 'POST' });
    refresh();
  }

  nextBtn.addEventListener('click', () => advance('next'));
  prevBtn.addEventListener('click', () => advance('prev'));

  jumpBtn.addEventListener('click', async () => {
    const phase = jumpPhase.value;
    const idx = parseInt(jumpIndex.value, 10) || 0;
    await fetch('/api/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phase: phase, current_item_index: idx }),
    });
    refresh();
  });

  resetBtn.addEventListener('click', async () => {
    if (!confirm('Erase ALL votes and return to Round 1, Item 1? This cannot be undone.')) return;
    await fetch('/api/reset', { method: 'POST' });
    refresh();
  });

  refresh();
  setInterval(refresh, 2000);
})();
