const router = require('express').Router();
const {User} = require('../database.js');
const {authenticate} = require('../auth.js');

router.get('/login',async (req,res) => {
    const {email,password} = req.query;
    if(email === undefined || password === undefined){
        res.status(400);
        return res.json({error:"Missing credentials"});
    }
    try{
        const result = await User.findOne({email,password});
        if(result === null){
            res.status(401);
            return res.json({result: "Wrong credentials"});
        }else{
            req.session.userId = email
            return res.json({result: "Correct credentials"});
        }
    }catch (error){
        res.status(500);
        return res.json({error: "Internal Server Error"});
    }
});

router.get('/nomeAziendaByPartitaIVA',authenticate,async (req,res) => {
    try{
        const {partitaIVA} = req.query;
        if(partitaIVA === undefined){
            return res.status(400).json({error:"Missing partitaIVA"});
        }
        const result = await User.findOne({partitaIVA});
        if(result == null){
            res.status(404);
            return res.json({result: "Given partitaIVA doesn't match an existing user"});
        }else{
            return res.json(result);
        }
    }catch(error){
        res.status(500);
        return res.json({error: "Internal Server Error"});
    }
});

router.get('/partitaIVAByEmail',authenticate,async (req,res) =>{
    try{
        const {email} = req.query;
        if(email === undefined){
            return res.status(400).json({error: "Missing email"});
        }
        const result = await User.findOne({email});
        if(result == null){
            res.status(404);
            return res.json({result: "Given email doesn't match an existing user"});
        }else{
            return res.json(result);
        }
    }catch(error){
        res.status(500);
        return res.json({error: "Internal Server Error"});
    }
});

router.post('/register', async (req, res) => {
    try{
        const {email, password, nomeAzienda, partitaIVA} = req.body;
        if(email === undefined || password === undefined || nomeAzienda === undefined || partitaIVA === undefined){
            return res.status(400).json({error: "Some parts of data are missing"});
        }
        const user = await User.findOne({email,password});
        if(user !== null){
            return res.status(400).json({result: "User already exist, use another email"});
        }else{
            const newUser = new User({email,password,nomeAzienda,partitaIVA});
            const response  = newUser.save();
            return res.status(200).json({result: "User registered correctly"});
        }
    }catch (error){
        return res.status(500).json({error: "Internal Server Error"});
    }
});

router.put('/changePassword',authenticate,async (req,res) => {
    const {email,password,newPassword} = req.body;
    try{
        if(email === undefined || password === undefined || newPassword === undefined){
            return res.status(400).json({error: "Some parts of data are missing"});
        }
        const result = await User.findOne({email,password});
        if(result === null){
            return res.status(404).json({result: "User not found"});
        }else{
            result.password = newPassword;
            await User.updateOne({email,password},
                {password: newPassword});
            return res.status(200).json({result: "Password changed correctly"});
        }
    }catch(error){
        return res.status(500).json({error: "Internal Server Error"});
    }
})

router.delete('/removeUser',authenticate,async (req,res) => {
    const {email,password} = req.query;
    try{
        if(email === undefined || password === undefined){
            return res.status(400).json({error: "Some parts of data are missing"});
        }
        const result = await User.findOne({email,password});
        if(result === null){
            return res.status(404).json({result: "User not found"});
        }else{
            await User.deleteOne({email,password});
            return res.status(200).json({result: "User deleted correctly"});
        }
    }catch (error){
        return res.status(500).json({error: "Internal Server Error"});
    }
})

module.exports = router;