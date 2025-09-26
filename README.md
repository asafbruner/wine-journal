# 🍷 Wine Journal

A modern, responsive web application for tracking wine tastings and building your personal wine collection. Built with React, TypeScript, and Tailwind CSS.

## ✨ Features

- **Add Wine Entries**: Record wine name, vintage, rating (1-5 stars), and detailed tasting notes
- **View Collection**: Browse your wines with sorting options (newest first, name A-Z, highest rated, etc.)
- **Edit & Delete**: Modify existing entries or remove wines from your collection
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Local Storage**: Data persists in your browser between sessions
- **Star Rating System**: Interactive 5-star rating component
- **Form Validation**: Comprehensive input validation with helpful error messages

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd wine-journal
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🧪 Testing

This project includes comprehensive testing with unit tests, integration tests, and end-to-end tests.

### Run Unit Tests
```bash
npm run test
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run E2E Tests
```bash
npm run test:e2e
```

### Run E2E Tests with UI
```bash
npm run test:e2e:ui
```

## 🏗️ Build

To build the application for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

## 📱 Mobile Testing

The application is fully responsive and optimized for mobile devices. To test on your iPhone:

1. Make sure your development server is running (`npm run dev`)
2. Find your computer's IP address on your local network
3. Open Safari on your iPhone and navigate to `http://[YOUR-IP]:5173`

## 🛠️ Technology Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom components
- **State Management**: React Context API
- **Data Storage**: Browser localStorage
- **Testing**: 
  - Unit/Integration: Vitest + React Testing Library
  - E2E: Playwright
- **Code Quality**: ESLint + Prettier
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel (configured)

## 📁 Project Structure

```
wine-journal/
├── src/
│   ├── components/          # React components
│   │   ├── __tests__/      # Component tests
│   │   ├── StarRating.tsx
│   │   ├── WineForm.tsx
│   │   ├── WineCard.tsx
│   │   └── WineList.tsx
│   ├── context/            # React Context providers
│   │   └── WineContext.tsx
│   ├── services/           # Data layer services
│   │   ├── __tests__/     # Service tests
│   │   └── wineService.ts
│   ├── types/             # TypeScript type definitions
│   │   └── wine.ts
│   ├── test/              # Test setup and utilities
│   │   └── setup.ts
│   ├── App.tsx            # Main application component
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global styles and Tailwind directives
├── tests/
│   └── e2e/               # End-to-end tests
├── .github/
│   └── workflows/         # GitHub Actions CI/CD
├── public/                # Static assets
└── dist/                  # Built application (generated)
```

## 🎨 Design System

The application uses a consistent design system built with Tailwind CSS:

- **Colors**: Purple primary theme with gray accents
- **Typography**: Clean, readable fonts with proper hierarchy
- **Components**: Reusable button styles, form inputs, and cards
- **Responsive**: Mobile-first design with breakpoints for tablet and desktop

## 🔄 Development Workflow

1. **Feature Development**: Create feature branches from `develop`
2. **Testing**: All code must have accompanying tests
3. **Code Quality**: ESLint and Prettier enforce consistent code style
4. **Pull Requests**: All changes go through PR review process
5. **CI/CD**: Automated testing and deployment on merge to `main`

## 🚀 Deployment

The application is configured for automatic deployment to Vercel:

1. Connect your GitHub repository to Vercel
2. Set up the required environment variables:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
3. Push to the `main` branch to trigger deployment

## 🔮 Future Enhancements

This is the foundation (Step 1) of the wine journal. Future planned features include:

- **Phase 2**: Photo uploads, wine categories, advanced filtering
- **Phase 3**: Backend API integration, cloud storage
- **Phase 4**: User authentication, multi-user support
- **Phase 5**: Social features, wine recommendations, sharing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and add tests
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern React and TypeScript best practices
- Styled with Tailwind CSS for rapid development
- Tested comprehensively for reliability
- Designed with mobile-first responsive principles
