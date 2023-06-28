const router = require('express').Router();
const {Stock,Request} = require('../database');
const {authenticate} = require('../auth');
const {currentBoxes} = require("../server");
const { filterRequestedStocks,filterStocksByOwner } = require("../stocksIndex")

router.get('/getStocks',authenticate,async (req,res) =>{
    const {user} = req.query;
    if(user === undefined){
        res.status(400);
        return res.json({error: "Missing owner"});
    }
    try{
        const temporaryBoxes = currentBoxes;

        const allRequests = await Request.find({ user });
        const myRequests = allRequests.filter(request => request.oldOwner === user)
        const othersRequests = allRequests.filter(request => request.requester === user)

        const result = temporaryBoxes.filter(box => box.owner === user) //my boxes
        result = result.concat(temporaryBoxes.filter(stock => myRequests.id === temporaryBoxes.id)) //my requests on others boxes
        result = result.concat(temporaryBoxes.filter()) //my boxes that got requested -> add a flag
        res.send(result)
    }catch(error){
        res.status(500);
        return res.json({error: "Internal Server Error"});
    }
});

module.exports = router;