(function () {
  const stateLabel = document.getElementById('current-state');
  const voterCounts = document.getElementById('voter-counts');
  const stateButtons = document.querySelectorAll('.state-btn');
  const resetBtn = document.getElementById('reset-btn');

  function pretty(round) {
    if (round === '1') return 'Round 1 (rate weirdness)';
    if (round === '2') return 'Round 2 (after reveal)';
    if (round === 'comparison') return 'Comparison';
    return round;
  }

  async function setRound(round) {
    await fetch('/api/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_round: round }),
    });
    refresh();
  }

  stateButtons.forEach((btn) => {
    btn.addEventListener('click', () => setRound(btn.dataset.round));
  });

  resetBtn.addEventListener('click', async () => {
    if (!confirm('Erase ALL votes? This cannot be undone.')) return;
    await fetch('/api/reset', { method: 'POST' });
    refresh();
  });

  async function refresh() {
    try {
      const [stateRes, countsRes] = await Promise.all([
        fetch('/api/state'),
        fetch('/api/voter_count'),
      ]);
      const state = await stateRes.json();
      const counts = await countsRes.json();
      stateLabel.textContent = pretty(state.current_round);
      stateButtons.forEach((b) => {
        b.classList.toggle('active', b.dataset.round === state.current_round);
      });
      voterCounts.textContent =
        `${counts.round1} voter${counts.round1 === 1 ? '' : 's'} in Round 1, ` +
        `${counts.round2} voter${counts.round2 === 1 ? '' : 's'} in Round 2`;
    } catch (e) {
      console.error('refresh failed', e);
    }
  }

  refresh();
  setInterval(refresh, 2000);
})();
