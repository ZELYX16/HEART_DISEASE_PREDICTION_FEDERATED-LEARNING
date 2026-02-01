# 🚀 COMPLETE SETUP GUIDE - START HERE!

## 📋 What You'll Need

1. **Node.js** (version 16 or higher)
   - Download from: https://nodejs.org/
   - Choose the "LTS" (Long Term Support) version
   - This includes npm (Node Package Manager)

2. **A Code Editor** (optional but recommended)
   - VS Code: https://code.visualstudio.com/
   - Or any text editor you prefer

3. **Terminal/Command Prompt**
   - Windows: Command Prompt, PowerShell, or Windows Terminal
   - Mac: Terminal app
   - Linux: Your preferred terminal

---

## 🎯 STEP-BY-STEP INSTRUCTIONS

### ✅ Step 1: Verify Node.js Installation

Open your terminal and run:

```bash
node --version
npm --version
```

**Expected output:**
```
v18.17.0  (or similar)
9.6.7     (or similar)
```

**If you get "command not found":**
- Node.js is not installed
- Install it from https://nodejs.org/
- Restart your terminal after installation

---

### ✅ Step 2: Download and Extract Project

1. **Download all files** from the interface above
2. **Extract** the `heart-disease-predictor` folder to your desired location
   - For example: Desktop, Documents, or Projects folder

---

### ✅ Step 3: Open Terminal in Project Folder

**Windows:**
- Navigate to the `heart-disease-predictor` folder in File Explorer
- Click in the address bar, type `cmd`, press Enter

**Mac:**
- Right-click the `heart-disease-predictor` folder
- Select "New Terminal at Folder"

**Alternative for all systems:**
```bash
cd path/to/heart-disease-predictor
```

For example:
```bash
# Windows
cd C:\Users\YourName\Desktop\heart-disease-predictor

# Mac/Linux
cd ~/Desktop/heart-disease-predictor
```

---

### ✅ Step 4: Install Dependencies

In the terminal, run:

```bash
npm install
```

**What this does:**
- Downloads React, Vite, and all required libraries
- Creates a `node_modules` folder (this may be large, ~200MB)
- Creates a `package-lock.json` file
- Takes 1-3 minutes depending on your internet speed

**Expected output:**
```
added 234 packages, and audited 235 packages in 45s

89 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

**If you see errors:**
- Make sure you're in the correct folder (should have `package.json`)
- Check your internet connection
- Try running as administrator (Windows) or with `sudo` (Mac/Linux)

---

### ✅ Step 5: Configure Backend URL (IMPORTANT!)

1. **Open the `.env` file** in the project folder
   - Use any text editor (Notepad, VS Code, etc.)

2. **Update the backend URL:**

```env
VITE_API_URL=http://localhost:5000
```

**Replace** `http://localhost:5000` with your actual backend URL.

Examples:
- Local backend: `http://localhost:5000`
- Remote backend: `http://192.168.1.100:8000`
- Cloud backend: `https://your-api.herokuapp.com`

**Save the file** after editing!

---

### ✅ Step 6: Start the Development Server

In the terminal, run:

```bash
npm run dev
```

**Expected output:**
```
  VITE v5.0.0  ready in 523 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**Your browser should automatically open** to http://localhost:3000

**If it doesn't open automatically:**
- Manually open your browser
- Go to: http://localhost:3000

---

### ✅ Step 7: Verify Everything Works

You should see the **CardioPredict AI** landing page with three cards:
1. Clinical Data Analysis
2. ECG Image Analysis
3. Comprehensive Analysis

**Click on any card** to test the interface!

---

## 🧪 Testing Without Backend

You can test the frontend even if your backend isn't ready yet:

1. **Select a mode** (e.g., Clinical Data Analysis)
2. **Fill in the form** with test data:
   - Age: `18393`
   - Gender: `Male`
   - Height: `168`
   - Weight: `62`
   - Systolic BP: `110`
   - Diastolic BP: `80`
   - All other fields: Choose any values
3. **Click Submit**
   - You'll get an error about backend connection (this is expected!)
   - But you can verify that form validation works

---

## 🔧 Common Issues and Solutions

### Issue 1: "npm: command not found"

**Problem:** Node.js is not installed or not in PATH

**Solution:**
1. Install Node.js from https://nodejs.org/
2. Restart your terminal
3. Try again

---

### Issue 2: "Cannot find module 'react'"

**Problem:** Dependencies not installed

**Solution:**
```bash
npm install
```

---

### Issue 3: Port 3000 is already in use

**Problem:** Another application is using port 3000

**Solution 1 - Use different port:**
```bash
npm run dev -- --port 3001
```

**Solution 2 - Kill the process:**

**Windows:**
```cmd
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

