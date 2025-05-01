const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());
// Protected using Render.com environment variables
const URL = `mongodb+srv://${process.env.USER}:${process.env.PASS}${process.env.DATABASE_URL}`;

// Establish database connection
mongoose.connect(URL).then(() => {
    console.log("MongoDB connected successfully");
}).catch((err) => {
    console.error(`Error connecting to MongoDB: ${err}`);
});

// Schema
const SCHEMA_USER = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    USER: String,
    PASS: String
});

// Model
const MODEL_USER = mongoose.model("auths", SCHEMA_USER);

// User Authentication
app.post("/authenticate", async (req, res) => {
    const {USER, PASS} = req.body;
    try {
        const CREDENTIALS = await MODEL_USER.findOne({USER: USER, PASS: PASS});
        if (CREDENTIALS !== null) {
            res.json({AUTH: true, URL: URL});
        } else {
            res.json({AUTH: false});
        }
    } catch (err) {
        console.error(err)
        res.status(500).send(`Error authenticating user: ${err}`);
    }
});

// Start server
app.listen(PORT, () => {
    console.log("Server is running on Port " + PORT);
});