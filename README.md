# 🎯 Gexten

**A modern, lightning-fast Next.js web application for live soccer betting odds and match insights**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://reactjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)

---

## 🚀 Quick Start

**Get live soccer odds in 5 minutes!**

1. **Get API Key**: Sign up at [The Odds API](https://the-odds-api.com/) (FREE)
2. **Set API Key**: Add to `.env.local`:
   ```env
   NEXT_PUBLIC_ODDS_API_KEY=your_api_key_here
   ```
3. **Run App**:
   ```bash
   npm install
   npm run dev
   ```
4. **Open Browser**: Navigate to http://localhost:3000

📖 **Detailed setup guide**: [QUICKSTART.md](./QUICKSTART.md)

---

## 🌟 Features

### Live Soccer Odds
- ⚽ **7 Major Leagues**: Premier League, La Liga, Bundesliga, Serie A, Ligue 1, Champions League, Europa League
- 📊 **Multiple Markets**: Head-to-Head, Over/Under 2.5, Both Teams to Score
- 🔄 **Auto-Refresh**: Updates every 5 minutes
- 💾 **Smart Caching**: Optimizes API usage
- 🎯 **Multiple Bookmakers**: Averaged odds from UK, EU, and US bookmakers

### Betting Tools
- ✅ **Match Selection**: Pick your favorite bets
- 🎲 **Booking Code Generator**: Create betting slips
- 📈 **AI Predictions**: Probability calculations
- 🔍 **Advanced Filters**: Filter by odds, leagues, bookmakers
- 📱 **Responsive Design**: Works on all devices

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **UI**: React 19 + Tailwind CSS
- **State Management**: Zustand
- **Data Source**: The Odds API
- **Icons**: Lucide React

---

## 📚 Documentation

- [**Quick Start Guide**](./QUICKSTART.md) - Get up and running in 5 minutes
- [**Odds API Setup**](./ODDS_API_SETUP.md) - Comprehensive API integration guide
- [**Architecture Docs**](./docs/architecture/) - System design and architecture

---

## 🔧 Development

### Prerequisites
- Node.js 18+ 
- npm/yarn/pnpm/bun
- The Odds API key (free tier available)

### Installation

```bash
# Clone the repository
git clone https://github.com/ProjectGexTech/project-gex-app.git

# Navigate to project directory
cd project-gex-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your API key

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## 📖 API Configuration

This app uses [The Odds API](https://the-odds-api.com/) to fetch live soccer odds.

### Free Tier Includes:
- ✅ 500 requests/month
- ✅ All soccer leagues
- ✅ Real-time odds
- ✅ Multiple bookmakers

### Setup:
1. Get your API key from https://the-odds-api.com/
2. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_ODDS_API_KEY=your_api_key_here
   ```
3. Restart your dev server

**Full guide**: [ODDS_API_SETUP.md](./ODDS_API_SETUP.md)

---

## 🌍 Supported Leagues

| League | Country | Sport Key |
|--------|---------|-----------|
| Premier League | 🏴󠁧󠁢󠁥󠁮󠁧󠁿 England | `soccer_epl` |
| La Liga | 🇪🇸 Spain | `soccer_spain_la_liga` |
| Bundesliga | 🇩🇪 Germany | `soccer_germany_bundesliga` |
| Serie A | 🇮🇹 Italy | `soccer_italy_serie_a` |
| Ligue 1 | 🇫🇷 France | `soccer_france_ligue_one` |
| Champions League | 🏆 UEFA | `soccer_uefa_champs_league` |
| Europa League | 🏆 UEFA | `soccer_uefa_europa_league` |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- [The Odds API](https://the-odds-api.com/) for providing live odds data
- [Next.js](https://nextjs.org/) for the amazing framework
- [Vercel](https://vercel.com/) for hosting and deployment

---

## 📞 Support

- 📖 [Documentation](./ODDS_API_SETUP.md)
- 🐛 [Issue Tracker](https://github.com/ProjectGexTech/project-gex-app/issues)
- 💬 [Discussions](https://github.com/ProjectGexTech/project-gex-app/discussions)

---

<div align="center">

**Made with ❤️ by the Gexten Team**

⭐ Star us on GitHub if you find this project useful!

</div>

- 🏆 **Clean UI/UX** - Present match information through intuitive card-based interfaces

- 🔍 **Smart Filtering** - Advanced filtering and exploration of betting odds- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

- 🎫 **Booking Codes** - Intelligent booking code generation and management- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

- ⚡ **Performance** - Blazing-fast, maintainable codebase for rapid iteration

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

---

## Deploy on Vercel

## 🎮 Demo

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Fire up the development server and visit `http://localhost:3000` to experience Gexten in action!

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

The app showcases component-driven architecture - explore `components/` to see building blocks like:
- `MatchCard` - Beautiful match information displays
- `FilterPanel` - Advanced filtering capabilities  
- `BookingCodeGenerator` - Smart code generation tools

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎯 **Match Cards** | Clean, responsive match listing with detailed information |
| 🔎 **Smart Filters** | Dynamic filtering panel for narrowing results |
| 🎫 **Code Generator** | Automated booking code generation system |
| 🏪 **State Management** | Lightweight, efficient state handling with Zustand |
| 📱 **Responsive Design** | Optimized for mobile, tablet, and desktop |
| ⚡ **Performance** | Server-side rendering and optimized loading |

---

## 🛠️ Tech Stack

<div align="center">

| Frontend | State | Styling | Utilities |
|----------|-------|---------|-----------|
| ![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js) | ![Zustand](https://img.shields.io/badge/Zustand-5-orange?style=flat) | ![Tailwind](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat&logo=tailwind-css) | ![date-fns](https://img.shields.io/badge/date--fns-4.1-green?style=flat) |
| ![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react) | | ![PostCSS](https://img.shields.io/badge/PostCSS-4-DD3A0A?style=flat&logo=postcss) | ![Lucide](https://img.shields.io/badge/Lucide-Icons-F56565?style=flat) |
| ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript) | | | |

</div>

**Why these choices?**
- 🚀 **Performance** - Optimized for speed and scalability
- 🔧 **Developer Experience** - Modern tooling with excellent DX
- 🌐 **Deployment Ready** - Perfect for Vercel, Netlify, or any Node hosting platform

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/ProjectGexTech/project-gex-app.git
cd project-gex-app

# Install dependencies
npm install

# Start development server
npm run dev

# 🎉 Open http://localhost:3000 in your browser
```

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

---

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | 🔧 Start Next.js development server with hot reload |
| `npm run build` | 🏗️ Build optimized production bundle |
| `npm run start` | 🚀 Start production server |

---

## 📁 Project Structure

```
gexten/
├── 📁 app/                 # Next.js App Router (routes & layouts)
├── 📁 components/          # Reusable UI components
│   ├── MatchCard.tsx       # Match information cards
│   ├── FilterPanel.tsx     # Filtering interface
│   └── BookingCodeGenerator.tsx
├── 📁 lib/                 # Utilities, types & store
│   ├── dummyData.ts        # Sample data
│   ├── store.ts            # Zustand store
│   └── types.ts            # TypeScript definitions
├── 📁 docs/                # Project documentation
└── 📁 public/              # Static assets
```

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### 🐛 Reporting Bugs
1. Check existing issues first
2. Create a detailed bug report with reproduction steps
3. Include screenshots if applicable

### 🚀 Feature Requests
1. Open an issue describing the feature
2. Explain the use case and benefits
3. Discuss implementation approaches

### 💻 Code Contributions
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following our coding standards
4. Add tests if applicable
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### 📋 Guidelines
- Keep changes focused and atomic
- Follow existing code style and patterns
- Prefer small, well-named components
- Write meaningful commit messages

---

## 📄 License

This project is currently **unlicensed**. Please add a `LICENSE` file if you wish to specify licensing terms.

---

## 📞 Contact & Support

<div align="center">

**Questions? Need help? Want to collaborate?**

[![GitHub Issues](https://img.shields.io/badge/GitHub-Issues-green?style=for-the-badge&logo=github)](https://github.com/ProjectGexTech/project-gex-app/issues)
[![Discussions](https://img.shields.io/badge/GitHub-Discussions-blue?style=for-the-badge&logo=github)](https://github.com/ProjectGexTech/project-gex-app/discussions)

**Maintained with ❤️ by the ProjectGex Team**

</div>

---

<div align="center">

**⭐ If you found Gexten useful, please give us a star! ⭐**

*Built with Next.js • Powered by React • Styled with Tailwind*

</div>