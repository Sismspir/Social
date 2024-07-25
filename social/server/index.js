"use strict";
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const port = 3000;
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'pass',
    database: "social",
});
connection.connect((error) => {
    if (error) {
        console.log("Error", error);
        return;
    }
    console.log("new connection!!");
});
app.use(cors());
console.log("hello world!");
app.listen(port, () => {
    console.log(`Server is on port ${port}`);
});
