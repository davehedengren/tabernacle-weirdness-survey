import os

import db
import seed
from app import app


def bootstrap():
    db.init_db()
    if db.items_empty():
        seed.seed()
        print('Seeded items table.')
    if db.get_state('current_round') is None:
        db.set_state('current_round', '1')


if __name__ == '__main__':
    bootstrap()
    port = int(os.environ.get('PORT', 8080))
    print(f'Starting on 0.0.0.0:{port}')
    app.run(host='0.0.0.0', port=port, debug=False)
