# ByteBroom 🧹

[![Version](https://img.shields.io/npm/v/bytebroom)](https://www.npmjs.com/package/bytebroom) [![License](https://img.shields.io/badge/license-MIT-green)](LICENSE) [![Downloads](https://img.shields.io/npm/dt/bytebroom)](https://www.npmjs.com/package/bytebroom)

**ByteBroom** is a **fast**, **simple**, and **open-source** duplicate file **finder** and **cleaner** designed to *
*easily** declutter your photos, documents, and downloads. Perfect for **digital hoarders**, photographers, and anyone
drowning in duplicate files!

---

## ✨ **Key Features**

- **Lightning-Fast Scanning**: Instantly find duplicates using **file** size, hash, and type comparisons.
- **Effortless Cleanup**: **Simple** one-click removal or manual selection for safety.
- **Open & Transparent**: Free, open-source, and privacy-focused—no hidden data collection.
- **Cross-Platform**: Works on Windows, macOS, and Linux—**easy** setup for everyone.

---

## 🚀 **Quick Start**

### **Installation**

```bash
# Install globally (requires Node.js)  
npm install -g bytebroom  
```

### **Basic Usage**

```bash
# Scan a folder for duplicates (e.g., cluttered photo libraries)  
npx bytebroom /path/to/your/folder  

# Fast mode (quick scan for large files)  
npx bytebroom ~/Pictures --fast  

# Delete duplicates (with confirmation prompts)  
npx bytebroom ~/Downloads --clean  
```

### **Advanced Options**

```bash
# Exclude file types (e.g., RAW photos, logs)  
npx bytebroom /path/to/folder --exclude "*.CR2, *.log"  

# Backup duplicates before deleting (safety first!)  
npx bytebroom /path/to/folder --clean --backup ~/backups  
```

---

## 🔧 **Who Is This For?**

- 📸 **Photographers**: Clean up duplicate RAW/JPG files cluttering your workflow.
- 💻 **Developers**: Remove redundant project files with a terminal-friendly tool.
- 📁 **Everyone**: Reclaim your space from duplicate downloads, docs, and media.

---

## 🌟 **Why ByteBroom?**

- **No Technical Skills Needed**: **Simple** commands for **easy** cleanup.
- **Safe & Secure**: Preview before deleting—no accidental data loss.
- **Free Forever**: **Open-source** and community-driven.

---

## 📦 **Contributing**

Love ByteBroom? Help us improve! Check out our [Contribution Guide](CONTRIBUTING.md) to:

- 🐛 Report bugs or request features.
- 💡 Submit code improvements.
- 🌍 Translate for global users.

---

## 📄 **License**

MIT License. See [LICENSE](LICENSE) for details.

*Sweep smarter, not harder.* 🧹