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
        return res.send("Missing credential");

    }
    try{
        const result = await User.findOne({email,password});
        if(result === null){
            res.status(401);
            return res.send("Wrong credentials");
        }else{
            return res.send("Correct credential");

        }
    }catch (error){
        res.status(500);
        return res.send("Internal Error");
    }
})
//da testare
router.post('/users', async (req, res) => {
    const { username, password, nomeAzienda, partitaIVA } = req.body;
    const newUser = new User({ username, password,nomeAzienda,partitaIVA });
    const response  = newUser.save();
    if(response){
        return res.status(500).send("Internal error");
    }else{
        return res.send("User successfully registered");
    }

});

export default router;