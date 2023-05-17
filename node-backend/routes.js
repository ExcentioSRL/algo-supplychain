import express from "express";
import {User} from "./database.js"
const router = express.Router();

router.use(function (req,res,next){
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods","GET,HEAD,OPTION,POST,PUT,DELETE");
    res.header("Access-Control-Allow-Headers","auth-token, Origin, X-Requested-With, Content-Type, Accept");
    next();
})

router.get('/login',async (req,res) => {
    const {email,password} = req.query;
    if(email === undefined || password === undefined){
        res.status(400);
        return res.send("Missing credentials");

    }
    try{
        const result = await User.findOne({email,password});
        if(result === null){
            res.status(401);
            return res.send("Wrong credentials");
        }else{
            return res.send("Correct credentials");

        }
    }catch (error){
        res.status(500);
        return res.send("Internal Server Error");
    }
})

router.post('/register', async (req, res) => {
    try{
        const {email, password, nomeAzienda, partitaIVA} = req.body;
        if(email === undefined || password === undefined || nomeAzienda === undefined || partitaIVA === undefined){
            return res.status(400).send("Some parts of data are missing");
        }
        const user = await User.findOne({email,password});
        if(user !== null){
            return res.status(400).send("User already exist, use another email");
        }else{
            const newUser = new User({email,password,nomeAzienda,partitaIVA});
            const response  = newUser.save();
            return res.status(200).send("User registered correctly");
        }
    }catch (error){
        return res.status(500).send("Internal Server Error");
    }
});


router.put('/changePassword',async (req,res) => {
    const {email,password,newPassword} = req.body;
    try{
        if(email === undefined || password === undefined || newPassword === undefined){
            return res.status(400).send("Some parts of data are missing");
        }
        const result = await User.findOne({email,password});
        if(result === null){
            return res.status(404).send("User not found");
        }else{
            result.password = newPassword;
            await User.updateOne({email,password},
                {password: newPassword});
            return res.status(200).send("password changed correctly");
        }
    }catch(error){
        return res.status(500).send("Internal Server Error");
    }
})

//aggiungere cambio nomeAzienda e partitaIVA?

router.delete('/removeUser',async (req,res) => {
    const {email,password} = req.query;
    try{
        if(email === undefined || password === undefined){
            return res.status(400).send("Some parts of data are missing");
        }
        const result = await User.findOne({email,password});
        if(result === null){
            return res.status(404).send("User not found");
        }else{
            await User.deleteOne({email,password});
            return res.status(200).send("User deleted correctly");
        }
    }catch (error){
        return res.status(500).send("Internal Server Error");
    }
})


export default router;