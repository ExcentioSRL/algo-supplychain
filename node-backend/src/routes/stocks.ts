import express, {Request,Response} from "express"
import { StockFromBoxes,RequestClass, StockToSend, fromBoxesToStocks } from "../types.js";
import { RequestModel } from "../database.js";
import {authenticate} from '../auth.js';
import { currentBoxes } from "../server.js";
import { filterBoxes } from "../boxes.js";


export let router = express.Router();

router.get('/getStocks',authenticate,async (req : Request,res : Response) =>{
    const {user} = req.query;
    if (user === undefined){
        res.status(400);
        return res.json({error: "Missing owner"});
    }
    try{
        const temporaryBoxes : StockFromBoxes[] = currentBoxes;

        const allRequests: RequestClass[] = await RequestModel.find({ user });
        const myRequests = allRequests.filter(request => request.oldOwner === user)
        const othersRequests = allRequests.filter(request => request.requester === user)

        let myBoxes: StockFromBoxes[] = temporaryBoxes.filter(box => box.owner === user) //my boxes

        let result : StockToSend[] = filterBoxes(temporaryBoxes,myRequests,true) //my requests on others boxes
        result = result.concat(filterBoxes(temporaryBoxes,othersRequests,false)) //my boxes that got requested
        result = result.concat(myBoxes.map(box => fromBoxesToStocks(box,true))) //my stocks 

        return res.status(200).send(result)
    }catch(error){
        res.status(500);
        return res.json({error: "Internal Server Error"});
    }
});
