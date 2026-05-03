(function () {
  const root = document.getElementById('projector-root');

  // ----- Control bar (merged admin) -----
  const cbPhase = document.getElementById('cb-phase');
  const cbProgress = document.getElementById('cb-progress');
  const cbCounts = document.getElementById('cb-counts');
  const cbNext = document.getElementById('cb-next');
  const cbPrev = document.getElementById('cb-prev');
  const cbQr = document.getElementById('cb-qr');
  const cbReset = document.getElementById('cb-reset');
  const qrOverlay = document.getElementById('qr-overlay');
  const qrClose = document.getElementById('qr-close');

  function phaseLabel(phase, mode) {
    if (phase === 'round1') return mode === 'summary' ? 'R1 · summary' : 'R1 · voting';
    if (phase === 'round2') return mode === 'summary' ? 'R2 · summary' : 'R2 · voting';
    return 'DONE';
  }
  function nextLabel(state) {
    if (state.phase === 'done') return 'At end';
    if (state.mode === 'voting') return 'Close voting →';
    if (state.phase === 'round1') return 'Reveal meaning →';
    if (state.phase === 'round2') {
      if (state.current_item_index < state.total_items) return 'Next item →';
      return 'Final summary →';
    }
    return 'Next →';
  }

  function updateControlBar(state, counts) {
    cbPhase.textContent = phaseLabel(state.phase, state.mode);
    cbPhase.className = `cb-phase phase-${state.phase} mode-${state.mode}`;
    if (state.current_item) {
      cbProgress.textContent = `${state.current_item.title} (${state.current_item_index}/${state.total_items})`;
    } else {
      cbProgress.textContent = `${state.total_items} items total`;
    }
    const inVote = (state.phase === 'round1' || state.phase === 'round2') && state.mode === 'voting';
    cbCounts.textContent = inVote
      ? `${counts.current_item} on this · R1 ${counts.round1_total} · R2 ${counts.round2_total}`
      : `R1 ${counts.round1_total} · R2 ${counts.round2_total}`;
    cbNext.textContent = nextLabel(state);
    cbNext.disabled = state.phase === 'done';
  }

  async function api(method, url, body) {
    const opts = { method };
    if (body !== undefined) {
      opts.headers = { 'Content-Type': 'application/json' };
      opts.body = JSON.stringify(body);
    }
    return fetch(url, opts);
  }

  cbNext.addEventListener('click', async () => { await api('POST', '/api/next'); tick(); });
  cbPrev.addEventListener('click', async () => { await api('POST', '/api/prev'); tick(); });
  cbReset.addEventListener('click', async () => {
    if (!confirm('Erase ALL votes and return to Round 1, item 1, voting? This cannot be undone.')) return;
    await api('POST', '/api/reset');
    tick();
  });
  cbQr.addEventListener('click', () => { qrOverlay.hidden = false; });
  qrClose.addEventListener('click', () => { qrOverlay.hidden = true; });
  qrOverlay.addEventListener('click', (e) => {
    if (e.target === qrOverlay) qrOverlay.hidden = true;
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !qrOverlay.hidden) qrOverlay.hidden = true;
    // Spacebar / right arrow = next; left arrow = back. Useful with a
    // presentation remote.
    if (qrOverlay.hidden && (e.key === ' ' || e.key === 'ArrowRight' || e.key === 'PageDown')) {
      e.preventDefault();
      cbNext.click();
    }
    if (qrOverlay.hidden && (e.key === 'ArrowLeft' || e.key === 'PageUp')) {
      e.preventDefault();
      cbPrev.click();
    }
  });

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

  function histogramMarkup(roundClass) {
    /* The five empty bar cells. Heights and counts get filled in by
       updateLiveData() so the DOM doesn't churn between polls. */
    return `
      <div class="histogram" data-round="${roundClass}">
        ${[1, 2, 3, 4, 5].map((n) => `
          <div class="hist-cell">
            <span class="hist-count">0</span>
            <div class="hist-bar ${roundClass}" style="height: 0%"></div>
            <span class="hist-label">${n}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  function votingHiddenMarkup() {
    /* Shown during VOTING mode in place of the histogram so early votes
       don't anchor later voters. Just a live-updating count of how many
       phones have submitted so the teacher can pace the room. */
    return `
      <section class="hist-card hidden-results">
        <p class="meter-prompt">Voting in progress</p>
        <p class="hidden-headline">
          <span class="big-num" data-vote-count>0</span>
          <span class="hidden-suffix" data-vote-suffix>votes received</span>
        </p>
        <p class="meter-meta">Results hidden until voting closes.</p>
      </section>
    `;
  }

  // ----- Initial scaffolds (rendered once per (item, phase, mode)) -----

  function scaffoldRound1(state, isSummary) {
    const item = state.current_item;
    const phaseLine = isSummary
      ? `Round 1 summary · item ${state.current_item_index} of ${state.total_items}`
      : `Round 1 · first impressions · item ${state.current_item_index} of ${state.total_items}`;
    const resultCard = isSummary ? `
      <section class="hist-card">
        <div class="hist-head">
          <p class="meter-prompt">How weird does this feel?</p>
          <div class="hist-mean">
            <span class="hist-mean-num" data-mean>—</span>
            <span class="hist-mean-label" data-meanlabel>avg · 0 votes</span>
          </div>
        </div>
        ${histogramMarkup('r1')}
        <p class="meter-meta">voting closed · discuss → then click Next</p>
      </section>
    ` : votingHiddenMarkup();

    return `
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
            ${resultCard}
          </div>
        </div>
      </article>
    `;
  }

  function scaffoldRound2(state, isSummary) {
    const item = state.current_item;
    const phaseLine = isSummary
      ? `Round 2 summary · item ${state.current_item_index} of ${state.total_items}`
      : `Round 2 · after the meaning · item ${state.current_item_index} of ${state.total_items}`;
    // Shift indicator (R1 -> R2 arrow) is only meaningful once voting has
    // closed; hiding it during voting prevents anchoring on the live diff.
    const titleShift = isSummary ? ' <span data-shift>—</span>' : '';
    const resultCard = isSummary ? `
      <section class="hist-card">
        <p class="meter-prompt">Distribution — before vs. after</p>
        <div class="hist-stack">
          <div class="hist-row">
            <p class="hist-row-label">Round 1 · avg <span data-r1-avg>—</span> · <span data-r1-count>0 votes</span></p>
            ${histogramMarkup('r1')}
          </div>
          <div class="hist-row">
            <p class="hist-row-label">Round 2 · avg <span data-r2-avg>—</span> · <span data-r2-count>0 votes</span></p>
            ${histogramMarkup('r2')}
          </div>
        </div>
        <p class="meter-meta">voting closed · discuss → then click Next</p>
      </section>
    ` : votingHiddenMarkup();

    return `
      <article class="stage ${isSummary ? 'stage-summary' : ''}">
        <p class="phase-label">${phaseLine}</p>
        <h1 class="stage-title">${escapeHtml(item.title)}${titleShift}</h1>
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
            ${resultCard}
          </div>
        </div>
      </article>
    `;
  }

  function scaffoldDone(state, items) {
    const rows = items.map((item) => `
      <div class="done-row" data-item-id="${item.id}">
        <div class="done-title">
          <span>${escapeHtml(item.title)}</span><span data-shift>—</span>
        </div>
        <div class="done-grid">
          <div class="done-col">
            <p class="done-col-label">R1 · <span data-r1-avg>—</span></p>
            ${histogramMarkup('r1')}
          </div>
          <div class="done-col">
            <p class="done-col-label">R2 · <span data-r2-avg>—</span></p>
            ${histogramMarkup('r2')}
          </div>
        </div>
      </div>
    `).join('');

    return `
      <article class="done-stage">
        <p class="phase-label">All ${items.length} items · Round 1 → Round 2</p>
        <h1 class="stage-title">Before vs. after</h1>
        ${rows}
      </article>
    `;
  }

  // ----- Live data updaters (run on every poll, no DOM teardown) -----

  function updateHistogram(scope, roundClass, dist) {
    const container = scope.querySelector(`.histogram[data-round="${roundClass}"]`);
    if (!container) return;
    const d = dist || [0, 0, 0, 0, 0];
    const max = Math.max(1, ...d);
    const cells = container.querySelectorAll('.hist-cell');
    cells.forEach((cell, i) => {
      const count = d[i] || 0;
      const h = (count / max) * 100;
      const bar = cell.querySelector('.hist-bar');
      const countEl = cell.querySelector('.hist-count');
      if (bar && bar.style.height !== `${h}%`) bar.style.height = `${h}%`;
      if (countEl && countEl.textContent !== String(count)) countEl.textContent = count;
    });
  }

  function setText(el, value) {
    if (el && el.textContent !== value) el.textContent = value;
  }

  function updateRound1(state, results) {
    const item = state.current_item;
    const r = findResult(results.round1, item.id);
    const count = r ? r.count : 0;
    if (state.mode === 'voting') {
      // Only update the live vote counter; results stay hidden.
      setText(root.querySelector('[data-vote-count]'), count);
      setText(root.querySelector('[data-vote-suffix]'),
              count === 1 ? 'vote received' : 'votes received');
      return;
    }
    // Summary mode — reveal the histogram + mean.
    const avg = r ? r.avg : 0;
    const dist = r ? r.dist : null;
    setText(root.querySelector('[data-mean]'), avg ? avg.toFixed(2) : '—');
    setText(root.querySelector('[data-meanlabel]'), `avg · ${count} vote${count === 1 ? '' : 's'}`);
    updateHistogram(root, 'r1', dist);
  }

  function updateRound2(state, results) {
    const item = state.current_item;
    const r2 = findResult(results.round2, item.id);
    const c2 = r2 ? r2.count : 0;
    if (state.mode === 'voting') {
      // Voting in progress — only show how many have re-voted.
      setText(root.querySelector('[data-vote-count]'), c2);
      setText(root.querySelector('[data-vote-suffix]'),
              c2 === 1 ? 'vote received' : 'votes received');
      return;
    }
    // Summary mode — reveal both histograms, both means, and the shift.
    const r1 = findResult(results.round1, item.id);
    const a1 = r1 ? r1.avg : 0;
    const a2 = r2 ? r2.avg : 0;
    const c1 = r1 ? r1.count : 0;
    setText(root.querySelector('[data-r1-avg]'), a1 ? a1.toFixed(2) : '—');
    setText(root.querySelector('[data-r1-count]'), `${c1} vote${c1 === 1 ? '' : 's'}`);
    setText(root.querySelector('[data-r2-avg]'), a2 ? a2.toFixed(2) : '—');
    setText(root.querySelector('[data-r2-count]'), `${c2} vote${c2 === 1 ? '' : 's'}`);
    updateHistogram(root, 'r1', r1 ? r1.dist : null);
    updateHistogram(root, 'r2', r2 ? r2.dist : null);
    const shiftEl = root.querySelector('[data-shift]');
    if (shiftEl) {
      const next = shiftMarkup(a1, a2, !!(r1 && r2));
      if (shiftEl.innerHTML !== next) shiftEl.innerHTML = next;
    }
  }

  function updateDone(items, results) {
    items.forEach((item) => {
      const row = root.querySelector(`.done-row[data-item-id="${item.id}"]`);
      if (!row) return;
      const r1 = findResult(results.round1, item.id);
      const r2 = findResult(results.round2, item.id);
      const a1 = r1 ? r1.avg : 0;
      const a2 = r2 ? r2.avg : 0;
      setText(row.querySelector('[data-r1-avg]'), a1 ? a1.toFixed(2) : '—');
      setText(row.querySelector('[data-r2-avg]'), a2 ? a2.toFixed(2) : '—');
      const shiftEl = row.querySelector('[data-shift]');
      if (shiftEl) {
        const next = shiftMarkup(a1, a2, !!(r1 && r2));
        if (shiftEl.innerHTML !== next) shiftEl.innerHTML = next;
      }
      updateHistogram(row, 'r1', r1 ? r1.dist : null);
      updateHistogram(row, 'r2', r2 ? r2.dist : null);
    });
  }

  // ----- Tick: scaffold once per (key), update data every time -----

  let lastKey = null;
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
      const [stateRes, resultsRes, countsRes] = await Promise.all([
        fetch('/api/state'),
        fetch('/api/results'),
        fetch('/api/voter_count'),
      ]);
      const state = await stateRes.json();
      const results = await resultsRes.json();
      const counts = await countsRes.json();
      updateControlBar(state, counts);

      // Build a stable key for the *layout*. Anything that requires
      // tearing down the DOM (different item, different phase, different
      // mode, switching to done) belongs here.
      const itemPart = state.current_item ? state.current_item.id : 'none';
      const key = `${state.phase}:${itemPart}:${state.mode}`;

      if (state.phase === 'done') {
        const items = await getItems();
        if (lastKey !== 'done') {
          root.innerHTML = scaffoldDone(state, items);
          lastKey = 'done';
        }
        updateDone(items, results);
        return;
      }

      if (!state.current_item) {
        if (lastKey !== 'waiting') {
          root.innerHTML = '<p class="loading">No item selected.</p>';
          lastKey = 'waiting';
        }
        return;
      }

      const isSummary = state.mode === 'summary';

      if (key !== lastKey) {
        if (state.phase === 'round1') {
          root.innerHTML = scaffoldRound1(state, isSummary);
        } else {
          root.innerHTML = scaffoldRound2(state, isSummary);
        }
        lastKey = key;
      }

      if (state.phase === 'round1') updateRound1(state, results);
      else if (state.phase === 'round2') updateRound2(state, results);
    } catch (e) {
      console.error('tick failed', e);
    }
  }

  tick();
  setInterval(tick, 2000);
})();
