# Pepper - 3D Card Game

A three.js-based 3D card game built with Vite, TypeScript, and Tailwind CSS. Features interactive 3D cards that can be shuffled through the air and dealt onto a playing table.

## Features

- **3D Scene**: Playing table viewed at a 45-degree angle using three.js
- **Interactive Cards**: Click, lift, and drag cards around the table using raycaster technology
- **Shuffle Animation**: Cards fly through the air in a mesmerizing shuffle animation
- **Deal Cards**: Deal 5 cards onto the table with smooth arc animations
- **Player Positions**: Designated areas for player and opponent (multiplayer ready)
- **Responsive Design**: Built with Tailwind CSS for a clean UI

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start the development server
npm run dev
```

Open http://localhost:3000 in your browser.

### Build for Production

```bash
# Build the project
npm run build

# Preview the production build
npm run preview
```

## How to Play

1. Click the **Shuffle Deck** button to see the cards shuffle through the air
2. Click the **Deal 5 Cards** button to deal cards to the player area
3. Click on any card to lift it
4. Drag the card while holding the mouse button
5. Release to drop the card in its new position

## Technology Stack

- **three.js**: 3D graphics and rendering
- **Vite**: Fast build tool and dev server
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework

## Project Structure

```
pepper/
├── src/
│   ├── main.ts          # Main game logic and scene setup
│   ├── Card.ts          # Card class with 3D mesh and interactions
│   ├── Deck.ts          # Deck class with shuffle and deal animations
│   ├── constants.ts     # Game constants and configuration
│   └── style.css        # Tailwind CSS imports
├── index.html           # HTML entry point
├── package.json         # Project dependencies
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
└── tailwind.config.js   # Tailwind CSS configuration
```

## Future Enhancements

- Multiplayer functionality
- Card game rules implementation
- Sound effects
- Card flip animations
- More card designs
- Mobile touch support

## License

MIT
