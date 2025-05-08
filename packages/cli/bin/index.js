#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const semver = require('semver'); // For more robust version comparison

// Function to read package.json
function readPackageJson() {
    try {
        const packageJsonPath = path.join(__dirname, '..', 'package.json');
        const rawData = fs.readFileSync(packageJsonPath, 'utf8');
        return JSON.parse(rawData);
    } catch (error) {
        console.error('Error reading package.json:', error);
        process.exit(1);
    }
}

const packageJson = readPackageJson();
const requiredNodeVersion = packageJson.engines && packageJson.engines.node;
const currentVersion = process.version;

if (requiredNodeVersion && !semver.satisfies(currentVersion, requiredNodeVersion)) {
    console.error(
        `\x1b[31mError: @bytebroom/cli requires Node.js version ${requiredNodeVersion}. ` +
        `You are using ${currentVersion}.\x1b[0m`
    );
    process.exit(1);
}

require("../dist/index.js");