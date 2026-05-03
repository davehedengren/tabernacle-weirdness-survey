import os
import sqlite3

DB_PATH = os.environ.get('DB_PATH', os.path.join(os.path.dirname(__file__), 'weirdness.db'))
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), 'schema.sql')


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute('PRAGMA foreign_keys = ON')
    return conn


def init_db():
    with open(SCHEMA_PATH, 'r') as f:
        schema = f.read()
    conn = get_conn()
    try:
        conn.executescript(schema)
        conn.commit()
    finally:
        conn.close()


def items_empty():
    conn = get_conn()
    try:
        row = conn.execute('SELECT COUNT(*) AS c FROM items').fetchone()
        return row['c'] == 0
    finally:
        conn.close()


def get_items():
    conn = get_conn()
    try:
        rows = conn.execute(
            'SELECT id, title, scripture_ref, scripture_text, '
            'context_scripture_ref, context_scripture_text, '
            'meaning, image_url, display_order '
            'FROM items ORDER BY display_order ASC'
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def get_state(key, default=None):
    conn = get_conn()
    try:
        row = conn.execute('SELECT value FROM state WHERE key = ?', (key,)).fetchone()
        return row['value'] if row else default
    finally:
        conn.close()


def set_state(key, value):
    conn = get_conn()
    try:
        conn.execute(
            'INSERT INTO state (key, value) VALUES (?, ?) '
            'ON CONFLICT(key) DO UPDATE SET value = excluded.value',
            (key, value),
        )
        conn.commit()
    finally:
        conn.close()


def insert_vote(voter_uuid, item_id, round_, rating):
    conn = get_conn()
    try:
        conn.execute(
            'INSERT OR REPLACE INTO votes (voter_uuid, item_id, round, rating) '
            'VALUES (?, ?, ?, ?)',
            (voter_uuid, item_id, round_, rating),
        )
        conn.commit()
    finally:
        conn.close()


def get_results():
    """Return per-item aggregate stats AND per-rating distributions, grouped
    by round. Each entry: {item_id, avg, count, dist} where dist is a 5-element
    list [count_of_1, count_of_2, count_of_3, count_of_4, count_of_5]."""
    conn = get_conn()
    try:
        # Per-rating breakdown for the histogram.
        dist_rows = conn.execute(
            'SELECT item_id, round, rating, COUNT(*) AS c '
            'FROM votes GROUP BY item_id, round, rating'
        ).fetchall()
        # Aggregate avg + count from the per-rating data so the two views
        # are guaranteed to agree (no risk of drift between two queries).
        per = {}  # (item_id, round) -> {'dist': [...], 'sum': n, 'count': n}
        for r in dist_rows:
            key = (r['item_id'], r['round'])
            entry = per.setdefault(key, {'dist': [0, 0, 0, 0, 0], 'sum': 0, 'count': 0})
            entry['dist'][r['rating'] - 1] = r['c']
            entry['sum'] += r['rating'] * r['c']
            entry['count'] += r['c']

        round1, round2 = [], []
        for (item_id, round_), entry in per.items():
            avg = entry['sum'] / entry['count'] if entry['count'] else 0.0
            payload = {
                'item_id': item_id,
                'avg': avg,
                'count': entry['count'],
                'dist': entry['dist'],
            }
            (round1 if round_ == '1' else round2).append(payload)
        return {'round1': round1, 'round2': round2}
    finally:
        conn.close()


def get_voter_counts():
    conn = get_conn()
    try:
        rows = conn.execute(
            'SELECT round, COUNT(DISTINCT voter_uuid) AS c FROM votes GROUP BY round'
        ).fetchall()
        result = {'round1': 0, 'round2': 0}
        for r in rows:
            if r['round'] == '1':
                result['round1'] = r['c']
            elif r['round'] == '2':
                result['round2'] = r['c']
        return result
    finally:
        conn.close()


def reset_votes():
    conn = get_conn()
    try:
        conn.execute('DELETE FROM votes')
        conn.commit()
    finally:
        conn.close()


def get_item_voter_count(item_id, round_):
    """Distinct voters who have rated a specific item in the given round."""
    conn = get_conn()
    try:
        row = conn.execute(
            'SELECT COUNT(DISTINCT voter_uuid) AS c FROM votes '
            'WHERE item_id = ? AND round = ?',
            (item_id, round_),
        ).fetchone()
        return row['c'] if row else 0
    finally:
        conn.close()
