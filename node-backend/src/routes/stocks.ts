import express, {Request,Response} from "express"
import { StockFromBoxes,RequestClass, StockToSend, fromBoxesToStocks,UserData, rimuoviDuplicati } from "../types.js";
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

        /*getting all users requests and separating them between his requests on others stocks and others requests on his stocks */
        const allRequests: RequestClass[] = await RequestModel.find({ oldOwner: userPIVA } || {requester: userPIVA});
        const othersRequests = allRequests.filter(request => {return request.oldOwner === userPIVA})
        const myRequests = allRequests.filter(request => {return request.requester === userPIVA})

        //getting all of his boxes
        let myBoxes: StockFromBoxes[] = temporaryBoxes.filter(box => {
            return box.owner == userData[0].walletAddress
        })  //my boxes

        let result: StockToSend[] = await Promise.all(myBoxes.map(box => fromBoxesToStocks(box, true)))//my stocks 
        result = result.concat(await filterBoxes(myBoxes,othersRequests,false)) //others requests on my boxes
        result.concat(await filterBoxes(temporaryBoxes, myRequests, true)) //my boxes that got requested 
        
        return res.status(200).json(rimuoviDuplicati(result))
    }catch(error){
        return res.status(500).json({error: "Internal Server Error"});
    }
});

router.get('/searchStocks', async (req: Request, res: Response) => {
    let data = req.query.data
    if(data === undefined){
        res.status(400);
        return res.json({ error: "Missing data" });
    }
    try{
        const temporaryBoxes: StockFromBoxes[] = currentBoxes;
        let result;
        const usersData: UserData[] = await UserModel.find(
            {
                //inserisci l'OR
                nomeAzienda: {
                    "$regex": escapeRegex(data)}
            }
            );
        if(usersData.length !== 0){
            const matchingBoxesByUserData = temporaryBoxes.filter(box => {
                return usersData[0].walletAddress === box.owner || usersData[0].walletAddress === box.producer
            })
            result = await Promise.all(matchingBoxesByUserData.map(box => fromBoxesToStocks(box, true)))
        }else{
            const matchingBoxesByID = temporaryBoxes.filter(box => {
                return box.id.includes(data!.toString())
            })
            result = await Promise.all(matchingBoxesByID.map(box => fromBoxesToStocks(box, true)))
        }
        return res.status(200).json(result);
    }catch(error){
        return res.status(500).json({ error: "Internal Server Error" });
    }
})



function escapeRegex(text : any) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}