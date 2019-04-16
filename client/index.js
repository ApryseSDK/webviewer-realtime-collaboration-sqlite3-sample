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

const hostName = window.location.hostname;
const url = `ws://${hostName}:8080`;
const connection = new WebSocket(url);
connection.onerror = error => {
  console.warn(`Error from WebSocket: ${error}`);
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
      annotations.forEach((annotation, i) => {
        setTimeout(()=>{connection.send(convertXfdfString(DOCUMENT_ID, annotation.Id, xfdfStrings));
        },i*1000);
      });
    }
  });

  connection.onmessage = (message) => {
    const currentAnnotationList = annotManager.getSelectedAnnotations();
    const annotation = JSON.parse(message.data);
    const annotations = annotManager.importAnnotCommand(annotation.xfdfString);
    annotManager.drawAnnotationsFromList(annotations);
    annotManager.selectAnnotations(currentAnnotationList);
  }
});

viewerElement.addEventListener('documentLoaded', () => {
  loadXfdfStrings(DOCUMENT_ID).then((rows) => {
    JSON.parse(rows).forEach(row => {
      const annotations = annotManager.importAnnotCommand(row.xfdfString);
      annotManager.drawAnnotationsFromList(annotations);
    });
  });
});

const convertXfdfString = (documentId, annotationId, xfdfString) => {
  return JSON.stringify({
    documentId,
    annotationId,
    xfdfString
  });
}

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
};
