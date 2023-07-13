import express,{Request,Response} from "express"
import {UserModel} from '../database.js';
import {authenticate} from '../auth.js';

export let router = express.Router();

router.get('/login',async (req: Request,res : Response) => {
    const {email,password} = req.query;
    if(email === undefined || password === undefined){
        res.status(400);
        return res.json({error:"Missing credentials"});
    }
    try{
        const result = await UserModel.findOne({email,password});
        if(result === null){
            res.status(401);
            return res.json({result: "Wrong credentials"});
        }else{
            //req.session.userId = email
            return res.status(200).json(result);
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

router.delete('/removeUser',authenticate,async (req : Request,res : Response) => {
    const {email,password} = req.query;
    try{
        if(email === undefined || password === undefined){
            return res.status(400).json({error: "Some parts of data are missing"});
        }
        const result = await UserModel.findOne({email,password});
        if(result === null){
            return res.status(404).json({result: "User not found"});
        }else{
            await UserModel.deleteOne({email,password});
            return res.status(200).json({result: "User deleted correctly"});
        }
    }catch (error){
        return res.status(500).json({error: "Internal Server Error"});
    }
})

router.get('/searchUsers',authenticate,async (req: Request, res: Response) => {
    const {data} = req.query
    try{
        if(data === undefined){
            return res.status(400).json({ error: "Data is missing" });
        }
        const result = await UserModel.find({data});
        return res.status(200).json(result)
    }catch(error){
        return res.status(500).json({ error: "Internal Server Error" });
    }
})