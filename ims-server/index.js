const express = require('express');
const mongoose = require('mongoose');
const PORT = 3001;
const app = express();
const URI = 'mongodb+srv://cmccarty7:UblUHPwcN5Vt0x3O@ims.ipblnuv.mongodb.net/Inventory?retryWrites=true&w=majority&appName=IMS';

mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log('MongoDB connected successfully');
}).catch((err) => {
    console.log('Error connecting to MongoDB:', err);
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
const PROD_NAME = "";
const CATE_NAME = "";
const TAXABLE = true;
const COUNT = 50;

app.get("/addProduct", (req, res) => {
    MODEL_PRODUCT.collection.insertOne({
        name: PROD_NAME,
        category: CATE_NAME,
        isTaxable: TAXABLE,
        count: COUNT
    }).then(() => {
        res.send('Product inserted!');
    }).catch(err => {
        console.log('Error inserting product:', err);
        res.status(500).send('Error inserting product.');
    });
});

const MARK_NAME = "";
const MARK_DATE = "";
const PROD_ARR = [{_id: "", countAllocated: 0, countRemaining: 0}];

app.get("/addMarket", (req, res) => {
    MODEL_MARKET.collection.insertOne({
        name: MARK_NAME,
        date: MARK_DATE,
        products: PROD_ARR
    }).then(() => {
        res.send('Market inserted!');
    }).catch(err => {
        console.log('Error inserting market:', err);
        res.status(500).send('Error inserting market.');
    });
});

const { Types } = mongoose;

const PROD_ID = "67f55bb091d202a20f3b8d25";

// Removing functions
app.get("/deleteProduct", (req, res) => {
    MODEL_PRODUCT.collection.deleteOne({_id: new Types.ObjectId(PROD_ID)}).then(result => {
        console.log(result);
        res.send("Deleted Product");
    }).catch(err => {
        console.log(err);
        res.status(500).send('Error deleting product.');
    });
});

const MARK_ID = "67f56948f252cc3aa7234904";

app.get("/deleteMarket", (req, res) => {
    MODEL_MARKET.collection.deleteOne({_id: new Types.ObjectId(MARK_ID)}).then(result => {
        console.log(result);
        res.send("Deleted Market");
    }).catch(err => {
        console.log(err);
        res.status(500).send('Error deleting market.');
    });
});




app.listen(PORT, () => {
    console.log("App is running on http://localhost:" + PORT)
})