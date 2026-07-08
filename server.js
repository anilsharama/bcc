// import express from "express";
// import mysql from "mysql2/promise";
// import cors from "cors";

// const app = express();

// app.use(cors());
// app.use(express.json());

// // =====================
// // MYSQL CONNECTION
// // =====================
// const db = mysql.createPool({
//   host: "127.0.0.1",
//   port: 3306,
//   user: "root",
//   password: "Anil@2001",
//   database: "invoice_db",
//   waitForConnections: true,
//   connectionLimit: 10,
// });

// // =====================
// // API
// // =====================
// app.get("/api/invoice-flow", async (req, res) => {
//   try {
//     const { month } = req.query;

//     let sql = "SELECT * FROM invoice_flow";
//     let params = [];a

//     if (month) {
//       sql += " WHERE month = ?";
//       params.push(month);
//     }

//     const [rows] = await db.query(sql, params);
//     res.json(rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });
// app.get("/api/footer", (req, res) => {
//   res.json({
//     company: "Invoice System",
//     year: 2026,
//     message: "All rights reserved",
//   });
// });
// app.put("/api/invoices/:id", (req, res) => {
//   const { id } = req.params;
//   const { invoiceNo, customer, date, amount, status, remark } = req.body;

//   const sql =
//     "UPDATE invoices SET invoiceNo=?, customer=?, date=?, amount=?, status=?, remark=? WHERE id=?";

//   db.query(
//     sql,
//     [invoiceNo, customer, date, amount, status, remark, id],
//     (err, result) => {
//       if (err) return res.status(500).json(err);
//       res.json({ message: "Invoice updated successfully" });
//     }
//   );
// });

// // ---------------- DELETE INVOICE ----------------
// app.delete("/api/invoices/:id", (req, res) => {
//   const { id } = req.params;

//   db.query("DELETE FROM invoices WHERE id=?", [id], (err, result) => {
//     if (err) return res.status(500).json(err);
//     res.json({ message: "Invoice deleted successfully" });
//   });
// });

// // ---------------- UPDATE REMARK ONLY ----------------
// app.patch("/api/invoices/:id/remark", (req, res) => {
//   const { id } = req.params;
//   const { remark } = req.body;

//   db.query(
//     "UPDATE invoices SET remark=? WHERE id=?",
//     [remark, id],
//     (err, result) => {
//       if (err) return res.status(500).json(err);
//       res.json({ message: "Remark updated successfully" });
//     }
//   );
// });

// // =====================
// // START SERVER
// // =====================
// const PORT = 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/* ================= MYSQL CONNECTION ================= */

const db = mysql.createPool({
  host: "192.168.70.230",
  user: "emri",
  password: "emri",
  database: "INV",
  waitForConnections: true,
  connectionLimit: 10,
});

/* ================= GET ALL INVOICES ================= */
app.get("/api/invoice", async (req, res) => {
  try {
    const { month, year } = req.query;

    console.log("FILTER:", month, year);

    let sql = "SELECT * FROM invoice WHERE 1=1";
    const params = [];

    if (month) {
      sql += " AND month = ?";
      params.push(month);
    }

    if (year) {
      sql += " AND year = ?";
      params.push(year);
    }

    const [rows] = await db.query(sql, params);

    res.json(rows);
  } catch (err) {
    console.error("API ERROR:", err);   // 👈 IMPORTANT
    res.status(500).json({
      message: "Server Error",
      error: err.message,
    });
  }
});

