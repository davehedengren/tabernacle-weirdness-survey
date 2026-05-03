from db import get_conn, set_state

ITEMS = [
    {
        'title': 'Goat Hair Curtains',
        'scripture_ref': 'Exodus 26:7',
        'scripture_text': "And thou shalt make curtains of goats' hair to be a covering upon the tabernacle: eleven curtains shalt thou make.",
        'meaning': 'A covering. The Hebrew word for "atonement" (kaphar) literally means "to cover." Christ\'s sacrifice covers us, the way these curtains covered God\'s house.',
        'image_url': '/static/images/survey/01_goat_hair_curtains.png',
    },
    {
        'title': 'Outer Roof of Badger Skins',
        'scripture_ref': 'Exodus 26:14',
        'scripture_text': "And thou shalt make a covering for the tent of rams' skins dyed red, and a covering of badgers' skins above.",
        'meaning': 'Ugly outside, glory inside. Isaiah 53:2 says of Christ: "he hath no form nor comeliness... no beauty that we should desire him." The most precious thing in the universe was wrapped in something unimpressive — just like Jesus Himself.',
        'image_url': '/static/images/survey/02_badger_skins.png',
    },
    {
        'title': "Bells on the High Priest's Hem",
        'scripture_ref': 'Exodus 28:33-35',
        'scripture_text': "And it shall be upon Aaron to minister: and his sound shall be heard when he goeth in unto the holy place before the Lord, and when he cometh out, that he die not.",
        'meaning': "The high priest went behind the veil into God's actual presence. The bells let people outside know he was still alive in there. Encountering God is the most serious thing you'll ever do.",
        'image_url': '/static/images/survey/03_bells_on_hem.png',
    },
    {
        'title': 'No Chairs Anywhere',
        'scripture_ref': 'Hebrews 10:11',
        'scripture_text': "And every priest standeth daily ministering and offering oftentimes the same sacrifices, which can never take away sins.",
        'meaning': 'The priests stood — always — because the work of redemption was NEVER finished. Until Christ. Hebrews 10:12 continues: "But this man, after he had offered one sacrifice for sins for ever, sat down on the right hand of God." He sat. The work was done.',
        'image_url': '/static/images/survey/04_no_chairs.png',
    },
    {
        'title': 'Daily Blood on the Altar',
        'scripture_ref': 'Leviticus 1:5',
        'scripture_text': "And he shall kill the bullock before the Lord: and the priests, Aaron's sons, shall bring the blood, and sprinkle the blood round about upon the altar that is by the door of the tabernacle.",
        'meaning': "Life given for life. Every drop of animal blood was a tiny rehearsal of Christ's blood — pointing forward to the moment when one perfect sacrifice would end the need for any more.",
        'image_url': '/static/images/survey/05_blood_on_altar.png',
    },
    {
        'title': 'The Veil Dividing Holy from Most Holy',
        'scripture_ref': 'Exodus 26:33',
        'scripture_text': "And thou shalt hang up the vail under the taches, that thou mayest bring in thither within the vail the ark of the testimony: and the vail shall divide unto you between the holy place and the most holy.",
        'meaning': 'The veil kept ordinary humans OUT of God\'s full presence. Then Christ died — and Matthew 27:51 says: "the veil of the temple was rent in twain from the top to the bottom." God tore open the access. You can come in now.',
        'image_url': '/static/images/survey/06_the_veil.png',
    },
    {
        'title': 'Two Goats on the Day of Atonement',
        'scripture_ref': 'Leviticus 16:7-10',
        'scripture_text': "And he shall take the two goats, and present them before the Lord at the door of the tabernacle of the congregation. And Aaron shall cast lots upon the two goats; one lot for the Lord, and the other lot for the scapegoat... and to let him go for a scapegoat into the wilderness.",
        'meaning': 'Two goats. One slain to PAY for sin, one led ALIVE into the wilderness carrying sin AWAY. Together they preach the whole Atonement: Christ paid for sin AND He removed it from us (Psalm 103:12 — "as far as the east is from the west"). Every weird ritual of Yom Kippur was a 1500-year sermon about Jesus.',
        'image_url': '/static/images/survey/07_two_goats.png',
    },
]


def seed():
    conn = get_conn()
    try:
        for i, item in enumerate(ITEMS, start=1):
            conn.execute(
                'INSERT INTO items (title, scripture_ref, scripture_text, meaning, image_url, display_order) '
                'VALUES (?, ?, ?, ?, ?, ?)',
                (item['title'], item['scripture_ref'], item['scripture_text'],
                 item['meaning'], item['image_url'], i),
            )
        conn.commit()
    finally:
        conn.close()
    set_state('current_round', '1')


if __name__ == '__main__':
    seed()
    print(f'Seeded {len(ITEMS)} items.')
