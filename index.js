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
     const ticketsCollection = database.collection('tickets');
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


       //create new tickets
       app.post('/tickets', async (req, res) => {
             const ticket = req.body;
             const result = await ticketsCollection.insertOne(ticket);
             res.json(result);
         });

         //get all tickets
         app.get('/tickets', async (req, res) => {
                   const cursor = ticketsCollection.find({});
                   const ticket = await cursor.toArray();
                   res.send(ticket);
                 });
       // get tickets with specific email
                           app.get('/tickets', async (req, res) => {
                                         const email = req.query.email;
                                         const query = {email: email}
                                         const cursor = ticketsCollection.find(query);
                                         const tickets = await cursor.toArray();

                                         res.send(tickets);
                                         });
                                         //  delete tickets
                                         app.delete('/tickets/:id', async(req,res) =>{
                                             const id = req.params.id;
                                             const query = {_id: ObjectId(id)};
                                             const result = await ticketsCollection.deleteOne(query);
                                             res.json(result)
                                         })

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
