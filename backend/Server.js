import express from "express";
import dotenv from "dotenv";
import mongoConnect from "./db/Connection.js";

dotenv.config();

const PORT = process.env.PORT || 8000;

const app = express();
mongoConnect();
app.listen(process.env.PORT, () => {
  console.log(`Server is listening at ${process.env.PORT}`);
});
