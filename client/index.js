const viewerElement = document.getElementById('viewer');
const myWebViewer = new PDFTron.WebViewer({
  path: 'lib', // path to the PDFTron 'lib' folder on your server
  l: atob(window.licenseKey),
  initialDoc: 'https://pdftron.s3.amazonaws.com/downloads/pl/webviewer-demo.pdf',
  // initialDoc: '/path/to/my/file.pdf',  // You can also use documents on your server
}, viewerElement);
let viewerInstance = null;
let annotManager = null;
const DOCUMENT_ID = 'webviewer-demo-1';

// Replace with your ip address
const url = 'ws://192.168.10.154:8080';
const connection = new WebSocket(url);

connection.onopen = () => {
  connection.send('client message');
}

connection.onerror = error => {
  console.warn(`Error from WebSocket: ${error}`);
}

// When server broadcasts a message
connection.onmessage = () => {
  loadXfdfStrings(DOCUMENT_ID).then((rows) => {
    JSON.parse(rows).forEach(row => {
      const annotations = annotManager.importAnnotCommand(row.xfdfString);
      annotManager.drawAnnotationsFromList(annotations);
    });
  });
}

// We need to wait for the viewer to be ready before we can use any APIs
viewerElement.addEventListener('ready', function() {
  var viewerInstance = myWebViewer.getInstance(); // instance is ready here
  annotManager = viewerInstance.docViewer.getAnnotationManager();
  annotManager.on('annotationChanged', (e, annotations) => {
    if (e.imported) {
      return;
    } else {
      const xfdfStrings = annotManager.getAnnotCommand();
      annotations.forEach(annotation => {
        saveXfdfString(DOCUMENT_ID, annotation.Id, xfdfStrings);
      });
    }
  });
});

viewerElement.addEventListener('documentLoaded', () => {
  loadXfdfStrings(DOCUMENT_ID).then((rows) => {
    JSON.parse(rows).forEach(row => {
      const annotations = annotManager.importAnnotCommand(row.xfdfString);
      annotManager.drawAnnotationsFromList(annotations);
    });
  });
});


const saveXfdfString = (documentId, annotationId, xfdfString) => {
  return new Promise((resolve, reject) => {
    fetch(`/server/annotationHandler.js?documentId=${documentId}`, {
      method: 'POST',
      body: JSON.stringify({
        annotationId,
        xfdfString
      }),
    }).then((res) => {
      if (res.status < 400) {
        resolve(res);
      } else {
        reject(res);
      }
    });
  });
};

const loadXfdfStrings = (documentId) => {
  return new Promise((resolve, reject) => {
    fetch(`/server/annotationHandler.js?documentId=${documentId}`, {
      method: 'GET',
    }).then((res) => {
      if (res.status < 400) {
        res.text().then(xfdfStrings => {
          resolve(xfdfStrings);
        });
      } else {
        reject(res);
      }
    });
  });
}
