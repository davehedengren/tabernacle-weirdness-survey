(function () {
  const root = document.getElementById('projector-root');

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

  function histogram(dist, roundClass) {
    /* Vertical 5-bar histogram. dist = [count_1..count_5]. roundClass =
       'r1' or 'r2' for color. Heights are normalized to the max count
       so the tallest bar always fills the column; if no votes, all
       columns sit at the floor with a "0" label. */
    const d = dist || [0, 0, 0, 0, 0];
    const max = Math.max(1, ...d);
    return `
      <div class="histogram">
        ${d.map((c, i) => {
          const h = (c / max) * 100;
          return `
            <div class="hist-cell">
              <span class="hist-count">${c}</span>
              <div class="hist-bar ${roundClass}" style="height: ${h}%"></div>
              <span class="hist-label">${i + 1}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function statsBlock(avg, count, label) {
    return `
      <div class="stats-line">
        <span class="stats-label">${label}</span>
        <span class="stats-mean">${avg ? avg.toFixed(2) : '—'}</span>
        <span class="stats-meta">avg · ${count} vote${count === 1 ? '' : 's'}</span>
      </div>
    `;
  }

  // ----- Round 1 -----

  function renderRound1(state, results, isSummary) {
    const item = state.current_item;
    const r = findResult(results.round1, item.id);
    const avg = r ? r.avg : 0;
    const count = r ? r.count : 0;
    const dist = r ? r.dist : null;
    const phaseLine = isSummary
      ? `Round 1 summary · item ${state.current_item_index} of ${state.total_items}`
      : `Round 1 · first impressions · item ${state.current_item_index} of ${state.total_items}`;
    const meterCaption = isSummary
      ? '<span class="meter-meta">voting closed</span>'
      : '<span class="meter-meta">live</span>';

    root.innerHTML = `
      <article class="stage ${isSummary ? 'stage-summary' : ''}">
        <p class="phase-label">${phaseLine}</p>
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
            <section class="hist-card">
              <div class="hist-head">
                <p class="meter-prompt">How weird does this feel?</p>
                <div class="hist-mean">
                  <span class="hist-mean-num">${avg ? avg.toFixed(2) : '—'}</span>
                  <span class="hist-mean-label">avg · ${count} vote${count === 1 ? '' : 's'}</span>
                </div>
              </div>
              ${histogram(dist, 'r1')}
              <p class="meter-meta">${isSummary ? 'voting closed · discuss → then click Next' : 'live'}</p>
            </section>
          </div>
        </div>
      </article>
    `;
  }

  // ----- Round 2 -----

  function renderRound2(state, results, isSummary) {
    const item = state.current_item;
    const r1 = findResult(results.round1, item.id);
    const r2 = findResult(results.round2, item.id);
    const a1 = r1 ? r1.avg : 0;
    const a2 = r2 ? r2.avg : 0;
    const c1 = r1 ? r1.count : 0;
    const c2 = r2 ? r2.count : 0;
    const d1 = r1 ? r1.dist : null;
    const d2 = r2 ? r2.dist : null;
    const shift = shiftMarkup(a1, a2, !!(r1 && r2));
    const phaseLine = isSummary
      ? `Round 2 summary · item ${state.current_item_index} of ${state.total_items}`
      : `Round 2 · after the meaning · item ${state.current_item_index} of ${state.total_items}`;

    root.innerHTML = `
      <article class="stage ${isSummary ? 'stage-summary' : ''}">
        <p class="phase-label">${phaseLine}</p>
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
            <section class="hist-card">
              <p class="meter-prompt">Distribution — before vs. after</p>
              <div class="hist-stack">
                <div class="hist-row">
                  <p class="hist-row-label">Round 1 · avg ${a1 ? a1.toFixed(2) : '—'} · ${c1} vote${c1 === 1 ? '' : 's'}</p>
                  ${histogram(d1, 'r1')}
                </div>
                <div class="hist-row">
                  <p class="hist-row-label">Round 2 · avg ${a2 ? a2.toFixed(2) : '—'} · ${c2} vote${c2 === 1 ? '' : 's'}</p>
                  ${histogram(d2, 'r2')}
                </div>
              </div>
              <p class="meter-meta">${isSummary ? 'voting closed · discuss → then click Next' : 'live'}</p>
            </section>
          </div>
        </div>
      </article>
    `;
  }

  // ----- Done -----

  function renderDone(state, items, results) {
    const rows = items.map((item) => {
      const r1 = findResult(results.round1, item.id);
      const r2 = findResult(results.round2, item.id);
      const a1 = r1 ? r1.avg : 0;
      const a2 = r2 ? r2.avg : 0;
      const d1 = r1 ? r1.dist : null;
      const d2 = r2 ? r2.dist : null;
      const shift = shiftMarkup(a1, a2, !!(r1 && r2));

      return `
        <div class="done-row">
          <div class="done-title">
            <span>${escapeHtml(item.title)}</span>${shift}
          </div>
          <div class="done-grid">
            <div class="done-col">
              <p class="done-col-label">R1 · ${a1 ? a1.toFixed(2) : '—'}</p>
              ${histogram(d1, 'r1')}
            </div>
            <div class="done-col">
              <p class="done-col-label">R2 · ${a2 ? a2.toFixed(2) : '—'}</p>
              ${histogram(d2, 'r2')}
            </div>
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

      if (state.phase === 'done') {
        const items = await getItems();
        renderDone(state, items, results);
        return;
      }
      if (!state.current_item) {
        root.innerHTML = '<p class="loading">No item selected.</p>';
        return;
      }
      const isSummary = state.mode === 'summary';
      if (state.phase === 'round1') renderRound1(state, results, isSummary);
      else if (state.phase === 'round2') renderRound2(state, results, isSummary);
    } catch (e) {
      console.error('tick failed', e);
    }
  }

  tick();
  setInterval(tick, 2000);
})();
