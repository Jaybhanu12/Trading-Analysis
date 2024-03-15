import express, { urlencoded } from "express";
import cors from "cors";
const app = express();

app.use(express.json());

app.use(cors());

app.use(express.static("Public"));

//router

import stockRoute from "./Routes/stock.route.js";
import fileRoute from "./Routes/file.route.js";

app.use("/api/v1/stocks", stockRoute);
app.use("/api/v1/files", fileRoute);

export { app };
