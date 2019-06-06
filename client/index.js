const viewerElement = document.getElementById('viewer');
const myWebViewer = new PDFTron.WebViewer({
  path: 'lib', // path to the PDFTron 'lib' folder
  initialDoc: 'https://pdftron.s3.amazonaws.com/downloads/pl/webviewer-demo.pdf',
}, viewerElement);
let annotManager = null;
const DOCUMENT_ID = 'webviewer-demo-1';
const hostName = window.location.hostname;
const url = `ws://${hostName}:8080`;
const connection = new WebSocket(url);
const nameList = ['Andy','Andrew','Logan', 'Justin', 'Matt', 'Sardor', 'Zhijie', 'James', 'Kristian', 'Mary', 'Patricia', 'Jennifer', 'Linda', 'David', 'Joseph', 'Thomas', 'Naman', 'Nancy', 'Sandra'];

connection.onerror = error => {
  console.warn(`Error from WebSocket: ${error}`);
}

// We need to wait for the viewer to be ready before we can use any APIs
viewerElement.addEventListener('ready', () => {
  const viewerInstance = myWebViewer.getInstance(); 
  // Instance is ready here
  viewerInstance.openElements(['leftPanel']);
  annotManager = viewerInstance.docViewer.getAnnotationManager();
  // Assign a random name to client
  annotManager.setCurrentUser(nameList[Math.floor(Math.random()*nameList.length)]);
  annotManager.on('annotationChanged', (e, annotations) => {
    // If annotation change is from import, return 
    if (e.imported) {
      return;
    }
    const xfdfString = annotManager.getAnnotCommand();
    annotations.forEach(annotation => {
      connection.send(JSON.stringify({
        documentId: DOCUMENT_ID,
        annotationId: annotation.Id,
        xfdfString
      }));
    });
  });

  connection.onmessage = (message) => {
    const annotation = JSON.parse(message.data);
    const annotations = annotManager.importAnnotCommand(annotation.xfdfString);
    annotManager.drawAnnotationsFromList(annotations);
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
