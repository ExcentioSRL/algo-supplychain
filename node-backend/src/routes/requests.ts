import { authenticate } from '../auth.js';
import { RequestModel } from "../database.js";
import express, { Request,Response } from "express";

export let router = express.Router();

router.post('/createRequest',authenticate,async (req : Request,res : Response) => {
    const {id,oldOwner,requester} = req.body;
    try{
        if (id === undefined || oldOwner === undefined || requester === undefined){
            return res.status(400).json({error: "Missing data"});
        }
        const result = await RequestModel.findOne({id});
        if(result !== null){
            return res.status(400).json({result: "Stock already requested"});
        }else{
            const newRequest = new RequestModel({ id, oldOwner, requester});
            const response  = newRequest.save();
            return res.status(200).json({result: "Request registered correctly"});
        }
    }catch(error){
        return res.status(500).json({error: "Internal Server Error"});
    }
});

router.delete('/deleteRequest',authenticate,async (req : Request,res : Response) => {
    const {id} = req.query;
    try{
        if(id === undefined){
            return res.status(400).json({error: "Missing data"});
        }
        const result = await RequestModel.findOne({id});
        if(result === null){
            return res.status(400).json({ result: "Request doesn't exist" });
        }else{
            await RequestModel.deleteOne({id});
            return res.status(200).json({result: "Request delete correctly"});
        }
    }catch(error){
        return res.status(500).json({ error: "Internal Server Error" });
    }
})
