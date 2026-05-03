(function () {
  const root = document.getElementById('projector-root');

  function pct(avg) {
    return Math.max(0, Math.min(100, (avg / 5) * 100));
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function findResult(arr, itemId) {
    return arr.find((r) => r.item_id === itemId);
  }

  function shiftMarkup(a1, a2, hasBoth) {
    const diff = a2 - a1;
    let cls = 'shift-same';
    let arrow = '=';
    if (diff < -0.05) { cls = 'shift-down'; arrow = '↓'; }
    else if (diff > 0.05) { cls = 'shift-up'; arrow = '↑'; }
    const text = hasBoth ? (diff > 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)) : '—';
    return `<span class="shift-arrow ${cls}">${arrow} ${text}</span>`;
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
      <article class="stage">
        <p class="phase-label">Round 1 · first impressions · item ${state.current_item_index} of ${state.total_items}</p>
        <h1 class="stage-title">${escapeHtml(item.title)}</h1>
        <div class="stage-grid">
          <figure class="stage-figure">
            ${item.image_url ? `<img src="${escapeHtml(item.image_url)}" alt="">` : ''}
          </figure>
          <div class="stage-side">
            <section class="stage-scripture">
              <p class="stage-eyebrow">Described in Exodus</p>
              <p class="stage-ref">${escapeHtml(item.scripture_ref)}</p>
              <blockquote class="stage-quote">${escapeHtml(item.scripture_text)}</blockquote>
            </section>
            <section class="stage-meter">
              <p class="meter-prompt">How weird does this feel?</p>
              <div class="meter-track">
                <div class="meter-fill r1" style="width: ${pct(avg)}%"></div>
              </div>
              <p class="meter-readout">
                <span class="big-num">${avg ? avg.toFixed(2) : '—'}</span>
                <span class="meter-meta">${count} vote${count === 1 ? '' : 's'}  ·  1 normal  ·  5 what on earth</span>
              </p>
            </section>
          </div>
        </div>
      </article>
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
    const shift = shiftMarkup(a1, a2, !!(r1 && r2));

    root.innerHTML = `
      <article class="stage">
        <p class="phase-label">Round 2 · after the meaning · item ${state.current_item_index} of ${state.total_items}</p>
        <h1 class="stage-title">${escapeHtml(item.title)} ${shift}</h1>
        <div class="stage-grid">
          <figure class="stage-figure">
            ${item.image_url ? `<img src="${escapeHtml(item.image_url)}" alt="">` : ''}
          </figure>
          <div class="stage-side">
            <section class="stage-scripture">
              <p class="stage-eyebrow">Described in Exodus</p>
              <p class="stage-ref">${escapeHtml(item.scripture_ref)}</p>
              <blockquote class="stage-quote">${escapeHtml(item.scripture_text)}</blockquote>
            </section>
            <section class="stage-context">
              <p class="stage-eyebrow context-eyebrow">What it represents</p>
              <p class="stage-ref">${escapeHtml(item.context_scripture_ref || '')}</p>
              <blockquote class="stage-quote">${escapeHtml(item.context_scripture_text || '')}</blockquote>
              ${item.meaning ? `<p class="meaning-line">${escapeHtml(item.meaning)}</p>` : ''}
            </section>
            <section class="stage-compare">
              <div class="compare-line">
                <span class="compare-label">Round 1</span>
                <div class="meter-track small">
                  <div class="meter-fill r1" style="width: ${pct(a1)}%"></div>
                </div>
                <span class="compare-num">${a1 ? a1.toFixed(2) : '—'}</span>
              </div>
              <div class="compare-line">
                <span class="compare-label">Round 2</span>
                <div class="meter-track small">
                  <div class="meter-fill r2" style="width: ${pct(a2)}%"></div>
                </div>
                <span class="compare-num">${a2 ? a2.toFixed(2) : '—'}</span>
              </div>
              <p class="meter-meta">${c2} vote${c2 === 1 ? '' : 's'} in Round 2</p>
            </section>
          </div>
        </div>
      </article>
    `;
  }

  function renderDone(state, items, results) {
    const rows = items.map((item) => {
      const r1 = findResult(results.round1, item.id);
      const r2 = findResult(results.round2, item.id);
      const a1 = r1 ? r1.avg : 0;
      const a2 = r2 ? r2.avg : 0;
      const shift = shiftMarkup(a1, a2, !!(r1 && r2));

      return `
        <div class="done-row">
          <div class="done-title">
            <span>${escapeHtml(item.title)}</span>${shift}
          </div>
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
      `;
    }).join('');

    root.innerHTML = `
      <article class="done-stage">
        <p class="phase-label">All ${items.length} items · Round 1 → Round 2</p>
        <h1 class="stage-title">Before vs. after</h1>
        ${rows}
      </article>
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
