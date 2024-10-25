# Chrome DevTools Protocol Automation

This project provides utilities for automating Chrome using the Chrome DevTools Protocol. It includes tools for taking full-page screenshots, dumping HTML, and generating timeline data.

## Prerequisites

- Node.js (v14 or higher recommended)
- Google Chrome browser
- Chrome must be running with remote debugging enabled

## Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

## Usage

### Running Scripts

To run any script in the project just type the command: node script.js. For example-

```bash
node screenshot.js
```

## Running Chrome with Remote Debugging

To use this tool, Chrome must be running with remote debugging enabled. Start Chrome with:

Windows:

```bash
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222
```

macOS:

```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
```

Linux:

```bash
google-chrome --remote-debugging-port=9222
```

## Project Structure

- `screenshot.js`: Captures full-page screenshots of websites
- `dumpHtml.js`: Utility for dumping page HTML
- `generateTimelineData.js`: Generates performance timeline data
- `jackson.js`: Code given by Jackson

## License

ISC
