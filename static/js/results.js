(function () {
  const root = document.getElementById('projector-root');

  function pct(avg) {
    return Math.max(0, Math.min(100, (avg / 5) * 100));
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function findResult(arr, itemId) {
    return arr.find((r) => r.item_id === itemId);
  }

  function renderRound1(state, results) {
    const item = state.current_item;
    if (!item) {
      root.innerHTML = '<p class="loading">No item selected.</p>';
      return;
    }
    const r = findResult(results.round1, item.id);
    const avg = r ? r.avg : 0;
    const count = r ? r.count : 0;
    root.innerHTML = `
      <div class="single-stage">
        <p class="phase-label">Round 1 — first impressions  ·  Item ${state.current_item_index} of ${state.total_items}</p>
        <h1 class="stage-title">${escapeHtml(item.title)}</h1>
        <div class="stage-grid">
          <div class="stage-image">
            ${item.image_url ? `<img src="${escapeHtml(item.image_url)}" alt="">` : ''}
          </div>
          <div class="stage-side">
            <p class="stage-ref">${escapeHtml(item.scripture_ref)}</p>
            <blockquote class="stage-quote">${escapeHtml(item.scripture_text)}</blockquote>
            <div class="meter-block">
              <div class="meter-labels">
                <span>1 — totally normal</span>
                <span>5 — what on earth</span>
              </div>
              <div class="meter-track">
                <div class="meter-fill r1" style="width: ${pct(avg)}%"></div>
              </div>
              <p class="meter-readout">
                <span class="big-num">${avg ? avg.toFixed(2) : '—'}</span>
                <span class="meter-meta">${count} vote${count === 1 ? '' : 's'}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderRound2(state, results) {
    const item = state.current_item;
    if (!item) {
      root.innerHTML = '<p class="loading">No item selected.</p>';
      return;
    }
    const r1 = findResult(results.round1, item.id);
    const r2 = findResult(results.round2, item.id);
    const a1 = r1 ? r1.avg : 0;
    const a2 = r2 ? r2.avg : 0;
    const c2 = r2 ? r2.count : 0;
    const diff = a2 - a1;
    let arrowCls = 'shift-same';
    let arrow = '=';
    if (diff < -0.05) { arrowCls = 'shift-down'; arrow = '↓'; }
    else if (diff > 0.05) { arrowCls = 'shift-up'; arrow = '↑'; }
    const shiftText = (r1 && r2) ? (diff > 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)) : '—';

    root.innerHTML = `
      <div class="single-stage">
        <p class="phase-label">Round 2 — after the meaning  ·  Item ${state.current_item_index} of ${state.total_items}</p>
        <h1 class="stage-title">
          ${escapeHtml(item.title)}
          <span class="shift-arrow ${arrowCls}">${arrow} ${shiftText}</span>
        </h1>
        <div class="stage-grid">
          <div class="stage-image">
            ${item.image_url ? `<img src="${escapeHtml(item.image_url)}" alt="">` : ''}
          </div>
          <div class="stage-side">
            <p class="stage-ref">${escapeHtml(item.scripture_ref)}</p>
            <blockquote class="stage-quote">${escapeHtml(item.scripture_text)}</blockquote>
            <p class="stage-meaning">${escapeHtml(item.meaning)}</p>
            <div class="compare-block">
              <div class="compare-line">
                <span class="compare-label">Round 1 (first look)</span>
                <div class="meter-track small">
                  <div class="meter-fill r1" style="width: ${pct(a1)}%"></div>
                </div>
                <span class="compare-num">${a1 ? a1.toFixed(2) : '—'}</span>
              </div>
              <div class="compare-line">
                <span class="compare-label">Round 2 (after meaning)</span>
                <div class="meter-track small">
                  <div class="meter-fill r2" style="width: ${pct(a2)}%"></div>
                </div>
                <span class="compare-num">${a2 ? a2.toFixed(2) : '—'}</span>
              </div>
              <p class="meter-meta">${c2} vote${c2 === 1 ? '' : 's'} in Round 2</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderDone(state, items, results) {
    const rows = items.map((item) => {
      const r1 = findResult(results.round1, item.id);
      const r2 = findResult(results.round2, item.id);
      const a1 = r1 ? r1.avg : 0;
      const a2 = r2 ? r2.avg : 0;
      const diff = a2 - a1;
      let arrowCls = 'shift-same';
      let arrow = '=';
      if (diff < -0.05) { arrowCls = 'shift-down'; arrow = '↓'; }
      else if (diff > 0.05) { arrowCls = 'shift-up'; arrow = '↑'; }
      const shiftText = (r1 && r2) ? (diff > 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)) : '—';

      return `
        <div class="done-row">
          <div class="done-title">
            <span>${escapeHtml(item.title)}</span>
            <span class="shift-arrow ${arrowCls}">${arrow} ${shiftText}</span>
          </div>
          <div class="done-bars">
            <div class="bar-mini-row">
              <span class="bar-mini-label">R1</span>
              <div class="meter-track small">
                <div class="meter-fill r1" style="width: ${pct(a1)}%"></div>
              </div>
              <span class="bar-mini-num">${a1 ? a1.toFixed(2) : '—'}</span>
            </div>
            <div class="bar-mini-row">
              <span class="bar-mini-label">R2</span>
              <div class="meter-track small">
                <div class="meter-fill r2" style="width: ${pct(a2)}%"></div>
              </div>
              <span class="bar-mini-num">${a2 ? a2.toFixed(2) : '—'}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    root.innerHTML = `
      <div class="done-stage">
        <h1>Before vs. after</h1>
        <p class="phase-label">All ${items.length} items, Round 1 → Round 2</p>
        ${rows}
      </div>
    `;
  }

  let cachedItems = null;
  async function getItems() {
    if (cachedItems) return cachedItems;
    const res = await fetch('/api/items');
    const data = await res.json();
    cachedItems = data.items;
    return cachedItems;
  }

  async function tick() {
    try {
      const [stateRes, resultsRes] = await Promise.all([
        fetch('/api/state'),
        fetch('/api/results'),
      ]);
      const state = await stateRes.json();
      const results = await resultsRes.json();

      if (state.phase === 'round1') {
        renderRound1(state, results);
      } else if (state.phase === 'round2') {
        renderRound2(state, results);
      } else {
        const items = await getItems();
        renderDone(state, items, results);
      }
    } catch (e) {
      console.error('tick failed', e);
    }
  }

  tick();
  setInterval(tick, 2000);
})();
