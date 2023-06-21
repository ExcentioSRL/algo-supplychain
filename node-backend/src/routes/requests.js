const router = require('express').Router();
const { authenticate } = require('../auth');
const {Request} = require('../database');

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
    const {id,owner,requester} = req.body;
    try{
        if (id === undefined || owner === undefined || requester === undefined){
            return res.status(400).json({error: "Missing data"});
        }
        const result = await Request.findOne({id});
        if(result !== null){
            return res.status(400).json({result: "Stock already requested"});
        }else{
            const newRequest = new Request({ id, owner, requester});
            const response  = newRequest.save();
            return res.status(200).json({result: "Request registered correctly"});
        }
    }catch(error){
        return res.status(500).json({error: "Internal Server Error"});
    }
});

router.delete('/deleteRequest',authenticate,async (req,res) => {
    const {id} = req.query;
    try{
        if(id === undefined){
            return res.status(400).json({error: "Missing data"});
        }
        const result = await Request.findOne({id});
        if(result === null){
            return res.status(400).json({ result: "Request doesn't exist" });
        }else{
            await Request.deleteOne({id});
            return res.status(200).json({result: "Request delete correctly"});
        }
    }catch(error){
        return res.status(500).json({ error: "Internal Server Error" });
    }
})

router.get('/getRequestsByOwner',authenticate,async (req,res) => {
    const { owner } = req.query;
    try {
        if (owner === undefined) {
            return res.status(400).json({ error: "Missing data" });
        }
        const result = await Request.find({ owner });
        if (result === null) {
            return res.status(400).json({ result: "No request matches this owner" });
        } else {
            return res.status(200).json(result);
        }
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
})

router.get('/getRequestsByRequester',authenticate,async (req,res) => {
    const { requester } = req.query;
    try {
        if (requester === undefined) {
            return res.status(400).json({ error: "Missing data" });
        }
        const result = await Request.find({ requester });
        if (result === null) {
            return res.status(400).json({ result: "No request matches this requester" });
        } else {
            return res.status(200).json(result);
        }
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
})

module.exports = router;