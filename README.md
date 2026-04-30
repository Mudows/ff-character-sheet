# Adventure Sheet — Fighting Fantasy / Sorcery!

A mobile-first web app for tracking playthroughs of **Fighting Fantasy** gamebooks, with initial support for the **Sorcery!** system (published in Brazil by Jambô Editora as *As Montanhas Shamutanti*, *Kharé*, etc.).

---

## Features

- **Character creation flow** via guided modal:
  - **Auto-generate**: choose Warrior or Wizard (dice formulas shown per class), confirm once — attributes are rolled and locked immediately
  - **Manual entry**: dismiss modal and fill in values yourself; pick your class via a dedicated button in the Attributes card header
  - Class is locked after confirmation and cannot be changed
- **Attributes** (Skill, Stamina and Luck) with separate initial and current value tracking; card header shows chosen class name once confirmed
- **Gold, Provisions, Equipment and Bonuses/Curses**
- **Full combat system:**
  - Automatic mode: dice rolling, round resolution and Stamina sync
  - Manual mode: damage entry per round
  - Luck tests in combat (modifies damage dealt or received, per the rulebook)
  - Expandable combat log per encounter (Monster Boxes)
- **Notes** with free-text field and an ASCII/monospaced adventure map
- **Auto-save** via `localStorage`
- **Export/Import** character as JSON (old saves with legacy format are migrated automatically)
- **New Character** button with confirmation before wiping current data

---

## Built with

| Layer | Technology |
|-------|-----------|
| Markup | HTML5 |
| Style | **Tailwind CSS** (CDN, custom parchment theme via `tailwind.config`) + thin `style.css` for things Tailwind can't express |
| Logic | JavaScript ES6+ |
| DOM & events | jQuery 3.7 |
| Persistence | `localStorage` |
| AI pair programmer | [Claude](https://claude.ai) by Anthropic |

No build tools. No bundler. No framework. Just files — drop `index.html` in a browser and go.

---

## Getting started

```bash
git clone https://github.com/your-username/adventure-sheet.git
cd adventure-sheet
# Open index.html directly in your browser — no server required
```

For live reload during development, any static server works:

```bash
npx serve .
# or
python -m http.server
```

---

## Project structure

```
├── index.html   # Markup and structure
├── style.css    # Styles (medieval parchment theme)
├── app.js       # Application logic (jQuery)
└── README.md
```

---

## Roadmap

### Visual
- [x] ~~Migrate styles to **Tailwind CSS**~~
- [ ] Dark mode
- [ ] Dice roll animations

### Rule systems
- [ ] **Standard Fighting Fantasy** — no magic, basic combat
- [ ] **Sorcery!** — current system, with Warrior/Wizard distinction
- [ ] **House of Hell** — Fear system, sanity tracker and horror mechanics
- [ ] System selection at character creation, automatically adapting available fields and rules per book

### Features
- [ ] Multiple saved characters
- [ ] Visual Stamina tracker (clickable pips)
- [ ] Spellbook support for systems that allow recording spells
- [ ] Full offline support (PWA / Service Worker)
- [ ] Export character sheet as PDF

---

## License

MIT