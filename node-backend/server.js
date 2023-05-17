import express from "express";
import {connectDB} from "./database.js";
import routes from "./routes.js";

connectDB();
const PORT = process.env.PORT;
const app = express();

app.use(express.json());
app.use('/', routes);


app.listen(PORT)
