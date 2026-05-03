# Tabernacle Weirdness Survey

A tiny Flask app for an LDS Sunday School lesson on Exodus 35–40 / Leviticus 1, 4, 16, 19. Teens rate how "weird" 7 ancient tabernacle features are on a 1–5 scale (Round 1), the teacher walks through what each one actually meant theologically, then the class re-rates the same items (Round 2). A live projector view shows the before-vs-after shift.

## URLs (three views)

| URL | Who | What |
|---|---|---|
| `/` | Students (phones) | Vote 1–5 on each item; auto-refreshes when teacher changes round |
| `/results` | Projector / TV | Live bar chart of averages; comparison view at the end |
| `/admin` | Teacher (phone) | Round controls, voter counts, QR code, reset button |

## Quick start (local)

```bash
pip install -r requirements.txt
python start.py
```

Server starts on `http://0.0.0.0:8080` (override with `PORT`). On first run, `start.py` creates `weirdness.db`, runs the schema, and seeds the 7 items.

Test it from your phone over WiFi: the laptop's local IP is shown in the boot output (e.g. `http://192.168.1.140:8080`).

## Deploy on Replit

1. Go to [replit.com](https://replit.com) → "Create Repl" → "Import from GitHub"
2. Paste this repo's URL
3. Hit "Run" — Replit auto-detects Python, installs from `requirements.txt`, and starts `python start.py`
4. The Repl gets a `*.replit.dev` URL (visible in the webview pane)
5. Use that URL on the classroom projector for `/results`, on your phone for `/admin`, and let students scan the QR code from `/admin`

The SQLite file (`weirdness.db`) persists on the Repl's disk between runs. Use the **Reset** button on `/admin` to clear votes between classes.

No API keys, no auth, no signups — single-classroom use only.

## Lesson flow (Round 1 → reveal → Round 2 → comparison)

1. Open `/admin`, leave it on **Round 1**. Show the QR code on the projector. Students scan and land on `/`.
2. Students rate each item's weirdness 1 (totally normal) – 5 (what on earth). `/results` shows live averages on the projector.
3. Teacher walks through what each item *meant* theologically (about 25–40 sec each).
4. Teacher taps **"Round 2: After Reveal"** on `/admin`. Same items reappear on student phones with the meaning text now visible. Students re-rate.
5. Teacher taps **"Show Comparison"**. Projector shows side-by-side R1-vs-R2 averages with shift arrows (green = down, red = up).

## The 7 items

1. Goat hair curtains (Ex 26:7) — covering, like the atonement
2. Outer roof of badger skins (Ex 26:14) — ugly outside, glory inside
3. Bells on the high priest's hem (Ex 28:33–35) — encountering God is serious
4. No chairs anywhere (Heb 10:11–12) — until Christ, the work was never done
5. Daily blood on the altar (Lev 1:5) — life given for life
6. The veil dividing holy from most holy (Ex 26:33) — torn at Christ's death
7. Two goats on the Day of Atonement (Lev 16:7–10) — pay AND remove

To swap any item or its image, edit `seed.py` and delete `weirdness.db` to re-seed on next start.

## Files

- `app.py` — Flask routes
- `db.py` — SQLite helpers
- `schema.sql` — tables
- `seed.py` — the 7 items + meanings + image URLs
- `start.py` — entry point (Replit-friendly)
- `.replit` — Replit run config
- `requirements.txt` — flask, qrcode[pil]
- `static/images/survey/` — Gemini-generated illustrations of each item
- `templates/`, `static/css/`, `static/js/` — views
