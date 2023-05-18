import express from "express";
import {connectDB} from "./database.js";
import routes from "./routes.js";
import session from "express-session";
import mongoDBStore from 'connect-mongodb-session'
connectDB();

const MongoDBStoreSession = mongoDBStore(session);
const store = new MongoDBStoreSession({
    uri: process.env.MONGODB_URI,
    collection: 'sessions'
});
const PORT = process.env.PORT;
const app = express();

app.use(session({
    secret: "fh7yn9a", //random?
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
        secure: false,
        maxAge: 5 * 60 * 1000
    }
}))
app.use(express.json());
app.use('/', routes);


app.listen(PORT)
