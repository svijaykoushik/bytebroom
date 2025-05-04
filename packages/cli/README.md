# ByteBroom CLI 🧹

[![Version](https://img.shields.io/npm/v/@bytebroom/cli)](https://www.npmjs.com/package/@bytebroom/cli) [![License](https://img.shields.io/badge/license-MIT-green)](../LICENSE) [![Downloads](https://img.shields.io/npm/dt/@bytebroom/cli)](https://www.npmjs.com/package/@bytebroom/cli)

The **ByteBroom Command-Line Interface (CLI)** provides a **fast**, **simple**, and **open-source** way to find and clean duplicate files directly from your terminal. It's designed to **easily** declutter your photos, documents, and downloads, making it perfect for **digital hoarders**, photographers, and anyone drowning in duplicate files! This interface leverages the core functionality of ByteBroom to offer a powerful duplicate file management solution.

---

## ✨ **Key Features (CLI)**

- **Hash-Based Duplicate Detection**: Quickly identifies duplicate files using hash comparisons.
- **Effortless Cleanup**: Allows users to manually select duplicates for removal, ensuring safety.
- **Cross-Platform**: Works seamlessly on Windows, macOS, and Linux, providing a consistent command-line experience.
- **Basic File filtering**: Allows scanning only specific file types (e.g., jpg,png,txt).
- **Basic File Type Exclusion**: Supports excluding certain file types from scans.
- **Automatic Trash Management**: Deleted files are moved to the system trash instead of being permanently removed.

---

## 🚀 **Quick Start**

### **Installation**

Ensure you have Node.js installed. You can install the ByteBroom CLI globally using npm:

```bash
# Install the ByteBroom CLI globally
npm install -g @bytebroom/cli
```

This command makes the `bytebroom` command available in your terminal.

### **Basic Usage**

Navigate to your terminal and use the `bytebroom` command followed by the path to the directory you want to scan:

```bash
# Scan a folder for duplicates (e.g., cluttered photo libraries)
bytebroom /path/to/your/folder
```

For a quicker scan focusing on larger files, use the `--fast` option:

```bash
# Fast mode (quick scan for large files)
bytebroom ~/Pictures --fast
```

### **Advanced Options**

The ByteBroom CLI offers several options to customize your duplicate file management:

```bash
# Exclude specific file types (e.g., RAW photos, logs)
bytebroom /path/to/folder --exclude "*.CR2, *.log"
```

```bash
# Filter results to specific file types (e.g., only images)
bytebroom /path/to/folder --filter "jpg,png,txt"
```

-----

### 🔜 Upcoming Features
- **Better Pagination Navigation** – Making it easier to browse through duplicates seamlessly.
- **Caching Scan Results** – Avoid full rescans when canceling or modifying selections.
- **Quick Scan Mode** – Detect duplicates based on filename similarity and file size.
- **Automated Cleanup (--clean option)** – Enable bulk file removal with confirmation prompts for a smoother workflow.

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