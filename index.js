const express = require('express');
const cors = require('cors');
// const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// Middle wares
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.kdtr5cm.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// function verifyJWT(req, res, next){
//     const authHeader = req.headers.authorization;
//     if(!authHeader){
//         return res.status(401).send({message: 'Unauthorized Access!'})
//     }
//     const token = authHeader.split(' ')[1];
//     jwt.verify(token,process.env.ACCESS_TOKEN_SECRET, function(error, decoded){
//         if(error){
//             return res.status(403).send({message: 'Forbidden Access!'})
//         }
//         req.decoded = decoded;
//         next();
//     })
// }

async function run(){
    try{
        const itemCollection = client.db("ktKitchen").collection("foodItems");
        const reviewCollection = client.db("ktKitchen").collection("reviewerComment");
        
        app.get('/items', async(req, res) =>{
            const query = {}
            // Find Limited Items 
            const cursorLimit = itemCollection.find(query).limit(3);
            const limiteditems = await cursorLimit.toArray();
            // Find All Items
            const cursor = itemCollection.find(query);
            const items = await cursor.toArray();
            // Find Limited Latest Items
            const cursorLatest = itemCollection.find(query).sort({_id: -1}).limit(4);
            const latestitems = await cursorLatest.toArray();
            res.send({limiteditems, items, latestitems});
        });

        app.get('/items/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const item = await itemCollection.findOne(query);
            res.send(item);
        })

        app.post('/items', async(req, res) =>{
            const review = req.body;
            const result = await itemCollection.insertOne(review);
            res.send(result);
        })

        // Review api
        app.get('/reviews', async(req, res) =>{
            // const decoded = req.decoded.email;
            // if(decoded.email !== req.query.email){
            //     return res.status(403).send({message: 'Forbidden Access!'});
            // }
            let query = {};
            if(req.query.email){
                query = {
                    email: req.query.email
                }
            }
            if (req.query.item) {
                query = {
                    item: req.query.item
                }
            } 
            const cursor = reviewCollection.find(query).sort({_id: -1});
            const review = await cursor.toArray();
            res.send(review);
        })

        // Post Review Api
        app.post('/reviews', async(req, res) =>{
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(review);
        })

        // Delete Review Api
        app.delete('/reviews/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        })

        // Edit Review Api
        app.get('/review/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const item = await reviewCollection.findOne(query);
            res.send(item);
        })

        app.patch('/review/:id', async(req, res) =>{
            const id = req.params.id;
            const review = req.body.message;
            const query = {_id: ObjectId(id)};
            const updatedReview = {
                $set:{
                    message: review
                }
            }
            const result = await reviewCollection.updateOne(query, updatedReview);
            res.send(result);
        })

        app.post('/jwt', (req,res) =>{
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '10h'});
            res.send({token})
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