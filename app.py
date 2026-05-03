import base64
import io

import qrcode
from flask import Flask, jsonify, render_template, request

import db

app = Flask(__name__)


# State model:
#   phase = 'round1' | 'round2' | 'done'
#   current_item_index = 1..N (1-based, matches items.display_order),
#                        or 0 when phase == 'done'
PHASES = ('round1', 'round2', 'done')


def _get_state():
    phase = db.get_state('phase', 'round1')
    if phase not in PHASES:
        phase = 'round1'
    try:
        idx = int(db.get_state('current_item_index', '1'))
    except (TypeError, ValueError):
        idx = 1
    return phase, idx


def _set_state(phase, idx):
    db.set_state('phase', phase)
    db.set_state('current_item_index', str(idx))


def _items():
    return db.get_items()


def _item_at(idx, items):
    """Return item dict at 1-based display-order index, or None."""
    if idx < 1:
        return None
    for it in items:
        if it['display_order'] == idx:
            return it
    return None


def _phase_to_round(phase):
    """Map phase to the votes.round string used in the DB."""
    if phase == 'round1':
        return '1'
    if phase == 'round2':
        return '2'
    return None


def _state_payload():
    items = _items()
    phase, idx = _get_state()
    total = len(items)
    item = _item_at(idx, items) if phase != 'done' else None
    return {
        'phase': phase,
        'current_item_index': idx if phase != 'done' else 0,
        'total_items': total,
        'current_item': item,
    }


@app.route('/')
def voter():
    return render_template('voter.html')


@app.route('/results')
def results():
    return render_template('results.html')


@app.route('/admin')
def admin():
    voter_url = request.host_url.rstrip('/') + '/'
    img = qrcode.make(voter_url)
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    qr_b64 = base64.b64encode(buf.getvalue()).decode('ascii')
    return render_template('admin.html', voter_url=voter_url, qr_b64=qr_b64)


@app.route('/api/items')
def api_items():
    items = _items()
    return jsonify({'items': items})


@app.route('/api/state', methods=['GET', 'POST'])
def api_state():
    if request.method == 'POST':
        data = request.get_json(force=True, silent=True) or {}
        phase = data.get('phase')
        idx = data.get('current_item_index')
        if phase not in PHASES:
            return jsonify({'error': 'invalid phase'}), 400
        try:
            idx = int(idx)
        except (TypeError, ValueError):
            return jsonify({'error': 'invalid index'}), 400
        _set_state(phase, idx)
    return jsonify(_state_payload())


@app.route('/api/next', methods=['POST'])
def api_next():
    items = _items()
    total = len(items)
    phase, idx = _get_state()
    if phase == 'round1':
        if idx < total:
            _set_state('round1', idx + 1)
        else:
            _set_state('round2', 1)
    elif phase == 'round2':
        if idx < total:
            _set_state('round2', idx + 1)
        else:
            _set_state('done', 0)
    # done: no-op
    return jsonify(_state_payload())


@app.route('/api/prev', methods=['POST'])
def api_prev():
    items = _items()
    total = len(items)
    phase, idx = _get_state()
    if phase == 'round1':
        if idx > 1:
            _set_state('round1', idx - 1)
        # at round1/1: stay
    elif phase == 'round2':
        if idx > 1:
            _set_state('round2', idx - 1)
        else:
            _set_state('round1', total)
    elif phase == 'done':
        _set_state('round2', total)
    return jsonify(_state_payload())


@app.route('/api/vote', methods=['POST'])
def api_vote():
    data = request.get_json(force=True, silent=True) or {}
    voter_uuid = data.get('voter_uuid')
    rating = data.get('rating')

    if not voter_uuid or rating is None:
        return jsonify({'error': 'missing fields'}), 400
    try:
        rating = int(rating)
    except (TypeError, ValueError):
        return jsonify({'error': 'invalid types'}), 400
    if rating < 1 or rating > 5:
        return jsonify({'error': 'rating out of range'}), 400

    items = _items()
    phase, idx = _get_state()
    round_str = _phase_to_round(phase)
    if round_str is None:
        return jsonify({'error': 'voting closed'}), 403
    item = _item_at(idx, items)
    if item is None:
        return jsonify({'error': 'no current item'}), 400

    db.insert_vote(voter_uuid, item['id'], round_str, rating)
    return jsonify({'ok': True, 'phase': phase, 'item_id': item['id']})


@app.route('/api/results')
def api_results():
    return jsonify(db.get_results())


@app.route('/api/voter_count')
def api_voter_count():
    """Return distinct voter count for the CURRENT item / phase, plus
    overall counts per round for context."""
    items = _items()
    phase, idx = _get_state()
    round_str = _phase_to_round(phase)
    item = _item_at(idx, items)
    overall = db.get_voter_counts()
    if item is None or round_str is None:
        current = 0
    else:
        current = db.get_item_voter_count(item['id'], round_str)
    return jsonify({
        'current_item': current,
        'round1_total': overall['round1'],
        'round2_total': overall['round2'],
    })


@app.route('/api/reset', methods=['POST'])
def api_reset():
    db.reset_votes()
    _set_state('round1', 1)
    return jsonify({'ok': True})
