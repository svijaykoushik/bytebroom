# Contributing to ByteBroom 🧹

Thank you for your interest in making ByteBroom better! We welcome contributions from everyone, whether you're a
developer, designer, or user drowning in duplicate files. This guide will help you get started quickly and effectively.

---

## 🛠️ How to Contribute

### **Before You Start**

- **Read the Docs**: Familiarize yourself with the [README](README.md) and [LICENSE](LICENSE).
- **Check for Existing Work**: Search [open issues](https://github.com/svijaykoushik/bytebroom/issues)
  and [pull requests](https://github.com/svijaykoushik/bytebroom/pulls) to avoid duplication .
- **Ask Questions**: Unsure where to start? Open a discussion
  in [GitHub Discussions](https://github.com/svijaykoushik/bytebroom/discussions).

---

## 🧑💻 Code Contributions

### **Setting Up**

1. **Fork the Repository**: Click "Fork" at the top-right of
   the [ByteBroom repo](https://github.com/svijaykoushik/bytebroom).
2. **Clone Locally**:
   ```bash
   git clone https://github.com/svijaykoushik/bytebroom.git
   cd ByteBroom
   npm install
   ```
3. **Create a Branch**:
   ```bash
   git checkout -b feat/your-feature-name  # For features
   git checkout -b fix/your-bug-name       # For bug fixes
   ```

### **Making Changes**

- **Follow Conventions**:
    - Use **ESLint** for code formatting (`npm run lint`).
    - Write **JSDoc comments** for new functions .
- **Test Thoroughly**:
  ```bash
  npm test       # Run unit tests
  npm run scan   # Test the CLI with sample directories
  ```

### **Submitting a Pull Request**

1. **Push Changes**:
   ```bash
   git push origin your-branch-name
   ```
2. **Open a PR**:
    - Describe your changes clearly, linking to related issues.
    - Include screenshots or GIFs for UI/UX changes (use [LICEcap](https://www.cockos.com/licecap/)) .
3. **Address Feedback**: Respond promptly to review comments.

---

## 🐛 Reporting Bugs

**Good bug reports** help us fix issues faster. Before submitting:

1. **Check for Duplicates**: Search [existing issues](https://github.com/svijaykoushik/bytebroom/issues).
2. **Reproduce the Issue**: Test on the latest version of ByteBroom (`npm update -g bytebroom`).
3. **Provide Details**:
   ```markdown
   ### Environment
   - OS: [e.g., macOS Sonoma 14.3]
   - Node.js: `node -v`
   - ByteBroom: `bytebroom --version`

   ### Steps to Reproduce
   1. Run `npx bytebroom ~/Downloads --fast`
   2. Observe error: "Cannot read property 'hash' of undefined"

   ### Expected vs. Actual Behavior
   - Expected: Scan completes with duplicate list.
   - Actual: Crash with stack trace .
   ```

---

## 🚀 Suggesting Enhancements

Have an idea to make ByteBroom **faster** or **simpler**? Open an issue with:

- **Use Case**: Why is this valuable for users drowning in duplicates?
- **Mockups**: Attach sketches or Figma links for UI changes.
- **Alternatives**: Explain other approaches you considered.

---

## 📖 Improving Documentation

Help us keep ByteBroom **easy** for everyone:

- Fix typos in the README or CLI help text.
- Add translations (create a `docs/lang/[language-code].md` file).
- Write tutorials (e.g., "Cleaning Photo Libraries with ByteBroom").

---

## 🧹 Code of Conduct

ByteBroom follows the [Contributor Covenant 2.1](CODE_OF_CONDUCT.md). By participating, you agree to:

- Use welcoming, inclusive language.
- Respect differing viewpoints.
- Report unacceptable behavior to [svijaykoushik@hotmail.com](mailto:svijaykoushik@hotmail.com) .

---

## 🙌 Recognition

All contributors are listed in [ACKNOWLEDGEMENTS.md](ACKNOWLEDGEMENTS.md). Notable contributions earn a shoutout on
Twitter ([@ByteBroom](https://twitter.com/ByteBroom))!