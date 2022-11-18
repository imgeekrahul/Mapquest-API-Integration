const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const mapModel = require("./map");
const axios = require("axios");

/* Printer Setup */
// const ThermalPrinter = require("node-thermal-printer").printer;
// const PrinterTypes = require("node-thermal-printer").types;

// let printer = new ThermalPrinter({
//   type: 'RTP-82U',
//   interface: 'USB'
// });

// const print = async() => {
//     await printer.alignCenter();
//     await printer.println("Hello world");
//     await printer.cut();
//     // console.log(printer);

//     try {
//         let execute = await printer.execute()
//         console.log(execute);
//         // console.error("Print done!");
//     } catch (error) {
//         console.log("Print failed:", error);
//     }
// }

// print();

const escpos = require('escpos');
escpos.USB = require('escpos-usb');
const device  = new escpos.USB();

// const usbPrinter = new escpos.Printer(device);
// console.log(usbPrinter);

const printer = new escpos.Printer(device);
// console.log(printer)

const print = (req, res) => {
    device.open(req, res, function (err) {
        device.on('data', function (data) {
            console.log(data);
            console.log(data.toString('hex'));
        });

        device.write(_.DLE);
        device.write(_.EOT);
        device.write(String.fromCharCode(1));

//         setTimeout(() => {
//             printer.close();
//         }, 1000);
    });

}

print();

// var printer = require('node-thermal-printer');

// const print = async() => {
//     await printer.init({
//         type: 'retsol',
//         interface: "USB"
//     })
    
//     printer.alignCenter();
    
//     printer.println("Hello World");
    
//     printer.cut();
    
//     new printer.execute(function(err) {
//         if(err) {
//             console.err("Print failed", err);
//         } else {
//             console.log("Print done");
//         }
//     })
// }

// var printer = require("node-thermal-printer");

// const print = async () => {
//     await printer.prototype.init({
//         type: 'retol',
//         interface: 'USB'
//       });
//       printer.alignCenter();
//       printer.println("Hello world", function(done){
//           printer.cut();
//           printer.execute(function(err){
//             if (err) {
//               console.error("Print failed", err);
//             } else {
//              console.log("Print done");
//             }
//         });
//     });
// }

// print();

// const print = (req, res) => {

//     const escpos = require('escpos');
//     // install escpos-usb adapter module manually
//     escpos.USB = require('escpos-usb');
//     // Select the adapter based on your printer type
//     const device  = new escpos.USB();
//     // const device  = new escpos.Network('localhost');
//     // const device  = new escpos.Serial('/dev/usb/lp0');
    
//     const options = { encoding: "GB18030"  /* default */ }
//     // encoding is optional
    
//     const printer = new escpos.Printer(device, options);

//     // console.log(printer);
//     device.open(req, res, function(error){
//         printer
//         .font('a')
//         .align('ct')
//         .style('bu')
//         .size(1, 1)
//         .text('The quick brown fox jumps over the lazy dog')
//         .qrimage('https://github.com/song940/node-escpos', function(err){
//         this.cut();
//         this.close();

//         console.log(printer)
//     });
//     })
// }

// print();
/* Printer Setup */

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