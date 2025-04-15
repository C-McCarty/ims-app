const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { resolveInclude } = require("ejs");
const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());
const URL = `mongodb+srv://${process.env.USER}:${process.env.PASS}${process.env.DATABASE_URL}`;

mongoose.connect(URL).then(() => {
    console.log("MongoDB connected successfully");
}).catch((err) => {
    console.error(`Error connecting to MongoDB: ${err}`);
});

const SCHEMA_PRODUCT = mongoose.Schema({
    id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    name: String,
    category: String,
    isTaxable: Boolean,
    count: Number,
    deleted: Boolean
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
    deleted: Boolean
});

const MODEL_PRODUCT = mongoose.model("products", SCHEMA_PRODUCT);
const MODEL_MARKET = mongoose.model("markets", SCHEMA_MARKET);

// Getter functions
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

// Adding functions
app.post("/addProducts", async (req, res) => {
    console.log(req.body);
    const { name, category, isTaxable, count, deleted } = req.body;
    try {
        const PRODUCT = new MODEL_PRODUCT({ name, category, isTaxable, count, deleted });
        await PRODUCT.save();
        res.send(`Product "${name}" inserted successfully.`);
    } catch (err) {
        console.error(err);
        res.status(500).send(`Error adding product: ${err}`);
    }
});

app.post("/addMarkets", async (req, res) => {
    console.log(req.body);
    const { name, date, products, deleted } = req.body;
    try {
        const MARKET = new MODEL_MARKET({ name, date, products, deleted });
        await MARKET.save();
        res.send(`Market "${name}" inserted successfully.`);
    } catch (err) {
        console.error(err);
        res.status(500).send(`Error adding market: ${err}`);
    }
});

// Removing functions
app.put("/deleteProduct", async (req, res) => {
    console.log(req.body);
    const { id } = req.body;
    try {
        await MODEL_PRODUCT.findByIdAndUpdate(id, { deleted: true });
        res.send(`Deleted product.`);
    } catch (err) {
        console.error(err);
        res.status(500).send(`Error deleting product: ${err}`);
    }
});

app.put("/deleteMarket", async (req, res) => {
    console.log(req.body);
    const { id } = req.body;
    try {
        await MODEL_MARKET.findByIdAndUpdate(id, { deleted: true });
        res.send(`Deleted market.`);
    } catch (err) {
        console.error(err);
        res.status(500).send(`Error deleting market: ${err}`);
    }
});

// Editing functions
app.put("/updateProducts", async (req, res) => {
    console.log(req.body);
    const { id, name, category, isTaxable, count } = req.body;
    try {
        await MODEL_PRODUCT.findByIdAndUpdate(id, {
            name: name,
            category: category,
            isTaxable: isTaxable,
            count: count
        });
        res.send(`Updated product "${name}"`);
    } catch (err) {
        console.error(err);
        res.status(500).send(`Error deleting market: ${err}`);
    }
});
app.put("/updateMarkets", async (req, res) => {
    console.log(req.body);
    const { id, name, date, products } = req.body;
    try {
        await MODEL_MARKET.findByIdAndUpdate(id, {
            name: name,
            date: date,
            products: products
        });
        res.send(`Updated product "${name}"`);
    } catch (err) {
        console.error(err);
        res.status(500).send(`Error deleting market: ${err}`);
    }
});


app.listen(PORT, () => {
    console.log("Server is running on Port " + PORT);
});