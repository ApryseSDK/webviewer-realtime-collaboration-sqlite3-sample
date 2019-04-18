# WebViewer Real Time Collaboration Sample - using WebSocket, SQLite3 and Node.js server

[WebViewer](https://www.pdftron.com/webviewer) is a powerful JavaScript-based PDF Library that's part of the [PDFTron PDF SDK](https://www.pdftron.com). It allows you to view and annotate PDF files on your web app with a fully customizable UI.

![WebViewer](https://www.pdftron.com/downloads/pl/webviewer-ui.png)

This is a WebViewer sample to show how you can construct a real time collaboration server for WebViewer through WebSocket, SQLite3, and Node.js server.

The below diagram depicts the structure of the real time collaboration sample app. 

![Alt text](/real-time-structure.png "Structure")


## Initial setup

Before you begin, make sure your development environment includes [Node.js](https://nodejs.org/en/).

## Install

```
git clone https://github.com/PDFTron/webviewer-real-time-collaboration-sqlite3-sample.git
cd webviewer-real-time-collaboration-sqlite3-sample.git
npm install
```

## Run

```
npm start
```

## How to use

- Open browser window in incognito mode and go to [port 3000](http://localhost:3000/index.html)
- Create annotations with annotations tools in the header
- See the changes being applied in real time in other windows
- You can access the real time server from a different device in the same network via replacing `localhost` in your URL to the server's IP address.

## Contributing

See [contributing](./CONTRIBUTING.md).

## License

See [license](./LICENSE).