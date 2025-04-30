const express = require('express');
const cors = require("cors");
const serverless = require ('serverless-http');

var port = process.env.PORT || 5000;


const app = express();
const estudiantesroutes = require("./backend/routes/getUser.js");

app.use(express.json());
app.use(cors());


app.get ("/", (req,res) => {
    res.send ("Hola mundo");
})

app.use ("/getUser",estudiantesroutes);


app.listen (8888,() =>{
    console.log("servidor activo");
});