**Mac/Linux:**
```bash
lsof -ti:3000 | xargs kill -9
```

---

### Issue 4: Blank/White Screen

**Problem:** Build error or file location issue

**Solution:**
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Make sure all files are in correct locations:
   ```
   heart-disease-predictor/
   ├── src/
   │   ├── main.jsx
   │   └── heart-disease-predictor.jsx
   ├── index.html
   ├── package.json
   └── vite.config.js
   ```

---

### Issue 5: API Calls Fail / CORS Errors

**Problem:** Backend not configured or CORS issues

**Solution:**

1. **Make sure backend is running:**
   ```bash
   # In a separate terminal, start your backend
   python app.py
   # or
   uvicorn main:app --reload
   ```

2. **Configure CORS on backend:**

   **Flask:**
   ```python
   from flask_cors import CORS
   CORS(app, origins=["http://localhost:3000"])
   ```

   **FastAPI:**
   ```python
   from fastapi.middleware.cors import CORSMiddleware
   
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:3000"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

3. **Verify backend URL in `.env` is correct**

---

## 📁 Project Structure

```
heart-disease-predictor/
│
├── src/                          # Source code
│   ├── main.jsx                 # React entry point ✅
│   └── heart-disease-predictor.jsx  # Main component ✅
│
├── .env                          # Backend URL config ✅
├── index.html                    # HTML template ✅
├── package.json                  # Dependencies ✅
├── vite.config.js               # Build config ✅
│
├── node_modules/                 # Installed packages (auto-created)
└── package-lock.json             # Dependency versions (auto-created)
```

---

## 🎨 What Each File Does

| File | Purpose |
|------|---------|
| `src/main.jsx` | Entry point that loads React and your app |
| `src/heart-disease-predictor.jsx` | Main app component with all UI |
| `index.html` | HTML shell that loads the React app |
| `package.json` | Lists all dependencies and scripts |
| `vite.config.js` | Configuration for Vite build tool |
| `.env` | Your backend API URL (not committed to git) |

---

## 🌐 Accessing from Other Devices

To access from phone or another computer on same network:

1. **Find your computer's IP address:**

   **Windows:**
   ```cmd
   ipconfig
   ```
   Look for "IPv4 Address" (e.g., `192.168.1.5`)

   **Mac/Linux:**
   ```bash
   ifconfig | grep "inet "
   ```

2. **Restart dev server with `--host`:**
   ```bash
   npm run dev -- --host
   ```

3. **Access from other device:**
   ```
   http://192.168.1.5:3000
   ```
   (Replace with your actual IP)

---

## 🛑 Stopping the Server

Press `Ctrl + C` in the terminal where the server is running.

To start again: `npm run dev`

---

## 📱 Next Steps After Setup

1. ✅ Verify frontend loads correctly
2. ✅ Test form validation
3. ✅ Set up your backend
4. ✅ Configure CORS on backend
5. ✅ Test full integration (frontend → backend → response)
6. ✅ Customize design/branding if needed

---

## 🆘 Still Having Issues?

1. **Read error messages carefully** - they usually tell you what's wrong
2. **Check browser console** (F12 → Console tab)
3. **Verify file structure** matches the diagram above
4. **Make sure backend is running** on the URL specified in `.env`
5. **Try deleting `node_modules` and running `npm install` again**

---

## 📚 Useful Commands Reference

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Use different port
npm run dev -- --port 3001

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## ✅ Success Checklist

- [ ] Node.js installed and working
- [ ] Project downloaded and extracted
- [ ] Terminal opened in project folder
- [ ] `npm install` completed successfully
- [ ] `.env` file configured with backend URL
- [ ] `npm run dev` starts successfully
- [ ] Browser opens to http://localhost:3000
- [ ] Landing page displays correctly
- [ ] Can click on mode cards
- [ ] Form validation works
- [ ] Backend connected (or aware of how to connect)

---

## 🎉 You're Ready!

If you've completed all the steps above, your frontend is ready to use!

**Remember:** The frontend will work for testing UI and validation even without a backend. Connect your backend when you're ready to get actual predictions.

**Happy coding! 🚀**
