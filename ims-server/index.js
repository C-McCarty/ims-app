const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors());
const URL = `mongodb+srv://${process.env.USER}:${process.env.PASS}${process.env.DATABASE_URL}`;

mongoose.connect(URL).then(() => {
    console.log("MongoDB connected successfully");
}).catch((err) => {
    console.log("Error connecting to MongoDB:", err);
});

const SCHEMA_PRODUCT = mongoose.Schema({
    _id: String,
    name: String,
    category: String,
    isTaxable: Boolean,
    count: Number
});
const SCHEMA_MARKET = mongoose.Schema({
    _id: String,
    name: String,
    date: Date,
    products: Array
});

const MODEL_PRODUCT = mongoose.model("products", SCHEMA_PRODUCT);
const MODEL_MARKET = mongoose.model("markets", SCHEMA_MARKET);

// Getter functions
app.get("/getProducts", (req, res) => {
    MODEL_PRODUCT.find({}).then(products => {
        res.json(products);
    }).catch(err => {
        console.log(err);
        res.status(500).send("Error fetching products.");
    });
});
app.get("/getProductIDs", (req,res) => {
    MODEL_PRODUCT.find({}).then(products => {
        const PROD_ARR = [];
        for (let i = 0; i < products.length; i++) {
            PROD_ARR.push({
                _id: products[i]._id,
                name: products[i].name,
            });
        }
        res.json(PROD_ARR);
    }).catch(err => {
        console.log(err);
        res.status(500).send("Error fetching products.");
    });
});
app.get("/getMarkets", (req, res) => {
    MODEL_MARKET.find({}).then(markets => {
        res.json(markets);
    }).catch(err => {
        console.log(err);
        res.status(500).send("Error fetching markets.");
    });
});
app.get("/getMarketProducts", (req, res) => {
    MODEL_MARKET.find({}).then(markets => {
        const MARK_ARR = [];
        for (let i = 0; i < markets.length; i++) {
            MARK_ARR.push({
                _id: markets[i]._id,
                products: markets[i].products
            });
        }
        res.json(MARK_ARR);
    }).catch(err => {
        console.log(err);
        res.status(500).send("Error fetching markets.");
    });
});

// Adding functions
app.post("/addProducts", (req, res) => {
    const { name, category, isTaxable, count } = req.body;
    MODEL_PRODUCT.collection.insertOne({
        name: name,
        category: category,
        isTaxable: isTaxable,
        count: count
    }).then(() => {
        res.send("Product inserted!");
    }).catch(err => {
        console.log("Error inserting product:", err);
        res.status(500).send("Error inserting product.");
    });
});

app.post("/addMarkets", (req, res) => {
    const { name, date, products } = req.body;
    MODEL_MARKET.collection.insertOne({
        name: name,
        date: date,
        products: products
    }).then(() => {
        res.send("Market inserted!");
    }).catch(err => {
        console.log("Error inserting market:", err);
        res.status(500).send("Error inserting market.");
    });
});

// Removing functions
app.delete("/deleteProduct", (req, res) => {
    const { id } = req.body;
    MODEL_PRODUCT.collection.deleteOne({ _id: mongoose.Types.ObjectId(id) }).then(result => {
        console.log(result);
        res.send("Deleted Product");
    }).catch(err => {
        console.log(err);
        res.status(500).send("Error deleting product.");
    });
});

app.delete("/deleteMarket", (req, res) => {
    const { id } = req.body;
    MODEL_MARKET.collection.deleteOne({ _id: mongoose.Types.ObjectId(id) }).then(result => {
        console.log(result);
        res.send("Deleted Market");
    }).catch(err => {
        console.log(err);
        res.status(500).send("Error deleting market.");
    });
});

// Editing functions
app.put("/updateProducts", (req, res) => {
    const { id, name, category, isTaxable, count } = req.body;
    MODEL_PRODUCT.collection.updateOne({ _id: mongoose.Types.ObjectId(id) }, {
        $set: {
            name: name,
            category: category,
            isTaxable: isTaxable,
            count: count
        }
    }).then(result => {
        console.log(result);
        res.send("Product updated");
    }).catch(err => {
        console.log(err);
        res.status(500).send("Error updating product.");
    });
});
app.put("/updateMarkets", (req, res) => {
    const { id, name, date, products } = req.body;
    MODEL_PRODUCT.collection.updateOne({ _id: mongoose.Types.ObjectId(id) }, {
        $set: {
            name: name,
            date: date,
            products: products
        }
    }).then(result => {
        console.log(result);
        res.send("Market updated");
    }).catch(err => {
        console.log(err);
        res.status(500).send("Error updating market.");
    });
});
app.put("/updateMarketProducts", (req, res) => {
    const { id, products } = req.body;
    MODEL_PRODUCT.collection.updateOne({ _id: mongoose.Types.ObjectId(id) }, {
        $set: { products: products }
    }).then(result => {
        console.log(result);
        res.send("Market updated");
    }).catch(err => {
        console.log(err);
        res.status(500).send("Error updating market.");
    });
});



app.listen(PORT, () => {
    console.log("Server is running on Port " + PORT)
});