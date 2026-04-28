import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import multer from "multer";
import fs from "fs";
import archiver from "archiver";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("database.sqlite");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT,
    admission TEXT,
    role TEXT,
    status TEXT,
    supervisor TEXT
  );

  CREATE TABLE IF NOT EXISTS certificates (
    id TEXT PRIMARY KEY,
    np TEXT,
    name TEXT,
    admission TEXT,
    role TEXT,
    status TEXT,
    cid TEXT,
    cidReason TEXT,
    fileName TEXT,
    originalPath TEXT,
    originalFileExt TEXT,
    date TEXT,
    days INTEGER,
    sentToMedical BOOLEAN DEFAULT 0,
    isValidated BOOLEAN DEFAULT 0,
    validationDate TEXT
  );
`);

// Migrations for existing databases
const columns = db.prepare("PRAGMA table_info(certificates)").all() as any[];
const columnNames = columns.map(c => c.name);

if (!columnNames.includes('isValidated')) {
  db.exec("ALTER TABLE certificates ADD COLUMN isValidated BOOLEAN DEFAULT 0");
}
if (!columnNames.includes('validationDate')) {
  db.exec("ALTER TABLE certificates ADD COLUMN validationDate TEXT");
}
if (!columnNames.includes('sentToMedical')) {
  db.exec("ALTER TABLE certificates ADD COLUMN sentToMedical BOOLEAN DEFAULT 0");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Storage for uploaded certificates
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = "uploads";
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}_${file.originalname}`);
    },
  });

  const upload = multer({ storage });

  // --- API Routes ---

  // Employees
  app.get("/api/employees", (req, res) => {
    const rows = db.prepare("SELECT * FROM employees").all();
    res.json(rows);
  });

  app.post("/api/employees/sync", (req, res) => {
    const employees = req.body;
    const deleteBtn = db.prepare("DELETE FROM employees");
    const insert = db.prepare(`
      INSERT INTO employees (id, name, email, admission, role, status, supervisor)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction((data) => {
      deleteBtn.run();
      for (const emp of data) {
        // Strip # if present
        const sanitizedId = String(emp.id).replace('#', '');
        insert.run(sanitizedId, emp.name, emp.email, emp.admission, emp.role, emp.status, emp.supervisor);
      }
    });

    transaction(employees);
    res.json({ success: true });
  });

  // Certificates
  app.get("/api/certificates", (req, res) => {
    const rows = db.prepare("SELECT * FROM certificates").all();
    res.json(rows);
  });

  app.post("/api/certificates/upload", upload.single("file"), (req, res) => {
    res.json({ fileName: req.file?.filename, originalName: req.file?.originalname });
  });

  app.post("/api/certificates", (req, res) => {
    const cert = req.body;
    const insert = db.prepare(`
      INSERT INTO certificates (id, np, name, admission, role, status, cid, cidReason, fileName, originalPath, originalFileExt, date, days, sentToMedical, isValidated, validationDate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    // Sanitizar NP
    const sanitizedNp = String(cert.np).replace('#', '');

    insert.run(
      cert.id,
      sanitizedNp,
      cert.name,
      cert.admission,
      cert.role,
      cert.status,
      cert.cid,
      cert.cidReason || '',
      cert.fileName,
      cert.originalPath,
      cert.originalFileExt || '',
      cert.date,
      cert.days,
      cert.sentToMedical ? 1 : 0,
      cert.isValidated ? 1 : 0,
      cert.validationDate || null
    );
    res.json({ success: true });
  });

  app.patch("/api/certificates/:id", (req, res) => {
    const { id } = req.params;
    const { sentToMedical, isValidated, validationDate } = req.body;
    
    if (sentToMedical !== undefined) {
      const update = db.prepare("UPDATE certificates SET sentToMedical = ? WHERE id = ?");
      update.run(sentToMedical ? 1 : 0, id);
    }
    
    if (isValidated !== undefined) {
      const update = db.prepare("UPDATE certificates SET isValidated = ?, validationDate = ? WHERE id = ?");
      update.run(isValidated ? 1 : 0, validationDate || null, id);
    }
    
    res.json({ success: true });
  });

  app.get("/api/certificates/download/:id", (req, res) => {
    const { id } = req.params;
    const cert = db.prepare("SELECT * FROM certificates WHERE id = ?").get(id) as any;
    
    if (!cert) return res.status(404).send("Atestado não encontrado");
    
    const filePath = path.resolve(__dirname, "uploads", cert.originalPath);
    if (fs.existsSync(filePath)) {
      const ext = cert.originalFileExt ? `.${cert.originalFileExt}` : path.extname(cert.originalPath) || ".pdf";
      // Ensure # is removed from filename
      const sanitizedNp = String(cert.np).replace(/#/g, '');
      const downloadName = `${sanitizedNp}_${cert.name.replace(/\s+/g, "_")}_${cert.date.replace(/\//g, "-")}_${cert.days}dias${ext}`.replace(/#/g, '');
      
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
      
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.status(404).send("Arquivo físico não encontrado");
    }
  });

  app.delete("/api/certificates", (req, res) => {
    const { ids } = req.query;
    console.log(`[Certificates] DELETE request. IDs provided: ${ids || 'ALL'}`);
    
    try {
      if (ids && typeof ids === 'string') {
        const idArray = ids.split(',').filter(id => id.trim() !== '');
        console.log(`[Certificates] Deleting specific records: ${idArray.join(', ')}`);
        
        if (idArray.length === 0) return res.json({ success: true, message: "No IDs provided" });

        const getStmt = db.prepare("SELECT originalPath FROM certificates WHERE id = ?");
        const deleteStmt = db.prepare("DELETE FROM certificates WHERE id = ?");
        
        let deletedCount = 0;
        const transaction = db.transaction((items) => {
          for (const id of items) {
            const cert = getStmt.get(id) as any;
            if (cert && cert.originalPath) {
              const filePath = path.join(__dirname, "uploads", cert.originalPath);
              if (fs.existsSync(filePath)) {
                try {
                  fs.unlinkSync(filePath);
                  console.log(`[Certificates] File del: ${cert.originalPath}`);
                } catch (e) {
                  console.error(`[Certificates] File del error: ${filePath}`, e);
                }
              }
            }
            const info = deleteStmt.run(id);
            if (info.changes > 0) deletedCount++;
          }
        });
        transaction(idArray);
        console.log(`[Certificates] Successfully deleted ${deletedCount} records.`);
        res.json({ success: true, deletedCount });
      } else {
        // Clear all
        console.log("[Certificates] Clearing ALL records and files.");
        const allCerts = db.prepare("SELECT originalPath FROM certificates").all() as any[];
        for (const cert of allCerts) {
          if (cert.originalPath) {
            const filePath = path.join(__dirname, "uploads", cert.originalPath);
            if (fs.existsSync(filePath)) {
              try { fs.unlinkSync(filePath); } catch (e) { console.error(e); }
            }
          }
        }
        db.prepare("DELETE FROM certificates").run();
        res.json({ success: true, message: "All records cleared" });
      }
    } catch (error) {
      console.error("[Certificates] Process error:", error);
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  // Mass Save (Download Zip)
  app.get("/api/certificates/download-mass", (req, res) => {
    const certificates = db.prepare("SELECT * FROM certificates").all() as any[];
    
    res.writeHead(200, {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename=ATTESTADOS_${Date.now()}.zip`,
    });

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res);

    for (const cert of certificates) {
      const filePath = path.join(__dirname, "uploads", cert.originalPath);
      if (fs.existsSync(filePath)) {
        const ext = path.extname(cert.originalPath);
        const formattedDate = cert.date?.replace(/\//g, "-") || "00-00-0000";
        const newName = `${cert.np.replace("#", "")}_${cert.name.toUpperCase().replace(/\s+/g, "_")}_${formattedDate}_${cert.days}dias${ext}`;
        archive.file(filePath, { name: newName });
      }
    }

    archive.finalize();
  });

  // Vite setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
