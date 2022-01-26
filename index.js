const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.431bv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run (){
  try{
     await client.connect();
     const database = client.db('trackerdb');
     const usersCollection = database.collection('users');
     console.log('database connected');

     app.post('/users', async (req, res) => {
           const user = req.body;
           const result = await usersCollection.insertOne(user);
           res.json(result);
       });

       app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        // update users role and team
        app.put('/users/role', async (req, res) => {
            const role = req.body;
            const email = role.email;
            console.log(role);
                    const filter = { email };
                    const updateDoc = { $set: { role: role.role,
                      team: role.team
                     } };
                    const result = await usersCollection.updateOne(filter, updateDoc);

                    res.json(result);

        })

        // get all user
            app.get('/users', async (req, res) => {
                      const cursor = usersCollection.find({});
                      const user = await cursor.toArray();
                      res.send(user);
                    });



  }
  finally{

   }}

run().catch(console.dir);

app.get('/',(req,res) => {
  res.send('running server')
})

app.listen(port, () =>{
  console.log("runing on server",port);
})
