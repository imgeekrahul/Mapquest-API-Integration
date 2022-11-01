const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const mapModel = require("./map");
const axios = require("axios");

const connectDB = async () => {
    try {
        const con = await mongoose.connect("mongodb+srv://admin:admin123@cluster0.b8srm.mongodb.net/mapquest-api?retryWrites=true&w=majority", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        // console.log(con.connection.name);
        console.log(`MongoDB Database "${con.connection.name}" connected on host: ${con.connection.host}`)
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
} 
// mongoDB connection
connectDB();

const app = express();


app.use(express.urlencoded({ extended: true }))

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const PORT = 5004;

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
})

app.get("/", (req, res) => {
    res.render("index.ejs")
})


app.get("/map", async (req, res) => {
    try {
        await mapModel.find({})
        .then(data => {
            res.render("map", {route: data})
        })
        .catch(err => {
            console.log(err);
        })
    } catch(error) {
        console.log(error);
    }
    
})


app.post("/mapaddress", async (req, res) => {
    if(!req.body) {
        res.json({
            message: "Invalid Content !!"
        })
    }

    // const address = {
    //     address: req.body.address
    // }

    // const addressUpdate = await mapModel.create(address);
    // console.log(addressUpdate);
    const locationMap = JSON.stringify({
        location: req.body.address,
    })

    try{
        await axios.post("http://www.mapquestapi.com/geocoding/v1/address?key=jOJMUfBMaaZzldsEpUaeXG2SDAxJKQKe", locationMap)
        .then(async data => {
            const lat = data.data.results[0].locations[0].latLng.lat
            const lng = data.data.results[0].locations[0].latLng.lng;

            const address = {
                location: req.body.address,
                lat: lat,
                lang: lng
            }

            console.log(address)

            const updatedAddress = await mapModel.create(address);
            res.json(updatedAddress);
        })
        .catch(err => {
            res.json(err);
        })
        
    } catch (err) {
        console.log(err);
    }
})


process.on('unhandledRejection', (err) => {
    console.error(err);
    process.exit(1);
})