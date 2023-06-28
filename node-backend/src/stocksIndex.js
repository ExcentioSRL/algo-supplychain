//scrivi il fetch delle lezioni
const { Indexer } = require ('algosdk');
let indexerClient = createIndexerClient();

function createIndexerClient(){
    const token = "";
    const server = "http://localhost";
    const port = 8980;
    return new Indexer(token, server, port);

}

async function getNewStocks(lastID){
    const response = await indexerClient.searchForApplicationBoxes(appID).do();
    return response.boxes;
}

function filterStocksByOwner(boxes, owner){
    return boxes.filter(box => box.owner === owner)
}

function filterRequestedStocks(boxes){
    //return boxes.filter(box => box.name === )
}

module.exports = { getNewStocks,filterRequestedStocks,filterStocksByOwner}