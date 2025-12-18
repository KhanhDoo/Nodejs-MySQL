import express from "express"
import configViewEngine from './config/viewEngine'
import initWebRouters from './router/web'
import dotenv from "dotenv";
import bodyParser from "body-parser";
import connectDB from "./config/connectDB";
import cors from 'cors'

dotenv.config();
let app = express();
app.use(cors({ origin: true, credentials: true }))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

configViewEngine(app);
initWebRouters(app);

connectDB();

let port = process.env.PORT || 8000;

app.listen(port, () => {
    console.log("Backend nodejs chay o cong : " + port);
})