const router = require('express').Router();
const { authenticate } = require('../auth');
const {Request, Stock} = require('../database');

router.get('/getRequestByStockID',authenticate,async (req,res) => {
    const {id} = req.query;
    try{
        if(id === undefined){
            return res.status(400).json({error: "Missing data"})
        }
        const resultRequest = await Request.findOne({id});
        if(resultRequest === null){
            return res.status(404).json({result: "Request on that stock doesn't exist"});
        }else{
            return res.status(200).json(resultRequest);
        }
    }catch(error){
        return res.status(500).json({error: "Internal Server Error"});
    }
});

router.post('/createRequest',authenticate,async (req,res) => {
    const {idStock,newOwner} = req.body;
    try{
        if(idStock === undefined || newOwner === undefined){
            return res.status(400).json({error: "Missing data"});
        }
        const result = await Request.findOne({idStock});
        if(result !== null){
            return res.status(400).json({result: "Stock already requested"});
        }else{
            const newRequest = new Request({idStock,newOwner});
            const response  = newRequest.save();
            return res.status(200).json({result: "Request registered correctly"});
        }
    }catch(error){
        return res.status(500).json({error: "Internal Server Error"});
    }
});

module.exports = router;