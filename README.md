# ByteBroom 🧹

**ByteBroom** is a **fast**, **simple**, and **open-source** duplicate file **finder** and **cleaner** designed to **easily** declutter your photos, documents, and downloads. Perfect for **digital hoarders**, photographers, and anyone drowning in duplicate files!

---

## ✨ **Project Overview**

ByteBroom provides a powerful and efficient way to identify and manage duplicate files on your system. It offers a command-line interface for easy automation and integration into your workflows.

### **Key Features**

- **Lightning-Fast Scanning**: Employs efficient algorithms leveraging file size, hash comparisons, and file type analysis for rapid duplicate detection.
- **Effortless Cleanup**: Offers both interactive selection and one-click removal options to safely manage identified duplicates.
- **Open & Transparent**: Being free and open-source ensures community scrutiny and a privacy-focused approach without hidden data collection.
- **Cross-Platform Compatibility**: Runs seamlessly on Windows, macOS, and Linux, providing a consistent experience across different operating systems.

---

## 📦 **Package Features**

ByteBroom's functionality is organized into distinct packages:

### `packages/core`: **Core Logic**

This package contains the fundamental algorithms and logic for scanning directories, identifying duplicate files based on various criteria (size, hash, type), and managing file operations. It provides the core functionality that powers the ByteBroom application.

### `packages/cli`: **Command-Line Interface**

This package provides the command-line interface that users interact with. It leverages the core logic from `packages/core` to offer a user-friendly way to initiate scans, configure options (like exclude patterns and backup directories), and perform cleanup operations directly from the terminal.

---

## 🚀 **Quick Start**

### **Installation**

```bash
# Install the ByteBroom CLI globally (requires Node.js)
npm install -g bytebroom
````

### **Basic Usage (via CLI)**

```bash
# Scan a folder for duplicates (e.g., cluttered photo libraries)
npx bytebroom /path/to/your/folder

# Fast mode (quick scan for large files)
npx bytebroom ~/Pictures --fast

# Delete duplicates (with confirmation prompts)
npx bytebroom ~/Downloads --clean
```

### **Advanced Options (via CLI)**

```bash
# Exclude file types (e.g., RAW photos, logs)
npx bytebroom /path/to/folder --exclude "*.CR2, *.log"

# Backup duplicates before deleting (safety first!)
npx bytebroom /path/to/folder --clean --backup ~/backups
```

-----

## 🔧 **Who Is This For?**

  - 📸 **Photographers**: Streamline your workflow by easily removing duplicate RAW and JPEG files.
  - 💻 **Developers**: Maintain clean project directories by eliminating redundant files through a terminal-based tool.
  - 📁 **Everyone**: Reclaim valuable disk space by efficiently identifying and removing duplicate downloads, documents, and media files.

-----

## 🌟 **Why ByteBroom?**

  - **User-Friendly**: Features **simple** commands for **easy** duplicate file management, requiring no advanced technical knowledge.
  - **Data Safety**: Emphasizes safety with preview options before deletion, preventing accidental data loss.
  - **Community-Driven**: Remains **free** and **open-source**, benefiting from community contributions and ensuring long-term sustainability.

-----

## 📦 **Contributing**

We welcome contributions to both the core logic and the CLI application\! Please see our [Contribution Guide](https://www.google.com/search?q=CONTRIBUTING.md) for details on how to:

  - 🐛 Report bugs or suggest enhancements for specific packages.
  - 💡 Contribute code to either the `packages/core` or `packages/cli` directories.
  - 🌍 Help with translations to make ByteBroom accessible to a global audience.

-----

## 📄 **License**

MIT License. See [https://www.google.com/search?q=LICENSE](https://www.google.com/search?q=LICENSE) for details.

*Sweep smarter, not harder.* 🧹