/* ================= GET SINGLE INVOICE ================= */
app.get("/api/invoice/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      "SELECT * FROM invoice WHERE id=?",
      [id]
    );

    res.json(rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= ADD INVOICE ================= */
app.post("/api/invoice", async (req, res) => {
  try {
    const { designation, description, process, month, year } = req.body;

    const sql = `
      INSERT INTO invoice
      (designation, description, process, month, year)
      VALUES (?, ?, ?, ?, ?)
    `;

    await db.query(sql, [
      designation,
      description || "",
      process || "Pending",
      month,
      year,
    ]);

    res.json({
      success: true,
      message: "Invoice inserted successfully",
    });
  } catch (err) {
    console.error("INSERT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});



/* ================= DELETE INVOICE ================= */
app.delete("/api/invoice/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM invoice WHERE id=?", [id]);

    res.json({ message: "Invoice deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




app.get("/api/invoice", async (req, res) => {
  try {
    const { month } = req.query;

    let sql = "SELECT * FROM invoice";
    let params = [];

    if (month) {
      sql += " WHERE month = ?";
      params.push(month);
    }

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


////////////////login/////
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log("LOGIN DATA:", username, password);

    const [adminRows] = await db.query(
      "SELECT * FROM admin WHERE username=? AND password=?",
      [username, password]
    );

    console.log("ADMIN:", adminRows);

    const [userRows] = await db.query(
      "SELECT * FROM user WHERE username=? AND password=?",
      [username, password]
    );

    console.log("USER:", userRows);

    if (adminRows.length > 0) {
      return res.json({
        success: true,
        role: "admin",
        user: adminRows[0],
      });
    }

    if (userRows.length > 0) {
      return res.json({
        success: true,
        role: "user",
        user: userRows[0],
      });
    }

    return res.status(401).json({
      success: false,
      message: "User not found",
    });

  } catch (err) {
    console.error(err);
  }
});
/* ================= START SERVER ================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});




/////////////////////////

// GET Invoices (with filter)
app.get('/api/invoice', async (req, res) => {
  const { month, year } = req.query;
  try {
    const [rows] = await db.query(
      'SELECT * FROM invoices WHERE month = ? AND year = ? ORDER BY id DESC',
      [month, year]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE Invoice
app.post('/api/invoice', async (req, res) => {
  const { designation, name, process, month, year, remark } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO invoices (designation, process, month, year, remark) VALUES (?, ?, ?, ?, ?, ?)',
      [designation, name, process || 'Pending', month, year, remark || '']
    );
    res.json({ id: result.insertId, success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// DELETE Invoice
app.delete('/api/invoice/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM invoices WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});





// ====================== PUT / UPDATE INVOICE ======================
// PUT - Update Invoice (Used for both Edit and Reprocess)
app.put('/api/invoice/:id', async (req, res) => {
  const { id } = req.params;
  const { process, designation, name, description, month, year } = req.body;

  try {
    // ==================== REPROCESS LOGIC ====================
   if (process === "Pending") {
      await db.execute(
      `UPDATE invoice
   SET process = ?, updated_at = NOW()
   WHERE id = ?`,
  [process, id]
      );
      return res.json({ 
        success: true, 
        message: "All invoices have been moved to Pending" 
      });
    }


    // ==================== NORMAL EDIT ====================
    // This runs when editing from modal
    await db.execute(
  `UPDATE invoice
   SET designation = ?,
       description = ?,
       process = ?,
       month = ?,
       year = ?,
        updated_at = CURRENT_TIMESTAMP
   WHERE id = ?`,
  [
    designation || "",
    description || "",
    process || "Pending",
    month,
    year,
    id
  ]

    );

    res.json({ success: true, message: "Updated successfully" });
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});
// Delete record
app.delete('/api/invoice/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM invoice WHERE id = ?', [req.params.id]);
    res.json({ message: 'Record deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});



app.get("/api/invoice", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM invoice");
    res.json(rows);
  } catch (err) {
    console.error("GET /api/invoice ERROR:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});




////////////////////////////reprocess
// ================= DEDICATED REPROCESS ROUTE =================
// Only updates the process status to 'Pending' - No other fields touched
// ================= REPROCESS - ONLY CHANGES PROCESS STATUS =================
app.put('/api/invoice/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (!id || Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "Invalid request" });
  }

  try {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), id];

    const sql = `UPDATE invoice SET ${fields} WHERE id = ?`;

    await db.execute(sql, values);

    res.json({ success: true });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ error: err.message });
  }
});



/////////////////////reprocess by id
// ====================== NEW: Reprocess by ID API ======================
app.put('/api/reprocess/:id', async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ message: "Invalid Invoice ID" });
  }

  const invoiceId = parseInt(id);

  try {
    // Step 1: Verify invoice exists
    const [invoice] = await db.query('SELECT id FROM invoice WHERE id = ?', [invoiceId]);

    if (invoice.length === 0) {
      return res.status(404).json({ message: "Invoice ID not found" });
    }

    // Step 2: Update the selected invoice + ALL higher IDs to "Pending"
    const [result] = await db.query(
      'UPDATE invoice SET process = "Pending" WHERE id >= ?', 
      [invoiceId]
    );

    console.log(`Reprocess by ID: Updated ${result.affectedRows} invoices starting from ID ${invoiceId}`);

    res.json({ 
      message: "Reprocessed successfully", 
      affectedRows: result.affectedRows 
    });
  } catch (error) {
    console.error("Reprocess by ID Error:", error);
    res.status(500).json({ message: "Server error" });
  }
}); 


////////////////////////////
