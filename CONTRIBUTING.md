# Contributing to ByteBroom 🧹

Thank you for your interest in making ByteBroom better! We welcome contributions from everyone, whether you're a
developer, designer, or user drowning in duplicate files. This guide will help you get started quickly and effectively, ensuring your contributions land in the right place.

---

## 🛠️ How to Contribute

### **Before You Start**

  - **Read the Docs**: Familiarize yourself with the [README](README.md) and [LICENSE](LICENSE).
  - **Understand the Architecture**: ByteBroom is organized into packages. The core logic resides in the `packages/core` directory, and the command-line interface is in `packages/cli`. Please consider this when choosing where to contribute.
  - **Check for Existing Work**: Search [open issues](https://github.com/svijaykoushik/bytebroom/issues)
    and [pull requests](https://github.com/svijaykoushik/bytebroom/pulls) to avoid duplication. Pay attention to which package the issue or PR relates to.
  - **Ask Questions**: Unsure where to start or which package your contribution belongs to? Open a discussion
    in [GitHub Discussions](https://github.com/svijaykoushik/bytebroom/discussions).

-----

## 🧑💻 Code Contributions

When contributing code, please ensure your changes are made within the relevant package (`packages/core` or `packages/cli`).

### **Setting Up**

1.  **Fork the Repository**: Click "Fork" at the top-right of
    the [ByteBroom repo](https://github.com/svijaykoushik/bytebroom).
2.  **Clone Locally**:
    ```bash
    git clone https://github.com/svijaykoushik/bytebroom.git
    cd ByteBroom
    npm install
    ```
3.  **Navigate to the Relevant Package**: Before creating a branch, decide whether your contribution belongs to the core logic or the CLI application and navigate into the respective directory:
    ```bash
    cd packages/core        # For core logic changes
    # OR
    cd packages/cli         # For CLI specific changes
    ```
4.  **Create a Branch**:
    ```bash
    git checkout -b feat/your-feature-name  # For features
    git checkout -b fix/your-bug-name       # For bug fixes
    ```

### **Making Changes**

  - **Follow Conventions**:
      - Use **ESLint** for code formatting (`npm run lint` from the root directory). This will lint all packages. You can also lint individual packages by running `npm run lint` within the package directory.
      - Write **JSDoc comments** for new functions within the relevant package.
  - **Test Thoroughly**: Ensure your tests are placed within the `test` directory of the package you are working on.
    ```bash
    npm test       # Run unit tests for all packages
    # OR
    cd packages/core && npm test  # Run core unit tests
    # OR
    cd packages/cli && npm test   # Run CLI unit tests
    npm run scan   # Test the CLI with sample directories (run from the root)
    ```

### **Submitting a Pull Request**

1.  **Push Changes**: Ensure you are in the root directory when pushing.
    ```bash
    git push origin your-branch-name
    ```
2.  **Open a PR**:
      - Describe your changes clearly, linking to related issues. **Please indicate which package your PR primarily affects (core or cli).**
      - Include screenshots or GIFs for UI/UX changes (use [LICEcap](https://www.cockos.com/licecap/)).
3.  **Address Feedback**: Respond promptly to review comments. Be prepared to make changes to ensure your contribution aligns with the project's architecture and goals for the specific package.

-----

## 🐛 Reporting Bugs

When reporting bugs, please specify whether the issue seems to be within the core logic or the CLI application. This helps us direct our attention to the correct package.

**Good bug reports** help us fix issues faster. Before submitting:

1.  **Check for Duplicates**: Search [existing issues](https://github.com/svijaykoushik/bytebroom/issues). Note if the existing issue specifies a package.
2.  **Reproduce the Issue**: Test on the latest version of ByteBroom (`npm update -g bytebroom`).
3.  **Provide Details**:
    ```markdown
    ### Environment
    - OS: [e.g., macOS Sonoma 14.3]
    - Node.js: `node -v`
    - ByteBroom: `bytebroom --version`
    - **Package (if known):** [core or cli]

    ### Steps to Reproduce
    1. Run `npx bytebroom ~/Downloads --fast`
    2. Observe error: "Cannot read property 'hash' of undefined"

    ### Expected vs. Actual Behavior
    - Expected: Scan completes with duplicate list.
    - Actual: Crash with stack trace.
    ```

-----

## 🚀 Suggesting Enhancements

When suggesting enhancements, please consider which part of the application your suggestion targets (core functionality or CLI user experience).

Have an idea to make ByteBroom **faster** or **simpler**? Open an issue with:

  - **Use Case**: Why is this valuable for users drowning in duplicates? Specify if this relates to the core scanning process or the CLI interface.
  - **Mockups**: Attach sketches or Figma links for UI changes, if applicable to the CLI.
  - **Alternatives**: Explain other approaches you considered.

-----

## 📖 Improving Documentation

Help us keep ByteBroom **easy** for everyone:

  - Fix typos in the README or CLI help text.
  - Add translations (create a `docs/lang/[language-code].md` file).
  - Write tutorials (e.g., "Cleaning Photo Libraries with ByteBroom"). If your tutorial focuses on CLI usage, please make that clear.

-----

## 🧹 Code of Conduct

ByteBroom follows the [Contributor Covenant 2.1](CODE_OF_CONDUCT.md). By participating, you agree to:

  - Use welcoming, inclusive language.
  - Respect differing viewpoints.
  - Report unacceptable behavior to [svijaykoushik@hotmail.com](mailto:svijaykoushik@hotmail.com).

-----

## 🙌 Recognition

All contributors are listed in [ACKNOWLEDGEMENTS.md](ACKNOWLEDGEMENTS.md). Notable contributions earn a shoutout on
Twitter ([@ByteBroom](https://twitter.com/ByteBroom))\! We may also specifically mention contributions to the core or CLI packages.