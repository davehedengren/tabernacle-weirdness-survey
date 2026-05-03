import base64
import io

import qrcode
from flask import Flask, jsonify, render_template, request

import db

app = Flask(__name__)


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
    items = db.get_items()
    current_round = db.get_state('current_round', '1')
    return jsonify({'items': items, 'current_round': current_round})


@app.route('/api/state', methods=['GET', 'POST'])
def api_state():
    if request.method == 'POST':
        data = request.get_json(force=True, silent=True) or {}
        new_round = data.get('current_round')
        if new_round not in ('1', '2', 'comparison'):
            return jsonify({'error': 'invalid round'}), 400
        db.set_state('current_round', new_round)
        return jsonify({'current_round': new_round})
    return jsonify({'current_round': db.get_state('current_round', '1')})


@app.route('/api/vote', methods=['POST'])
def api_vote():
    data = request.get_json(force=True, silent=True) or {}
    voter_uuid = data.get('voter_uuid')
    item_id = data.get('item_id')
    rating = data.get('rating')

    if not voter_uuid or item_id is None or rating is None:
        return jsonify({'error': 'missing fields'}), 400
    try:
        item_id = int(item_id)
        rating = int(rating)
    except (TypeError, ValueError):
        return jsonify({'error': 'invalid types'}), 400
    if rating < 1 or rating > 5:
        return jsonify({'error': 'rating out of range'}), 400

    current_round = db.get_state('current_round', '1')
    if current_round not in ('1', '2'):
        return jsonify({'error': 'voting closed'}), 403

    db.insert_vote(voter_uuid, item_id, current_round, rating)
    return jsonify({'ok': True, 'round': current_round})


@app.route('/api/results')
def api_results():
    return jsonify(db.get_results())


@app.route('/api/voter_count')
def api_voter_count():
    return jsonify(db.get_voter_counts())


@app.route('/api/reset', methods=['POST'])
def api_reset():
    db.reset_votes()
    return jsonify({'ok': True})
