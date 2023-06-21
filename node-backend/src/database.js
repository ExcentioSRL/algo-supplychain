require('dotenv').config()
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    nomeAzienda: String,
    partitaIVA: String,
    WalletAddress: String,
})
const User = mongoose.model('User',userSchema)

const stockSchema = new mongoose.Schema({
    id: String,
    creator: String,
    owner: String
})
const Stock = mongoose.model('Stock',stockSchema)


const requestSchema = new mongoose.Schema({
    id: String,
    oldOwner: String,
    requester: String
})
const Request = mongoose.model('Request',requestSchema)

const connectDB = async () => {
    try{
        const conn = mongoose.connect(process.env.MONGODB_URI);
    }catch (error){
        process.exit(1);
    }
}

module.exports = {User,Stock,Request,connectDB}

