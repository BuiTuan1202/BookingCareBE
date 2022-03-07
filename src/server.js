import express from "express";
import bodyParser from "body-parser";
import viewEngine from "./config/viewEngine";
import initWebRoutes from './route/web';
import cors from "cors"
require('dotenv').config();

import checkconnectDB from './config/connectDB'

let app = express();
// app.use(cors())

app.use(
    cors({
        origin: true,
        credentials: true,
    }));
//config app

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

viewEngine(app);
initWebRoutes(app);

checkconnectDB();

let port = process.env.PORT || 6969;
//Port === undefined => port = 6969


app.listen(port, () => {
    //callback
    console.log("Backend Nodejs is runing on the port : " + port)
})