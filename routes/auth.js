const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");

router.use(cookieParser());

router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        // Check if the email already exists in the database
        const existingUser = await pool.query(
            'SELECT * FROM users.users WHERE "email" = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: "Email is already in use" });
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert into the database
        const result = await pool.query(
            'INSERT INTO users.users ("name", "email", "password") VALUES ($1, $2, $3) RETURNING "ID"',
            [name, email, hashedPassword]
        );

        res.status(201).json({ message: "User created", user: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});


router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        // Check if the user exists in the database
        const result = await pool.query(
            'SELECT * FROM users.users WHERE "email" = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const user = result.rows[0];

        // Compare the provided password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // Set cookies with user name and email (expires in 1 hour)
        res.cookie('user_name', user.name, {
            httpOnly: true, // Prevent client-side access
            secure: process.env.NODE_ENV === 'production',  // Only use secure cookies in production (https)
            maxAge: 3600000, // 1 hour expiry
            sameSite: 'Strict'  // Prevents CSRF attacks
        });

        res.cookie('user_email', user.email, {
            httpOnly: true, // Prevent client-side access
            secure: process.env.NODE_ENV === 'production',  // Only use secure cookies in production (https)
            maxAge: 3600000, // 1 hour expiry
            sameSite: 'Strict'  // Prevents CSRF attacks
        });

        // Send success response
        res.status(200).json({ message: "Login successful" , name:`${user.name}`, email:`${user.email}`});

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;