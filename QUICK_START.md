# ⚡ SUPER QUICK START - 5 MINUTES!

## 📥 Step 1: Download
Download the `heart-disease-predictor` folder from above ⬆️

## 📂 Step 2: Open Terminal

### Windows:
1. Open the `heart-disease-predictor` folder
2. Click in the address bar
3. Type `cmd` and press Enter

### Mac:
1. Right-click the `heart-disease-predictor` folder
2. Select "New Terminal at Folder"

### Alternative (All systems):
```bash
cd /path/to/heart-disease-predictor
```

## ⬇️ Step 3: Install (One-time only)
```bash
npm install
```
⏱️ Takes 1-2 minutes. You'll see lots of text - this is normal!

## ⚙️ Step 4: Configure Backend
Open the `.env` file in any text editor and change:
```env
VITE_API_URL=http://localhost:5000
```
To your backend URL (e.g., `http://localhost:8000` or your server address)

## 🚀 Step 5: Run!
```bash
npm run dev
```

Browser will open automatically at: **http://localhost:3000** 🎉

---

## ✅ What You Should See

```
  VITE v5.0.0  ready in 523 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

**Browser opens → You see "CardioPredict AI" with 3 cards**

✨ **That's it! You're done!**

---

## 🧪 Quick Test (No Backend Needed)

1. Click "Clinical Data Analysis"
2. Fill in these values:
   - Age: `18393`
   - Gender: `Male`
   - Height: `168`
   - Weight: `62`
   - Systolic BP: `110`
   - Diastolic BP: `80`
   - Fill remaining fields with any values
3. Click "Analyze Health Data"

You'll get a connection error (expected without backend), but the form validation should work perfectly!

---

## 🆘 Common Errors & Quick Fixes

| Error | Fix |
|-------|-----|
| `npm: command not found` | Install Node.js from nodejs.org |
| `Cannot find module` | Run `npm install` |
| `Port 3000 in use` | Run `npm run dev -- --port 3001` |
| Blank page | Press F12, check Console for errors |
| API errors | Make sure backend is running & CORS configured |

---

## 📁 Files You Got

```
heart-disease-predictor/
├── src/
│   ├── main.jsx                    ⭐ React entry point
│   └── heart-disease-predictor.jsx ⭐ Main app
├── .env                             ⚙️ Backend URL (EDIT THIS!)
├── index.html                       📄 HTML template
├── package.json                     📦 Dependencies
├── vite.config.js                   🔧 Build config
├── README.md                        📖 Documentation
├── SETUP_INSTRUCTIONS.md            📚 Detailed guide
└── .gitignore                       🚫 Git ignore
```

---

## 🎯 Next Steps

1. ✅ Got it running? Great!
2. 🔌 Connect your backend (update `.env`)
3. 🧪 Test with real data
4. 🎨 Customize if needed
5. 🚀 Deploy when ready

---

## 📚 Need More Help?

- **Detailed setup:** Read `SETUP_INSTRUCTIONS.md`
- **Features & API:** Read `README.md`
- **Still stuck:** Check browser Console (F12)

---

## 💡 Pro Tips

- Keep terminal open while developing
- Browser auto-refreshes when you save files
- Press `Ctrl+C` to stop the server
- Run `npm run dev` to start again

**Happy coding! 🎉**
