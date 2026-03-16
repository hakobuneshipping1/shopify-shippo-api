require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const Shippo = require("shippo");
const Stripe = require("stripe");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());
app.use(cors());

// INIT
const shippo = Shippo(process.env.SHIPPO_API_KEY);
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// DB CONNECT
mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("DB connected"))
.catch(err=>console.log(err));

// SCHEMA
const OrderSchema = new mongoose.Schema({
orderId: String,
rate_id: String,
amount: Number,
label_url: String,
status: String,
address_from: Object,
address_to: Object,
parcel: Object
});

const Order = mongoose.model("Order", OrderSchema);



// 🟢 1. GET RATES
app.post("/get-rates", async (req, res) => {

try {

const shipment = await shippo.shipment.create({
address_from: req.body.address_from,
address_to: req.body.address_to,
parcels: [{
length: req.body.parcel.length,
width: req.body.parcel.width,
height: req.body.parcel.height,
distance_unit: "in",
weight: req.body.parcel.weight,
mass_unit: "lb"
}],
async: false
});

res.json(shipment.rates);

} catch (err) {
res.status(500).send(err.message);
}

});



// 🟡 2. CREATE PAYMENT SESSION
app.post("/create-checkout", async (req, res) => {

try {

const orderId = uuidv4();

const session = await stripe.checkout.sessions.create({
payment_method_types: ["card"],
mode: "payment",
line_items: [{
price_data: {
currency: "usd",
product_data: {
name: "Shipping Label"
},
unit_amount: Math.round(req.body.amount * 100)
},
quantity: 1
}],
success_url: `${process.env.BASE_URL}/success?orderId=${orderId}`,
cancel_url: `${process.env.BASE_URL}/cancel`
});

// SAVE ORDER (PENDING)
await Order.create({
orderId,
rate_id: req.body.rate_id,
amount: req.body.amount,
status: "pending",
address_from: req.body.address_from,
address_to: req.body.address_to,
parcel: req.body.parcel
});

res.json({ url: session.url });

} catch (err) {
res.status(500).send(err.message);
}

});



// 🔵 3. VERIFY PAYMENT + CREATE LABEL
app.get("/success", async (req, res) => {

try {

const { orderId } = req.query;

const order = await Order.findOne({ orderId });

if (!order) return res.send("Order not found");

// CREATE LABEL
const transaction = await shippo.transaction.create({
rate: order.rate_id,
label_file_type: "PDF"
});

// UPDATE ORDER
order.label_url = transaction.label_url;
order.status = "completed";
await order.save();

res.send(`
<h2>Label Ready</h2>
<a href="${transaction.label_url}" target="_blank">Download Label</a>
`);

} catch (err) {
res.status(500).send(err.message);
}

});



// 🔍 4. GET ALL ORDERS (ADMIN)
app.get("/orders", async (req, res) => {

const orders = await Order.find().sort({ _id: -1 });
res.json(orders);

});



app.listen(3000, () => {
console.log("Server running on port 3000");
});
