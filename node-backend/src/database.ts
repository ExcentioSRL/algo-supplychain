import dotenv from 'dotenv'
import {connect,model,Schema} from 'mongoose'

dotenv.config();

const userSchema = new Schema({
    email: String,
    password: String,
    nomeAzienda: String,
    partitaIVA: String,
    WalletAddress: String,
})
export const UserModel = model('User',userSchema)


const requestSchema = new Schema({
    id: String,
    oldOwner: String,
    requester: String
})
export const RequestModel = model('Request',requestSchema)


export async function connectDB(){
    try {
        const conn = connect(process.env.MONGODB_URI!);
    } catch (error) {
        process.exit(1);
    }
}


