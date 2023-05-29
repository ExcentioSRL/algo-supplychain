const router = require('express').Router();
const {Stock} = require('../database');
const {authenticate} = require('../auth');

router.get('/getStocksByOwner',authenticate,async (req,res) =>{
    const {owner} = req.query;
    if(owner === undefined){
        res.status(400);
        return res.json({error: "Missing owner"});
    }
    try{
        const result = await Stock.findOne({owner});
        if(result == null){
            return res.json({result: "No data found"})
        }else{
            return res.json(result)
        }
    }catch(error){
        res.status(500);
        return res.json({error: "Internal Server Error"});
    }
});

router.post('/addNewStock',authenticate,async (req,res)=>{
    const {id,creator,owner} = req.body;
    if(id === undefined || creator === undefined || owner === undefined){
        return res.status(400).json({error: "Some parts of data are missing"});
    }
    try{
        const result = Stock.findOne({id});
        if(result !== null){
            return res.status(400).json({result: "Stock already exists"});
        }else{
           const newStock = new Stock({id,creator,owner});
           const response = newStock.save();
           return res.status(200).json({result: "Stock registered correctly"});
        }
    }catch(error){
        return res.status(500).json({error: "Internal Server Error"});
    }
});

router.put('/changeOwner',authenticate,async (req,res) => {
    const {id,newOwner} = req.body;
    if(id === undefined || newOwner === undefined){
        return res.status(400).json({error: "Some parts of data are missing"});
    }
    try{
        const result = Stock.findOne({id});
        if(result === null){
            return res.status(400).json({result: "Stock doesn't exist"});

        }else{
            result.owner = newOwner;
            await Stock.updateOne({id},{owner: newOwner});
            return res.status(200).json({result: "Owner changed correctly"});
        }
    }catch(error){
        return res.status(500).json({error: "Internal Server Error"});
    }
});

router.delete('/removeStock',authenticate,async (req,res) =>{
    const {id} = req.query;
    if(id === undefined){

    }
    try{
        const result = await Stock.findOne({id});
        if(result === null){
            return res.status(404).json({result: "Stock not found"});
        }else{
            await Stock.deleteOne({id});
            return res.status(200).json({result: "Stock delete correctly"});
        }
    }catch(error){
        return res.status(500).json({error: "Internal Server Error"});
    }
});
module.exports = router;