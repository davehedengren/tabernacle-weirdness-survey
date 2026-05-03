(function () {
  const container = document.getElementById('results-container');
  const subtitle = document.getElementById('projector-subtitle');

  let items = [];

  async function loadItems() {
    const res = await fetch('/api/items');
    const data = await res.json();
    items = data.items;
    return data.current_round;
  }

  function pct(avg) {
    return Math.max(0, Math.min(100, (avg / 5) * 100));
  }

  function findResult(arr, itemId) {
    return arr.find((r) => r.item_id === itemId);
  }

  function renderSingleRound(roundNum, results) {
    const arr = roundNum === '1' ? results.round1 : results.round2;
    const html = items.map((item) => {
      const r = findResult(arr, item.id);
      const avg = r ? r.avg : 0;
      const count = r ? r.count : 0;
      return `
        <div class="bar-row">
          <div class="item-label">${escapeHtml(item.title)}</div>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${pct(avg)}%">${avg ? avg.toFixed(2) : '—'}</div>
          </div>
          <div class="bar-meta">${count} vote${count === 1 ? '' : 's'}</div>
        </div>
      `;
    }).join('');
    container.innerHTML = html;
  }

  function renderComparison(results) {
    const html = items.map((item) => {
      const r1 = findResult(results.round1, item.id);
      const r2 = findResult(results.round2, item.id);
      const a1 = r1 ? r1.avg : 0;
      const a2 = r2 ? r2.avg : 0;
      const diff = a2 - a1;
      let arrowCls = 'shift-same';
      let arrow = '=';
      if (diff < -0.05) { arrowCls = 'shift-down'; arrow = '←'; }
      else if (diff > 0.05) { arrowCls = 'shift-up'; arrow = '→'; }
      const shiftText = (r1 && r2) ? (diff > 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)) : '—';

      return `
        <div class="compare-row">
          <div class="item-label">
            <span>${escapeHtml(item.title)}</span>
            <span class="shift-arrow ${arrowCls}">${arrow} ${shiftText}</span>
          </div>
          <div class="compare-bars">
            <div class="label-cell">R1</div>
            <div class="bar-track">
              <div class="bar-fill r1-fill" style="width: ${pct(a1)}%">${a1 ? a1.toFixed(2) : '—'}</div>
            </div>
            <div class="label-cell">R2</div>
            <div class="bar-track">
              <div class="bar-fill r2-fill" style="width: ${pct(a2)}%">${a2 ? a2.toFixed(2) : '—'}</div>
            </div>
          </div>
        </div>
      `;
    }).join('');
    container.innerHTML = html;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  async function tick() {
    try {
      const [stateRes, resultsRes] = await Promise.all([
        fetch('/api/state'),
        fetch('/api/results'),
      ]);
      const state = await stateRes.json();
      const results = await resultsRes.json();
      const round = state.current_round;

      if (!items.length) await loadItems();

      if (round === '1') {
        subtitle.textContent = 'Round 1 — first impressions';
        renderSingleRound('1', results);
      } else if (round === '2') {
        subtitle.textContent = 'Round 2 — after the meaning';
        renderSingleRound('2', results);
      } else {
        subtitle.textContent = 'Before vs. After';
        renderComparison(results);
      }
    } catch (e) {
      console.error('tick failed', e);
    }
  }

  tick();
  setInterval(tick, 2000);
})();
