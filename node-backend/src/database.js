require('dotenv').config()
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    nomeAzienda: String,
    partitaIVA: String,
})
const User = mongoose.model('User',userSchema)
const connectDB = async () => {
    try{
        const conn = mongoose.connect(process.env.MONGODB_URI);
    }catch (error){
        process.exit(1);
    }
}

module.exports = {User,connectDB}

