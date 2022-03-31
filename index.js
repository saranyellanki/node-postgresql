const express = require("express");
const app = express();
const cors = require("cors");
const helmet = require("helmet");
const { pool } = require("./db");
const { database } = require("./db")
const bcrypt = require("bcrypt");

app.use(cors());
app.use(helmet());
app.use(express.json());

database();

app.post('/register', async (req, res) => {
  try {
    let { firstName, lastName, email, password } = req.body;
    let hashedPassword = await bcrypt.hash(password, 10);
    const query = `SELECT 1 FROM users WHERE email = $1`;
    const emailId = await pool.query(query, [email])
    if (emailId.rowCount > 0) {
      res.status(500).json({
        message: "User already exists"
      })
    } else {
      const data = await pool.query(
        `INSERT INTO users (firstName, lastName, email, password)
        VALUES ($1, $2, $3, $4)
        RETURNING id, firstName, lastName, email, password`, [firstName, lastName, email, hashedPassword])
      res.status(200).json({
        code: 200, 
        data: data.rows,
        message: "User registered sucessfully"
      })
    }
  } catch (error) {
    console.log(error);
  }
})


app.listen(3030, () => {
  console.log("Server has started on port 3030");
})