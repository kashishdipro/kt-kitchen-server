const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// Middle wares
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.kdtr5cm.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const itemCollection = client.db("ktKitchen").collection("foodItems");
        app.get('/items', async(req, res) =>{
            const query = {}
            const cursor = itemCollection.find(query);
            const cursorLimit = itemCollection.find(query).limit(3);
            const limiteditems = await cursorLimit.toArray();
            const items = await cursor.toArray();
            res.send({limiteditems, items});
        });
        app.get('/items/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const item = await itemCollection.findOne(query);
            res.send(item);
        })
    }finally{

    }
}
run().catch(error => console.error(error))


app.get('/', (req, res) =>{
    res.send('KT Kitchen server is running')
})

app.listen(port, () =>{
    console.log(`KT Kitchen server running on ${port}`);
})