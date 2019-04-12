// WARNING: In this sample, the query inputs are not sanitized. For production use, you should use sql builder
// libraries like Knex.js (https://knexjs.org/) to prevent SQL injection.

const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const TABLE = 'annotations';
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

module.exports = (app) => {
  if (!fs.existsSync('server/xfdf.db')) { 
    fs.writeFileSync('server/xfdf.db', '');
  }
  const db = new sqlite3.Database('./xfdf.db');
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS ${TABLE} (documentId TEXT, annotationId TEXT PRIMARY KEY, xfdfString TEXT)`);
  });
  db.close();
  wss.on('connection', ws => {
    app.post('/server/annotationHandler.js', (req, res) => {
      const documentId = req.query.documentId;
      const annotationId = JSON.parse(req.body).annotationId;
      const xfdfString = JSON.parse(req.body).xfdfString.replace(/\'/g, `''`);
      const db = new sqlite3.Database('./xfdf.db');
      db.serialize(() => {
        db.run(`INSERT OR REPLACE INTO ${TABLE} VALUES ('${documentId}', '${annotationId}', '${xfdfString}')`, error => {  
          if (error) {
            res.status(500).end();
          } else {
            res.status(200).end();
          }
        });
      });
      db.close();
      res.end();

      // Broadcast to clients through WebSocket
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send();
        } 
      });
    });
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