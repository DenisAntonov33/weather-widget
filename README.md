# Weather Widget

A modern, customizable weather widget built with Vue.js 3, TypeScript, and Web Components. Display weather information for multiple cities with a beautiful, responsive UI.

## 🌐 Live Demo

The application is deployed and available at: **[https://denisantonov33.github.io/weather-widget/](https://denisantonov33.github.io/weather-widget/)**

## ✨ Features

- 🌤️ Display weather for multiple cities
- 🔄 Drag and drop to reorder cities
- ➕ Add new cities with autocomplete search
- 🗑️ Remove cities (minimum one required)
- ⚙️ Settings panel for city management
- 📱 Responsive design
- 💾 Local storage persistence
- 📍 Automatic geolocation support
- 🎨 Modern gradient UI with smooth animations

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm
- OpenWeatherMap API key ([Get one here](https://openweathermap.org/api))

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd weather-widget
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory:

```bash
OPENWEATHER_API_KEY=your_api_key_here
```

You can use `.env.example` as a template.

## 💻 Development

### Run in Development Mode

Start the development server with hot reload:

```bash
npm run dev
```

The application will be available at `http://localhost:8080` and will automatically open in your browser.

## 🚢 Deployment

### Automatic Deployment (GitHub Pages)

The application is automatically deployed to GitHub Pages when you push to the `master` branch.

**Deployment Process:**

1. Push your changes to the `master` branch:

```bash
git push origin master
```

2. GitHub Actions will automatically:
   - Run linting checks
   - Run type checking
   - Run tests
   - Build the production bundle
   - Deploy to GitHub Pages

3. The deployment typically takes a few minutes. You can check the status in the **Actions** tab of your GitHub repository.

**Manual Deployment:**

You can also trigger deployment manually:

1. Go to your GitHub repository
2. Click on the **Actions** tab
3. Select **Deploy to GitHub Pages** workflow
4. Click **Run workflow**

### Deployment Requirements

- **GitHub Secrets:** Make sure you have `OPENWEATHER_API_KEY` set in your repository secrets:
  1. Go to repository **Settings** → **Secrets and variables** → **Actions**
  2. Add a new secret named `OPENWEATHER_API_KEY`
  3. Paste your OpenWeatherMap API key

- **GitHub Pages:** Ensure GitHub Pages is enabled:
  1. Go to repository **Settings** → **Pages**
  2. Source should be set to **GitHub Actions**

### Build for Production Locally

To build the production bundle locally:

```bash
npm run build
```

The built files will be in the `dist/` directory.
