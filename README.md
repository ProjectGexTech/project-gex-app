# 🎯 GextenThis is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).



<div align="center">## Getting Started



![Gexten Logo](https://img.shields.io/badge/⚡-Gexten-blue?style=for-the-badge&logo=react&logoColor=white)First, run the development server:



**A modern, lightning-fast Next.js web application for sports betting insights and match data**```bash

npm run dev

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)# or

[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://typescriptlang.org)yarn dev

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://reactjs.org)# or

[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)pnpm dev

# or

[🚀 Live Demo](#demo) • [📖 Documentation](#features) • [🛠️ Installation](#quick-start) • [🤝 Contributing](#contributing)bun dev

```

</div>

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## 🌟 About Gexten

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

Gexten is a cutting-edge sports betting platform that empowers fans with real-time insights, match data, and intelligent booking code generation. Built with modern web technologies, it delivers a seamless, responsive experience across all devices.

## Learn More

### 🎯 Key Objectives

To learn more about Next.js, take a look at the following resources:

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