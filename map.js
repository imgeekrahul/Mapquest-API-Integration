const mongoose = require("mongoose");

var mapSchema = new mongoose.Schema({
    location: {
        type: String
    }, 
    lat: {
        type: Number
    },
    lang: {
        type: Number
    }
})

const map = mongoose.model("map", mapSchema);
module.exports = map;