const express = require("express");
const bodyParser = require("body-parser");
const Shippo = require("shippo");
const cors = require("cors");

const app = express();

app.use(bodyParser.json());
app.use(cors());

// 🔑 PUT YOUR REAL KEY HERE
const shippo = Shippo("YOUR_SHIPPO_API_KEY");


// ✅ GET SHIPPING RATES
app.post("/get-rates", async (req, res) => {

try {

const shipment = await shippo.shipment.create({

address_from: {
zip: req.body.fromZip,
country: "US"
},

address_to: {
zip: req.body.toZip,
country: "US"
},

parcels: [{
length: "10",
width: "10",
height: "10",
distance_unit: "in",
weight: req.body.weight,
mass_unit: "lb"
}],

async: false

});

res.json(shipment.rates);

} catch (err) {
res.status(500).send(err.message);
}

});


// ✅ BUY LABEL
app.post("/buy-label", async (req, res) => {

try {

const transaction = await shippo.transaction.create({
rate: req.body.rate_id,
label_file_type: "PDF"
});

res.json({
label_url: transaction.label_url
});

} catch (err) {
res.status(500).send(err.message);
}

});


app.listen(3000, () => {
console.log("Server running on port 3000");
});
