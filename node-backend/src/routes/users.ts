import express,{Request,Response} from "express"
import {UserModel} from '../database.js';
import {authenticate} from '../auth.js';
import { UserData, partitaIVA } from "../types.js";

export let router = express.Router();

router.get('/login',async (req: Request,res : Response) => {
    const {email,password} = req.query;
    if(email === undefined || password === undefined){
        res.status(400);
        return res.json({error:"Missing credentials"});
    }
    try{
        const result : UserData[] = await UserModel.find({email:email,password:password});
        if(result === null){
            res.status(401);
            return res.json({result: "Wrong credentials"});
        }else{
            const pIVA : partitaIVA = result[0].partitaIVA!
            const nomeAzienda : string = result[0].nomeAzienda!
            console.log()
            //req.session.userId = email
            return res.status(200).json({pIva: pIVA, nomeAzienda: nomeAzienda});
        }
    }catch (error){
        res.status(500);
        return res.json({error: "Internal Server Error"});
    }
});

router.get('/logout',authenticate,async (req : Request,res : Response) => {
    req.session.destroy(function (err){
    });
});

router.post('/register', async (req : Request, res: Response) => {
    try{
        const {email, password, nomeAzienda, partitaIVA,walletAddress} = req.body;
        if(email === undefined || password === undefined || nomeAzienda === undefined || partitaIVA === undefined){
            return res.status(400).json({error: "Some parts of data are missing"});
        }
        const user = await UserModel.findOne({email,password});
        if(user !== null){
            return res.status(400).json({result: "User already exist, use another email"});
        }else{
            const newUser = new UserModel({email,password,nomeAzienda,partitaIVA,walletAddress});
            const response  = newUser.save();
            return res.status(200).json({result: "User registered correctly"});
        }
    }catch (error){
        return res.status(500).json({error: "Internal Server Error"});
    }
});

router.put('/changePassword',authenticate,async (req : Request,res : Response) => {
    const {email,password,newPassword} = req.body;
    try{
        if(email === undefined || password === undefined || newPassword === undefined){
            return res.status(400).json({error: "Some parts of data are missing"});
        }
        const result = await UserModel.findOne({email,password});
        if(result === null){
            return res.status(404).json({result: "User not found"});
        }else{
            result.password = newPassword;
            await UserModel.updateOne({email,password},
                {password: newPassword});
            return res.status(200).json({result: "Password changed correctly"});
        }
    }catch(error){
        return res.status(500).json({error: "Internal Server Error"});
    }
})