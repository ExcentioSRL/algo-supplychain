import express, {Request,Response} from "express"
import { StockFromBoxes,RequestClass, StockToSend, fromBoxesToStocks,UserData } from "../types.js";
import { RequestModel, UserModel } from "../database.js";
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

        /*getting user Data */
        const userData : UserData[] = await UserModel.find({walletAddress: user})
        if(userData[0].walletAddress === undefined){
            return res.status(404).send({error: "no wallet associated with this account"})
        }
        const userPIVA = userData[0].partitaIVA
        /*getting all users requests and separating them between his requetsts on others stocks and others requests on his stocks */
        //const allRequests: RequestClass[] = await RequestModel.find({ userPIVA });
        //const myRequests = allRequests.filter(request => request.oldOwner === userPIVA)
        //const othersRequests = allRequests.filter(request => request.requester === userPIVA)

        //getting all of this boxes
        let myBoxes: StockFromBoxes[] = temporaryBoxes.filter(box => {
            return box.owner == userData[0].walletAddress
        })  //my boxes

        //let result : StockToSend[] = filterBoxes(temporaryBoxes,myRequests,true) //my requests on others boxes
        //result = result.concat(filterBoxes(temporaryBoxes,othersRequests,false)) //my boxes that got requested
        let result = await Promise.all(myBoxes.map(box => fromBoxesToStocks(box,true)))//my stocks 
        return res.status(200).send(result)
    }catch(error){
        res.status(500);
        console.log("OLA " + error)
        return res.json({error: "Internal Server Error"});
    }
});
