import express from "express";
import {User} from "./database.js"
const router = express.Router();
router.use(function (req,res,next){
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods","GET,HEAD,OPTION,POST,PUT,DELETE");
    res.header("Access-Control-Allow-Headers","auth-token, Origin, X-Requested-With, Content-Type, Accept");
    next();
})
router.get('/',async (req,res) => {
    const {email,password} = req.query;
    if(email === undefined || password === undefined){
        res.status(400);
        res.send("Credenziali mancanti");
        return;
    }
    try{
        await User.findOne({email,password});
        //qui non funziona, mettere un throw?
        res.send("Credenziali corrette");
        return;
    }catch (error){
        res.status(401);
        res.send("Credenziali errate");
        return;
    }

})
//da testare
router.post('/users', async (req, res) => {
    const { username, password, nomeAzienda, partitaIVA } = req.body;
    const newUser = new User({ username, password,nomeAzienda,partitaIVA });
    const response  = newUser.save();


});

export default router;