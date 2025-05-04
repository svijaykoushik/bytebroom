# ByteBroom CLI 🧹

[![Version](https://img.shields.io/npm/v/bytebroom)](https://www.npmjs.com/package/bytebroom) [![License](https://img.shields.io/badge/license-MIT-green)](../LICENSE) [![Downloads](https://img.shields.io/npm/dt/bytebroom)](https://www.npmjs.com/package/bytebroom)

The **ByteBroom Command-Line Interface (CLI)** provides a **fast**, **simple**, and **open-source** way to find and clean duplicate files directly from your terminal. It's designed to **easily** declutter your photos, documents, and downloads, making it perfect for **digital hoarders**, photographers, and anyone drowning in duplicate files! This interface leverages the core functionality of ByteBroom to offer a powerful duplicate file management solution.

---

## ✨ **Key Features (CLI)**

- **Lightning-Fast Scanning**: Quickly identify duplicates using file size, hash, and type comparisons initiated through simple commands.
- **Effortless Cleanup**: Offers straightforward commands for one-click removal or interactive selection of duplicates for safe cleaning.
- **Cross-Platform**: Works seamlessly on Windows, macOS, and Linux, providing a consistent command-line experience.
- **Flexible Options**: Supports excluding specific file types and backing up duplicates before deletion for added safety.

---

## 🚀 **Quick Start**

### **Installation**

Ensure you have Node.js installed. You can install the ByteBroom CLI globally using npm:

```bash
# Install the ByteBroom CLI globally
npm install -g bytebroom
````

This command makes the `bytebroom` command available in your terminal.

### **Basic Usage**

Navigate to your terminal and use the `bytebroom` command followed by the path to the directory you want to scan:

```bash
# Scan a folder for duplicates (e.g., cluttered photo libraries)
npx bytebroom /path/to/your/folder
```

For a quicker scan focusing on larger files, use the `--fast` option:

```bash
# Fast mode (quick scan for large files)
npx bytebroom ~/Pictures --fast
```

To delete the identified duplicates (with confirmation prompts), use the `--clean` option:

```bash
# Delete duplicates (with confirmation prompts)
npx bytebroom ~/Downloads --clean
```

### **Advanced Options**

The ByteBroom CLI offers several options to customize your duplicate file management:

```bash
# Exclude specific file types (e.g., RAW photos, logs)
npx bytebroom /path/to/folder --exclude "*.CR2, *.log"
```

You can also create backups of the duplicates before deleting them using the `--backup` option:

```bash
# Backup duplicates before deleting (safety first!)
npx bytebroom /path/to/folder --clean --backup ~/backups
```

-----

## 🔧 **Who Is This For?**

  - 📸 **Photographers**: Quickly identify and remove duplicate image files (RAW, JPEG, etc.) cluttering your photo libraries through simple terminal commands.
  - 💻 **Developers**: Easily clean up redundant files in project directories using command-line automation.
  - 📁 **Everyone**: Reclaim disk space by efficiently finding and removing duplicate downloads, documents, and media files using a straightforward terminal interface.

-----

## 🌟 **Why Use the ByteBroom CLI?**

  - **Simplicity**: Features **simple** and intuitive commands for **easy** duplicate file management directly from your terminal.
  - **Safety First**: Provides options to preview duplicates and create backups before deletion, ensuring no accidental data loss.
  - **Automation-Friendly**: The command-line interface allows for easy integration into scripts and automated workflows.
  - **Leverages Core Power**: Built on top of ByteBroom's efficient core logic, ensuring fast and accurate duplicate detection.

-----

## 📦 **Contributing to the CLI**

If you're interested in contributing to the ByteBroom CLI, please see the main [Contribution Guide](../../CONTRIBUTING.md) for setup instructions and general guidelines. When contributing to the CLI package (`packages/cli`), focus on:

  - Improving the user experience of the command-line interface.
  - Adding new command-line options or functionalities.
  - Enhancing the output and feedback provided to the user in the terminal.
  - Writing and maintaining tests specifically for the CLI functionality within the `packages/cli` directory.

-----

## 📄 **License**

MIT License. See [LICENSE](../../LICENSE) for details.

*Sweep smarter, not harder, from your terminal.* 🧹