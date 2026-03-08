const express = require("express");
const app = express();

app.use(express.json());

app.post("/webhook", (req, res) => {
 console.log("Shopify order:", req.body);
 res.send("Webhook received");
});

app.listen(3000, () => {
 console.log("Server running");
});
