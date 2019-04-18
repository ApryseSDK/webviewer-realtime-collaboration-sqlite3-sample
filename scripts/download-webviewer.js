const download = require('download');
const decompress = require('decompress');
const fs = require('fs-extra');

let downloadedSize = 0;

process.stdout.write('\n');

download(`https://www.pdftron.com/downloads/WebViewer.zip`, '.')
  .on('data', data => {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    downloadedSize += data.length;
    process.stdout.write(`Downloading WebViewer... ${(downloadedSize / 100000000 * 100).toFixed(1)}%`);
  })
  .then(() => {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`Downloading WebViewer... 100%\nDownload completed.\n\nExtracting WebViewer... `);
    fs.removeSync('client/lib')
    decompress('WebViewer.zip', 'client').then(() => {
      // Trim down office, pdf and ui-legacy
      // It's highly recommended to use XOD for cordova apps for highest performance
      fs.moveSync('client/WebViewer/lib', 'client/lib');
      fs.removeSync('client/WebViewer');
      fs.removeSync('client/lib/core/pdf/full');
      fs.removeSync('client/lib/ui-legacy');
      fs.removeSync('client/lib/package.json');
      fs.removeSync('client/lib/webviewer.js');
      fs.moveSync('client/lib/ui/build', 'client/lib/temp');
      fs.removeSync('client/lib/ui');
      fs.moveSync('client/lib/temp', 'client/lib/ui/build');
      fs.removeSync('WebViewer.zip');
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write(`Extracting WebViewer... 100%\nExtract completed.\n\n\n`);
    }).catch((err) => {
      console.log(err);
    });
  });