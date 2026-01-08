# Installing Node.js on Windows

## Quick Installation Guide

### Step 1: Download Node.js

1. Go to **https://nodejs.org/**
2. Download the **LTS version** (recommended, e.g., v20.x.x)
   - Click the big green "LTS" button
   - This will download an installer (`.msi` file)

### Step 2: Install Node.js

1. **Run the downloaded installer** (e.g., `node-v20.x.x-x64.msi`)
2. Click **"Next"** through the installation wizard
3. **Accept the license agreement**
4. Choose installation location (default is fine)
5. **IMPORTANT**: Make sure "Add to PATH" is checked (should be by default)
6. Click **"Install"**
7. Wait for installation to complete
8. Click **"Finish"**

### Step 3: Verify Installation

1. **Close and reopen** your PowerShell/terminal window
2. Run these commands to verify:

```powershell
node --version
npm --version
```

You should see version numbers like:
```
v20.11.0
10.2.4
```

### Step 4: Install Project Dependencies

Now you can run:

```powershell
npm install
```

This will install all the required packages for your Borneology website.

---

## Alternative: Using Chocolatey (Advanced)

If you have Chocolatey package manager:

```powershell
choco install nodejs-lts
```

---

## Troubleshooting

### "npm is not recognized" after installation?

1. **Close and reopen** your terminal/PowerShell
2. If still not working, check if Node.js is in PATH:
   - Search "Environment Variables" in Windows
   - Check if `C:\Program Files\nodejs\` is in your PATH
   - If not, add it manually

### Still having issues?

1. Restart your computer
2. Try installing from the official website again
3. Make sure you downloaded the Windows installer (not macOS/Linux)

---

## What Node.js Includes

- **Node.js** - JavaScript runtime for server-side code
- **npm** - Package manager (comes with Node.js)
- **npx** - Package runner (comes with Node.js)

Once installed, you can use all npm commands!

