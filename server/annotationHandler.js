// WARNING: In this sample, the query inputs are not sanitized. For production use, you should use sql builder
// libraries like Knex.js (https://knexjs.org/) to prevent SQL injection.

const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const TABLE = 'annotations';
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });
const DOCUMENT_ID = 'webviewer-demo-1';

module.exports = (app) => {
  
  // Create and initialize database
  if (!fs.existsSync('server/xfdf.db')) { 
    fs.writeFileSync('server/xfdf.db', '');
  }
  const db = new sqlite3.Database('./xfdf.db');
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS ${TABLE} (documentId TEXT, annotationId TEXT PRIMARY KEY, xfdfString TEXT)`);
  });
  db.close();

  // Connection to WebSocket server
  wss.on('connection', ws => {    
    ws.on('message', message => {
      const db = new sqlite3.Database('./xfdf.db');
      const documentId = JSON.parse(message).documentId;
      const annotationId = JSON.parse(message).annotationId;
      const xfdfString = JSON.parse(message).xfdfString.replace(/\'/g, `''`);
      const isDeleteCommand = xfdfString.includes('<delete>');
      console.log(isDeleteCommand);
      db.serialize(() => {
        db.run(`INSERT OR REPLACE INTO ${TABLE} VALUES ('${documentId}', '${annotationId}', '${xfdfString}')`, error => {  
          if (error) {
            console.warn(`Error occurred saving annotations to database: ${JSON.stringify(error)}`);
          }
        });
      });
      db.close();
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && ws !== client) {
          client.send(message);
        } 
      });
    })
  });

  app.get('/server/annotationHandler.js', (req,res) => {
    const documentId = req.query.documentId;
    const db = new sqlite3.Database('./xfdf.db');
    db.all(`SELECT annotationId, xfdfString FROM ${TABLE} WHERE documentId = '${documentId}'`, (err, rows) => {
      if(err) {
        res.status(204);
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(rows);
      }
      res.end();
    });
    db.close();
  });
}

// assign random names to users 
// when deleting, delete children first
// open the left panel automatically