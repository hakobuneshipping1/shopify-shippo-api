const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// Shippo API
const SHIPPO_API = "https://api.goshippo.com/shipments/";
const API_KEY = `ShippoToken ${process.env.SHIPPO_API_KEY}`;

// Test route
app.get("/", (req, res) => {
  res.send("Shipping API is running");
});

// Shopify webhook
app.post("/webhook", async (req, res) => {

  const order = req.body;

  try {

    const shipment = {
      address_from: {
        name: "Your Shipping Company",
        street1: "123 Main St",
        city: "Los Angeles",
        state: "CA",
        zip: "90001",
        country: "US"
      },

      address_to: {
        name: order.shipping_address.name,
        street1: order.shipping_address.address1,
        city: order.shipping_address.city,
        state: order.shipping_address.province,
        zip: order.shipping_address.zip,
        country: order.shipping_address.country_code
      },

      parcels: [{
        length: "10",
        width: "8",
        height: "4",
        distance_unit: "in",
        weight: "2",
        mass_unit: "lb"
      }]
    };

    const response = await axios.post(
      SHIPPO_API,
      shipment,
      {
        headers: {
          Authorization: API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("Shippo response:", response.data);

    res.status(200).send("Shipment created");

  } catch (error) {

    console.error("Shippo error:", error.response?.data || error.message);

    res.status(500).send("Error creating shipment");

  }

});

// Render requires this
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
