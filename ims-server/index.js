const express = require('express')
const mongoose = require('mongoose')
const PORT = 3001


const app = express()

const URI = 'mongodb+srv://cmccarty7:UblUHPwcN5Vt0x3O@ims.ipblnuv.mongodb.net/Inventory?retryWrites=true&w=majority&appName=IMS'

mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.log('Error connecting to MongoDB:', err));


const SCHEMA_PRODUCT = mongoose.Schema({
    _id: String,
    name: String,
    category: String,
    isTaxable: Boolean,
    count: Number
});
const MODEL_PRODUCT = mongoose.model("products", SCHEMA_PRODUCT)

const SCHEMA_MARKET = mongoose.Schema({
    _id: String,
    name: String,
    date: Date,
    products: Array
});
const MODEL_MARKET = mongoose.model("markets", SCHEMA_MARKET)





app.get("/getProducts", (req, res) => {
    MODEL_PRODUCT.find({}).then(products => {
        res.json(products);
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

const PROD_NAME = "";
const CATE_NAME = "";
const TAXABLE = true;
const COUNT = 50;

app.get("/addProduct", (req, res) => {
    const testProduct = new MODEL_PRODUCT({
        name: PROD_NAME,
        category: CATE_NAME,
        isTaxable: TXBL,
        count: COUNT
    });

    testProduct.save().then(() => {
        res.send('QTest product inserted!');
    }).catch(err => {
        console.log('Error inserting product:', err);
        res.status(500).send('Error inserting product.');
    });
});

app.get("/productIDs", (req,res) => {
    MODEL_PRODUCT.find({}).then(products => {
        const prodArr = [];
        for (let i = 0; i < products.length; i++) {
            prodArr.push({
                "_id": products[i]._id,
                "name": products[i].name,
            });
        }
        res.json(prodArr);
    }).catch(err => {
        console.log(err);
        res.status(500).send("Error fetching products.");
    });
});


app.listen(PORT, () => {
    console.log("App is running on http://localhost:" + PORT)
})