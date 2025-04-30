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

// Schemas
const SCHEMA_PRODUCT = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    name: String,
    category: String,
    isTaxable: Boolean,
    count: Number,
    deleted: {type: Boolean, default: false}
});
const SCHEMA_MARKET = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    name: String,
    date: Date,
    products: [{
        _id: mongoose.Types.ObjectId,
        name: String,
        countAllocated: Number,
        countRemaining: Number
    }],
    deleted: {type: Boolean, default: false}
});
const SCHEMA_USER = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    USER: String,
    PASS: String
});

// Models
const MODEL_PRODUCT = mongoose.model("products", SCHEMA_PRODUCT);
const MODEL_MARKET = mongoose.model("markets", SCHEMA_MARKET);
const MODEL_USER = mongoose.model("auth", SCHEMA_USER);

// Getter Endpoints
app.get("/getProducts", (req, res) => {
    MODEL_PRODUCT.find({ deleted: false }).then(products => {
        res.json(products);
    }).catch(err => {
        console.log(err);
        res.status(500).send(`Error fetching products: ${err}`);
    });
});
app.get("/getMarkets", (req, res) => {
    MODEL_MARKET.find({ deleted: false }).then(markets => {
        res.json(markets);
    }).catch(err => {
        console.log(err);
        res.status(500).send(`Error fetching markets: ${err}`);
    });
});

// Adding Endpoints
app.post("/addProducts", async (req, res) => {
    const { name, category, isTaxable, count } = req.body;
    try {
        const PRODUCT = new MODEL_PRODUCT({ name, category, isTaxable, count });
        await PRODUCT.save();
        res.send(`Product "${name}" inserted successfully.`);
    } catch (err) {
        console.error(err);
        res.status(500).send(`Error adding product: ${err}`);
    }
});
app.post("/addMarkets", async (req, res) => {
    const { name, date, products } = req.body;
    try {
        const MARKET = new MODEL_MARKET({ name, date, products });
        await MARKET.save();
        res.send(`Market "${name}" inserted successfully.`);
    } catch (err) {
        console.error(err);
        res.status(500).send(`Error adding market: ${err}`);
    }
});

// Soft Deletion Endpoints
app.put("/deleteProduct", async (req, res) => {
    const { _id } = req.body;
    try {
        await MODEL_PRODUCT.findByIdAndUpdate(_id, { deleted: true });
        res.send(`Deleted product.`);
    } catch (err) {
        console.error(err);
        res.status(500).send(`Error deleting product: ${err}`);
    }
});
app.put("/deleteMarket", async (req, res) => {
    const { _id } = req.body;
    try {
        await MODEL_MARKET.findByIdAndUpdate(_id, { deleted: true });
        res.send(`Deleted market.`);
    } catch (err) {
        console.error(err);
        res.status(500).send(`Error deleting market: ${err}`);
    }
});

// Editing Endpoints
app.put("/updateProducts", async (req, res) => {
    const { _id, name, category, isTaxable, count } = req.body;
    try {
        await MODEL_PRODUCT.findByIdAndUpdate(_id, {
            name: name,
            category: category,
            isTaxable: isTaxable,
            count: count,
            deleted: false
        });
        res.send(`Updated product "${name}"`);
    } catch (err) {
        console.error(err);
        res.status(500).send(`Error updating product: ${err}`);
    }
});
app.put("/updateMarkets", async (req, res) => {
    const { _id, name, date, products } = req.body;
    try {
        await MODEL_MARKET.findByIdAndUpdate(_id, {
            name: name,
            date: date,
            products: products,
            deleted: false
        });
        res.send(`Updated market "${name}"`);
    } catch (err) {
        console.error(err);
        res.status(500).send(`Error updating market: ${err}`);
    }
});

// User Authentication
app.post("/authenticate", async (req, res) => {
    const {USER, PASS} = req.body;
    console.log(process.env.AUTH_ID);
    try {
        const CREDENTIALS = await MODEL_USER.findOne({_id: new mongoose.Types.ObjectId(process.env.AUTH_ID)});
        if (CREDENTIALS.USER === USER && CREDENTIALS.PASS === PASS) {
            res.json({AUTH: true});
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