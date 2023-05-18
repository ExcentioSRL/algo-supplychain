import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    nomeAzienda: String,
    partitaIVA: String,
})
export const User = mongoose.model('User',userSchema)
export const connectDB = async () => {
    try{
        const conn = mongoose.connect(process.env.MONGODB_URI,);
    }catch (error){
        process.exit(1);
    }
}


/*
export default async function insertNewUser(email,password,nomeAzienda,pIVA){
    const u = new User({
        email: email,
        password: password,
        nomeAzienda: nomeAzienda,
        partitaIVA: pIVA
    })
    await u.save();
}
 */
