const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middleware for serving static files and parsing request bodies
app.use(express.static('.'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// In-memory SQLite database setup
const db = new sqlite3.Database(':memory:');
db.serialize(() => {
    db.run("CREATE TABLE user (username TEXT, password TEXT, title TEXT)");
    db.run("INSERT INTO user (username, password, title) VALUES (?, ?, ?)", ['privilegedUser', 'privilegedUser1', 'Administrator']);
});

// Serve the login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle login requests
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Use a prepared statement to prevent SQL injection
    const query = "SELECT title FROM user WHERE username = ? AND password = ?";
    console.log("username:", username);
    console.log("password:", password);

    db.get(query, [username, password], (err, row) => {
        if (err) {
            console.error('ERROR:', err);
            return res.redirect("/index.html#error");
        } 
        if (!row) {
            return res.redirect("/index.html#unauthorized");
        } 
        
        res.send(`Hello <b>${row.title}!</b><br /> 
                  This file contains all your secret data: <br /><br /> 
                  SECRETS <br /><br /> 
                  MORE SECRETS <br /><br /> 
                  <a href="/index.html">Go back to login</a>`);
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
