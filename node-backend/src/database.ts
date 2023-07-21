import dotenv from 'dotenv'
import {connect,model,Schema} from 'mongoose'

dotenv.config();

const userSchema = new Schema({
    email: String,
    password: String,
    nomeAzienda: String,
    partitaIVA: String,
    walletAddress: String
})
export const UserModel = model('User',userSchema)


const requestSchema = new Schema({
    id: String,
    oldOwner: String, //pIVA
    requester: String, //pIVA
    isApproved: Boolean
})
export const RequestModel = model('Request',requestSchema)


export async function connectDB(){
    try {
        const conn = connect(process.env.MONGODB_URI!);
    } catch (error) {
        process.exit(1);
    }
}


