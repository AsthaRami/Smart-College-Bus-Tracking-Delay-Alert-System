# Quick Start Guide

## Prerequisites

Make sure you have **Node.js** installed on your system.
- Download from: https://nodejs.org/
- Recommended version: Node.js 18.x or higher
- Verify installation by running: `node --version` and `npm --version`

## Step-by-Step Instructions

### 1. Open Terminal/PowerShell

Navigate to your project directory:
```powershell
cd C:\wamp64\www\bus
```

### 2. Install Dependencies

Run this command to install all required packages:
```powershell
npm install
```

This will install:
- React and React DOM
- React Router
- Tailwind CSS
- Vite (build tool)
- Crypto-JS (for password hashing)
- And other dependencies

**Expected output:** You'll see a progress bar and then `node_modules` folder will be created.

### 3. Start Development Server

Run this command to start the development server:
```powershell
npm run dev
```

**Expected output:**
```
  VITE v5.0.8  ready in XXX ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### 4. Open in Browser

The application will automatically open in your default browser, or you can manually navigate to:
```
http://localhost:3000
```

### 5. Test the Application

- **Landing Page**: You'll see the homepage with Login, Sign Up, and Track Bus buttons
- **Click "Sign Up"**: Test the signup form with validation
- **Click "Login"**: Test the login form
- **Click "Track Bus (Demo)"**: View the demo tracking page

## Available Commands

### Development
```powershell
npm run dev
```
Starts the development server with hot-reload (changes reflect immediately)

### Build for Production
```powershell
npm run build
```
Creates an optimized production build in the `dist` folder

### Preview Production Build
```powershell
npm run preview
```
Preview the production build locally

## Troubleshooting

### Issue: `npm` command not found
**Solution:** Install Node.js from https://nodejs.org/

### Issue: Port 3000 already in use
**Solution:** 
- Close other applications using port 3000, OR
- Edit `vite.config.js` and change the port number

### Issue: Dependencies installation fails
**Solution:**
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -r node_modules
rm package-lock.json

# Reinstall
npm install
```

### Issue: Module not found errors
**Solution:** Make sure you ran `npm install` and all dependencies are installed

## Project Structure

After installation, your project should have:
```
bus/
├── node_modules/          # Installed dependencies
├── src/                   # Source code
├── index.html            # Entry HTML file
├── package.json          # Dependencies
└── vite.config.js        # Vite configuration
```

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Start dev server: `npm run dev`
3. ✅ Open browser: `http://localhost:3000`
4. 🔄 Integrate with your backend API (update API endpoints in SignupPage.jsx and LoginPage.jsx)

## Need Help?

- Check the main `README.md` for detailed documentation
- Verify Node.js version: `node --version` (should be 18+)
- Verify npm version: `npm --version` (should be 9+)

