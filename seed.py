"""Seed the items table with the 6 tabernacle objects from the Come Follow
Me 2026 manual table (Exodus 35-40 / Lev 1, 4, 16, 19), plus the Day of
Atonement scapegoat ritual.

Each item has TWO scriptures:
  - scripture_text  — the Exodus passage describing how the object was used
  - context_scripture_text — the Christ-centered NT/OT passage giving its
                              symbolic meaning (revealed in Round 2)
"""
from db import get_conn, set_state

ITEMS = [
    {
        'title': 'Ark of the Covenant',
        'scripture_ref': 'Exodus 37:1–9',
        'scripture_text': (
            "And Bezaleel made the ark of shittim wood: two cubits and a half "
            "was the length of it, and a cubit and a half the breadth of it, "
            "and a cubit and a half the height of it: And he overlaid it with "
            "pure gold within and without, and made a crown of gold to it round "
            "about. And he cast for it four rings of gold, to be set by the "
            "four corners of it; even two rings upon the one side of it, and "
            "two rings upon the other side of it. And he made staves of "
            "shittim wood, and overlaid them with gold. And he put the staves "
            "into the rings by the sides of the ark, to bear the ark. And he "
            "made the mercy seat of pure gold: two cubits and a half was the "
            "length thereof, and one cubit and a half the breadth thereof. "
            "And he made two cherubims of gold, beaten out of one piece made "
            "he them, on the two ends of the mercy seat; One cherub on the end "
            "on this side, and another cherub on the other end on that side: "
            "out of the mercy seat made he the cherubims on the two ends "
            "thereof. And the cherubims spread out their wings on high, and "
            "covered with their wings over the mercy seat, with their faces "
            "one to another; even to the mercy seatward were the faces of "
            "the cherubims."
        ),
        'context_scripture_ref': 'Romans 3:25',
        'context_scripture_text': (
            "Whom God hath set forth to be a propitiation through faith in "
            "his blood, to declare his righteousness for the remission of "
            "sins that are past, through the forbearance of God."
        ),
        'meaning': (
            "Christ Himself is the mercy seat. The Greek word Paul uses for "
            "\"propitiation\" (hilastērion) is the exact word the Greek Old "
            "Testament uses for the lid of the Ark. Christ is where God "
            "meets us."
        ),
        'image_url': '/static/images/survey/v2_01_ark_of_the_covenant.png',
    },
    {
        'title': 'Altar of Incense',
        'scripture_ref': 'Exodus 40:26–27',
        'scripture_text': (
            "And he put the golden altar in the tent of the congregation "
            "before the vail: And he burnt sweet incense thereon; as the Lord "
            "commanded Moses."
        ),
        'context_scripture_ref': 'Revelation 8:3–4; Hebrews 7:25',
        'context_scripture_text': (
            "And another angel came and stood at the altar, having a golden "
            "censer; and there was given unto him much incense, that he "
            "should offer it with the prayers of all saints upon the golden "
            "altar which was before the throne. And the smoke of the incense, "
            "which came with the prayers of the saints, ascended up before "
            "God out of the angel's hand. ...Wherefore he is able also to "
            "save them to the uttermost that come unto God by him, seeing "
            "he ever liveth to make intercession for them."
        ),
        'meaning': (
            "Prayer — the prayers of the saints rise to God like incense, "
            "and Christ ever lives to carry them up for us."
        ),
        'image_url': '/static/images/survey/v2_02_altar_of_incense.png',
    },
    {
        'title': 'Candlestick / Lampstand',
        'scripture_ref': 'Exodus 37:17–24',
        'scripture_text': (
            "And he made the candlestick of pure gold: of beaten work made he "
            "the candlestick; his shaft, and his branch, his bowls, his knops, "
            "and his flowers, were of the same: And six branches going out of "
            "the sides thereof; three branches of the candlestick out of the "
            "one side thereof, and three branches of the candlestick out of "
            "the other side thereof: Three bowls made after the fashion of "
            "almonds in one branch, a knop and a flower; and three bowls made "
            "like almonds in another branch, a knop and a flower: so "
            "throughout the six branches going out of the candlestick. ... "
            "Of a talent of pure gold made he it, and all the vessels thereof."
        ),
        'context_scripture_ref': 'Matthew 5:14–16; John 8:12',
        'context_scripture_text': (
            "Ye are the light of the world. A city that is set on an hill "
            "cannot be hid. Neither do men light a candle, and put it under "
            "a bushel, but on a candlestick; and it giveth light unto all "
            "that are in the house. Let your light so shine before men, that "
            "they may see your good works, and glorify your Father which is "
            "in heaven. ...I am the light of the world: he that followeth me "
            "shall not walk in darkness, but shall have the light of life."
        ),
        'meaning': "Light — Christ is the light, and we shine because He shines.",
        'image_url': '/static/images/survey/v2_03_menorah.png',
    },
    {
        'title': 'Altar of Sacrifice',
        'scripture_ref': 'Exodus 38:1–7',
        'scripture_text': (
            "And he made the altar of burnt offering of shittim wood: five "
            "cubits was the length thereof, and five cubits the breadth "
            "thereof; it was foursquare; and three cubits the height thereof. "
            "And he made the horns thereof on the four corners of it; the "
            "horns thereof were of the same: and he overlaid it with brass. "
            "And he made all the vessels of the altar, the pots, and the "
            "shovels, and the basons, and the fleshhooks, and the firepans: "
            "all the vessels thereof made he of brass. And he made for the "
            "altar a brasen grate of network under the compass thereof "
            "beneath unto the midst of it. And he cast four rings for the "
            "four ends of the grate of brass, to be places for the staves. "
            "And he made the staves of shittim wood, and overlaid them with "
            "brass. And he put the staves into the rings on the sides of the "
            "altar, to bear it withal; he made the altar hollow with boards."
        ),
        'context_scripture_ref': 'John 1:29; Hebrews 10:11–12',
        'context_scripture_text': (
            "The next day John seeth Jesus coming unto him, and saith, "
            "Behold the Lamb of God, which taketh away the sin of the world! "
            "...And every priest standeth daily ministering and offering "
            "oftentimes the same sacrifices, which can never take away sins: "
            "But this man, after he had offered one sacrifice for sins for "
            "ever, sat down on the right hand of God."
        ),
        'meaning': (
            "Sacrifice — every animal pointed forward to THE Lamb. The "
            "priests stood daily because the work was never done. Christ "
            "sat down. It is finished."
        ),
        'image_url': '/static/images/survey/v2_04_altar_of_sacrifice.png',
    },
    {
        'title': 'Laver (Basin) of Water',
        'scripture_ref': 'Exodus 30:17–21',
        'scripture_text': (
            "And the Lord spake unto Moses, saying, Thou shalt also make a "
            "laver of brass, and his foot also of brass, to wash withal: and "
            "thou shalt put it between the tabernacle of the congregation and "
            "the altar, and thou shalt put water therein. For Aaron and his "
            "sons shall wash their hands and their feet thereat: When they go "
            "into the tabernacle of the congregation, they shall wash with "
            "water, that they die not; or when they come near to the altar to "
            "minister, to burn offering made by fire unto the Lord: So they "
            "shall wash their hands and their feet, that they die not: and it "
            "shall be a statute for ever to them, even to him and to his seed "
            "throughout their generations."
        ),
        'context_scripture_ref': 'Ephesians 5:25–26; Hebrews 10:22',
        'context_scripture_text': (
            "Husbands, love your wives, even as Christ also loved the church, "
            "and gave himself for it; That he might sanctify and cleanse it "
            "with the washing of water by the word. ...Let us draw near with "
            "a true heart in full assurance of faith, having our hearts "
            "sprinkled from an evil conscience, and our bodies washed with "
            "pure water."
        ),
        'meaning': (
            "Cleansing — Christ washes us to make us fit to come before God. "
            "Baptism, sacrament, the Holy Ghost — the laver pointed forward "
            "to Him."
        ),
        'image_url': '/static/images/survey/v2_05_laver.png',
    },
    {
        'title': 'The Anointing Oil',
        'scripture_ref': 'Exodus 30:22–25, 32–33',
        'scripture_text': (
            "Moreover the Lord spake unto Moses, saying, Take thou also unto "
            "thee principal spices, of pure myrrh five hundred shekels, and "
            "of sweet cinnamon half so much, even two hundred and fifty "
            "shekels, and of sweet calamus two hundred and fifty shekels, "
            "And of cassia five hundred shekels, after the shekel of the "
            "sanctuary, and of oil olive an hin: And thou shalt make it an "
            "oil of holy ointment, an ointment compound after the art of "
            "the apothecary: it shall be an holy anointing oil. ...Upon "
            "man's flesh shall it not be poured, neither shall ye make any "
            "other like it, after the composition of it: it is holy, and "
            "it shall be holy unto you. Whosoever compoundeth any like it, "
            "or whosoever putteth any of it upon a stranger, shall even be "
            "cut off from his people."
        ),
        'context_scripture_ref': 'Luke 4:18; Acts 10:38',
        'context_scripture_text': (
            "The Spirit of the Lord is upon me, because he hath anointed me "
            "to preach the gospel to the poor; he hath sent me to heal the "
            "brokenhearted, to preach deliverance to the captives, and "
            "recovering of sight to the blind, to set at liberty them that "
            "are bruised. ...How God anointed Jesus of Nazareth with the "
            "Holy Ghost and with power: who went about doing good, and "
            "healing all that were oppressed of the devil; for God was "
            "with him."
        ),
        'meaning': (
            "Anointing — \"Christ\" / \"Messiah\" both literally mean "
            "\"the Anointed One.\" We receive His anointing through the "
            "Holy Spirit."
        ),
        'image_url': '/static/images/survey/v2_anointing_oil.png',
    },
    {
        'title': "Aaron's Rod That Budded",
        'scripture_ref': 'Numbers 17:8',
        'scripture_text': (
            "And it came to pass, that on the morrow Moses went into the "
            "tabernacle of witness; and, behold, the rod of Aaron for the "
            "house of Levi was budded, and brought forth buds, and bloomed "
            "blossoms, and yielded almonds."
        ),
        'context_scripture_ref': 'John 11:25; 1 Corinthians 15:20',
        'context_scripture_text': (
            "Jesus said unto her, I am the resurrection, and the life: he "
            "that believeth in me, though he were dead, yet shall he live. "
            "...But now is Christ risen from the dead, and become the "
            "firstfruits of them that slept."
        ),
        'meaning': (
            "Resurrection — dead wood blossomed overnight. Christ is the "
            "resurrection — the chosen High Priest who lives."
        ),
        'image_url': '/static/images/survey/v2_aarons_rod.png',
    },
    {
        'title': 'Cherubim Woven into the Veil',
        'scripture_ref': 'Exodus 26:31; Genesis 3:24',
        'scripture_text': (
            "And thou shalt make a vail of blue, and purple, and scarlet, "
            "and fine twined linen of cunning work: with cherubims shall it "
            "be made. ...So he drove out the man; and he placed at the east "
            "of the garden of Eden Cherubims, and a flaming sword which "
            "turned every way, to keep the way of the tree of life."
        ),
        'context_scripture_ref': 'Matthew 27:51; Hebrews 10:19–20',
        'context_scripture_text': (
            "And, behold, the veil of the temple was rent in twain from the "
            "top to the bottom; and the earth did quake, and the rocks rent. "
            "...Having therefore, brethren, boldness to enter into the "
            "holiest by the blood of Jesus, By a new and living way, which "
            "he hath consecrated for us, through the veil, that is to say, "
            "his flesh."
        ),
        'meaning': (
            "Eden's barrier inverted — the same cherubim that blocked the "
            "way back to God were woven into the veil that Christ tore "
            "open."
        ),
        'image_url': '/static/images/survey/v2_cherubim_veil.png',
    },
    {
        'title': 'Two Goats on the Day of Atonement',
        'scripture_ref': 'Leviticus 16:7–10',
        'scripture_text': (
            "And he shall take the two goats, and present them before the "
            "Lord at the door of the tabernacle of the congregation. And "
            "Aaron shall cast lots upon the two goats; one lot for the Lord, "
            "and the other lot for the scapegoat. And Aaron shall bring the "
            "goat upon which the Lord's lot fell, and offer him for a sin "
            "offering. But the goat, on which the lot fell to be the "
            "scapegoat, shall be presented alive before the Lord, to make an "
            "atonement with him, and to let him go for a scapegoat into the "
            "wilderness."
        ),
        'context_scripture_ref': 'Psalm 103:12; Hebrews 9:11–12',
        'context_scripture_text': (
            "As far as the east is from the west, so far hath he removed our "
            "transgressions from us. ...But Christ being come an high priest "
            "of good things to come... Neither by the blood of goats and "
            "calves, but by his own blood he entered in once into the holy "
            "place, having obtained eternal redemption for us."
        ),
        'meaning': (
            "Atonement — one goat slain to PAY for sin, one led alive into "
            "the wilderness to CARRY sin away. Christ does both."
        ),
        'image_url': '/static/images/survey/v2_06_two_goats.png',
    },
]


def seed():
    conn = get_conn()
    try:
        for i, item in enumerate(ITEMS, start=1):
            conn.execute(
                'INSERT INTO items (title, scripture_ref, scripture_text, '
                'context_scripture_ref, context_scripture_text, meaning, '
                'image_url, display_order) '
                'VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                (item['title'], item['scripture_ref'], item['scripture_text'],
                 item['context_scripture_ref'], item['context_scripture_text'],
                 item['meaning'], item['image_url'], i),
            )
        conn.commit()
    finally:
        conn.close()
    set_state('phase', 'round1')
    set_state('current_item_index', '1')


if __name__ == '__main__':
    seed()
    print(f'Seeded {len(ITEMS)} items.')
