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

4. Open your browser and navigate to `http://localhost:5174`

### Test User Login

For local development, the app comes pre-populated with a test user and 8 sample wines:

**Test Login Credentials:**
- Email: `test@example.com`
- Password: `password`

The test account includes a curated wine collection with:
- Château Margaux 2015 (Bordeaux)
- Cloudy Bay Sauvignon Blanc (New Zealand)
- Barolo Riserva (Italy)
- Dom Pérignon Champagne
- Opus One (Napa Valley)
- Penfolds Grange (Australia)
- Cakebread Cellars Chardonnay
- Rioja Gran Reserva (Spain)

This allows you to immediately test all features including viewing, sorting, editing, and deleting wines!

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

The Wine Journal application is ready for deployment with multiple options:

### Option 1: Vercel (Recommended)

The application is pre-configured for Vercel deployment with automatic CI/CD:

#### Quick Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/wine-journal)

#### Manual Setup
1. **Fork/Clone** this repository to your GitHub account
2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com) and sign up/login
   - Click "New Project" and import your GitHub repository
   - Vercel will automatically detect it's a Vite project
3. **Deploy**: Click "Deploy" - that's it! Vercel handles the build automatically
4. **Custom Domain** (optional): Add your custom domain in Vercel dashboard

#### Automatic Deployments
- **GitHub Integration**: Every push to `main` branch triggers automatic deployment
- **Preview Deployments**: Pull requests get preview URLs for testing
- **CI/CD Pipeline**: Includes automated testing before deployment

### Option 2: Netlify

1. **Build the app**: `npm run build`
2. **Deploy to Netlify**:
   - Drag and drop the `dist` folder to [netlify.com/drop](https://netlify.com/drop)
   - Or connect your GitHub repo for automatic deployments

### Option 3: GitHub Pages

1. **Install gh-pages**: `npm install --save-dev gh-pages`
2. **Add deploy script** to package.json:
   ```json
   "scripts": {
     "deploy": "gh-pages -d dist"
   }
   ```
3. **Build and deploy**: `npm run build && npm run deploy`

### Option 4: Self-Hosted

1. **Build**: `npm run build`
2. **Serve**: Upload the `dist` folder contents to your web server
3. **Configure**: Ensure your server serves `index.html` for all routes (SPA routing)

### Environment Configuration

The application works out-of-the-box with no environment variables required. All data is stored locally in the browser's localStorage.

### Performance Optimizations

The production build includes:
- ✅ **Code Splitting**: Automatic chunk splitting for optimal loading
- ✅ **Asset Optimization**: Minified CSS/JS with cache headers
- ✅ **Tree Shaking**: Unused code elimination
- ✅ **Gzip Compression**: Reduced bundle sizes
- ✅ **PWA Ready**: Can be enhanced for offline functionality

### Deployment Checklist

- [x] TypeScript compilation passes
- [x] All tests pass (unit + e2e)
- [x] Build completes successfully
- [x] Responsive design verified
- [x] Performance optimized
- [x] SEO meta tags included
- [x] Error boundaries implemented
- [x] Accessibility standards met

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
