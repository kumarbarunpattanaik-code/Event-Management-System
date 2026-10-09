const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./events.db", (err) => {
    if (err) {
        console.error("Database error:", err.message);
    } else {
        console.log("Connected to SQLite database.");
    }
});

db.run(`
    CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        location TEXT NOT NULL,
        description TEXT NOT NULL
    )
`);

// Test
app.get("/", (req, res) => {
    res.send("Event Management System Backend is Running!");
});

// GET ALL EVENTS
app.get("/api/events", (req, res) => {
    db.all(
        "SELECT * FROM events ORDER BY id DESC",
        [],
        (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    message: "Failed to get events"
                });
            }

            res.json(rows);
        }
    );
});

// GET ONE EVENT
app.get("/api/events/:id", (req, res) => {
    const id = Number(req.params.id);

    db.get(
        "SELECT * FROM events WHERE id = ?",
        [id],
        (err, row) => {
            if (err) {
                return res.status(500).json({
                    message: "Failed to get event"
                });
            }

            if (!row) {
                return res.status(404).json({
                    message: "Event not found"
                });
            }

            res.json(row);
        }
    );
});

// CREATE EVENT
app.post("/api/events", (req, res) => {
    console.log("Received event:", req.body);

    const {
        title,
        date,
        location,
        description
    } = req.body;

    if (!title || !date || !location || !description) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    const sql = `
        INSERT INTO events
        (title, date, location, description)
        VALUES (?, ?, ?, ?)
    `;

    db.run(
        sql,
        [title, date, location, description],
        function (err) {
            if (err) {
                console.error("Insert error:", err.message);

                return res.status(500).json({
                    message: "Failed to create event",
                    error: err.message
                });
            }

            console.log("Event added with ID:", this.lastID);

            res.status(201).json({
                id: this.lastID,
                title,
                date,
                location,
                description
            });
        }
    );
});

// UPDATE EVENT
app.put("/api/events/:id", (req, res) => {
    const id = Number(req.params.id);

    const {
        title,
        date,
        location,
        description
    } = req.body;

    if (!title || !date || !location || !description) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    const sql = `
        UPDATE events
        SET title = ?, date = ?, location = ?, description = ?
        WHERE id = ?
    `;

    db.run(
        sql,
        [title, date, location, description, id],
        function (err) {
            if (err) {
                return res.status(500).json({
                    message: "Failed to update event"
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    message: "Event not found"
                });
            }

            res.json({
                message: "Event updated successfully"
            });
        }
    );
});

// DELETE EVENT
app.delete("/api/events/:id", (req, res) => {
    const id = Number(req.params.id);

    db.run(
        "DELETE FROM events WHERE id = ?",
        [id],
        function (err) {
            if (err) {
                return res.status(500).json({
                    message: "Failed to delete event"
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    message: "Event not found"
                });
            }

            res.json({
                message: "Event deleted successfully"
            });
        }
    );
});

// START SERVER
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});