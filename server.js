const express = require("express");
const bodyParser = require("body-parser");
const Shippo = require("shippo");
const Stripe = require("stripe");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public"));

const shippo = Shippo("SHIPPO_API_KEY");
const stripe = Stripe("STRIPE_SECRET_KEY");


app.post("/get-rates", async (req, res) => {

const {fromZip,toZip,weight} = req.body;

try{

const shipment = await shippo.shipment.create({

address_from:{
zip:fromZip,
country:"US"
},

address_to:{
zip:toZip,
country:"US"
},

parcels:[{
length:"10",
width:"10",
height:"10",
distance_unit:"in",
weight:weight,
mass_unit:"lb"
}],

async:false

});

res.json(shipment.rates);

}catch(e){
res.status(500).send(e.message);
}

});


app.post("/buy-label", async (req,res)=>{

const {rate_id} = req.body;

try{

const transaction = await shippo.transaction.create({
rate: rate_id,
label_file_type:"PDF"
});

res.json(transaction);

}catch(e){
res.status(500).send(e.message);
}

});


app.listen(3000, ()=>{
console.log("Server running on port 3000");
});
