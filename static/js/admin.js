(function () {
  const phaseEl = document.getElementById('state-phase');
  const itemEl = document.getElementById('state-item');
  const progressEl = document.getElementById('state-progress');
  const nextBtn = document.getElementById('next-btn');
  const nextPreview = document.getElementById('next-preview');
  const voterCounts = document.getElementById('voter-counts');
  const prevBtn = document.getElementById('prev-btn');
  const resetBtn = document.getElementById('reset-btn');
  const jumpPhase = document.getElementById('jump-phase');
  const jumpIndex = document.getElementById('jump-index');
  const jumpMode = document.getElementById('jump-mode');
  const jumpBtn = document.getElementById('jump-btn');

  function phaseLabel(phase, mode) {
    if (phase === 'round1') {
      return mode === 'summary' ? 'ROUND 1 · summary' : 'ROUND 1 · voting';
    }
    if (phase === 'round2') {
      return mode === 'summary' ? 'ROUND 2 · summary' : 'ROUND 2 · voting';
    }
    return 'DONE · final comparison';
  }

  function nextLabel(state) {
    if (state.phase === 'done') return '(at the end)';
    if (state.mode === 'voting') return 'Close voting → show summary';
    if (state.phase === 'round1') {
      if (state.current_item_index < state.total_items) {
        return `Next → Round 1, item ${state.current_item_index + 1}`;
      }
      return 'Next → Round 2 (start the reveal)';
    }
    if (state.phase === 'round2') {
      if (state.current_item_index < state.total_items) {
        return `Next → Round 2, item ${state.current_item_index + 1}`;
      }
      return 'Next → Done (full comparison)';
    }
    return '';
  }

  async function refresh() {
    try {
      const [stateRes, countsRes] = await Promise.all([
        fetch('/api/state'),
        fetch('/api/voter_count'),
      ]);
      const state = await stateRes.json();
      const counts = await countsRes.json();

      phaseEl.textContent = phaseLabel(state.phase, state.mode);
      phaseEl.className = `state-phase phase-${state.phase} mode-${state.mode}`;

      if (state.current_item) {
        itemEl.textContent = state.current_item.title;
        progressEl.textContent =
          `Item ${state.current_item_index} of ${state.total_items}`;
      } else {
        itemEl.textContent = '(no item)';
        progressEl.textContent = `(${state.total_items} items total)`;
      }

      nextBtn.textContent = state.phase === 'done'
        ? 'At the end'
        : (state.mode === 'voting' ? 'Close voting' : 'Next →');
      nextPreview.textContent = nextLabel(state);

      const inVote = (state.phase === 'round1' || state.phase === 'round2') && state.mode === 'voting';
      voterCounts.textContent =
        inVote
          ? `${counts.current_item} vote${counts.current_item === 1 ? '' : 's'} on this item · ${counts.round1_total} unique in R1, ${counts.round2_total} in R2`
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
    const mode = jumpMode.value;
    await fetch('/api/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phase, current_item_index: idx, mode }),
    });
    refresh();
  });

  resetBtn.addEventListener('click', async () => {
    if (!confirm('Erase ALL votes and return to Round 1, item 1, voting? This cannot be undone.')) return;
    await fetch('/api/reset', { method: 'POST' });
    refresh();
  });

  refresh();
  setInterval(refresh, 2000);
})();
