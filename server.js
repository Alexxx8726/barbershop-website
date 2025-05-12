const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('.')); // Serve static files (HTML, CSS, images)

// Initialize SQLite database
const db = new sqlite3.Database('bookings.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    db.run(`CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      barber TEXT NOT NULL,
      service TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
  }
});

// Handle form submission
app.post('/book', (req, res) => {
  const { barber, service, date, time, name, phone } = req.body;

  // Basic validation
  if (!barber || !service || !date || !time || !name || !phone) {
    return res.json({ status: 'error', message: 'Будь ласка, заповніть усі поля' });
  }

  // Check for existing booking
  db.get(
    'SELECT COUNT(*) as count FROM bookings WHERE barber = ? AND date = ? AND time = ?',
    [barber, date, time],
    (err, row) => {
      if (err) {
        console.error('Database error:', err.message);
        return res.json({ status: 'error', message: 'Помилка бази даних' });
      }
      if (row.count > 0) {
        return res.json({ status: 'error', message: 'Цей час уже зайнято!' });
      }

      // Insert new booking
      db.run(
        'INSERT INTO bookings (barber, service, date, time, name, phone) VALUES (?, ?, ?, ?, ?, ?)',
        [barber, service, date, time, name, phone],
        (err) => {
          if (err) {
            console.error('Insert error:', err.message);
            return res.json({ status: 'error', message: 'Помилка при створенні запису' });
          }
          res.json({ status: 'success', message: 'Запис успішно створено!' });
        }
      );
    }
  );
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
