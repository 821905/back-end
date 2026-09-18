import express from 'express'
import { collectionName, connection } from './dbconfig.js';
import cors from 'cors'
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

const app =express();

app.use(express.json());
app.use(cors({origin:'http://localhost:5173', credentials:true}));
app.use(cookieParser())

app.post("/login", async(req,resp)=>{
    const userData = req.body;
    if( userData.email && userData.password){
        const db = await connection();
        const collection = await db.collection('user');
        const result = await collection.findOne({email:userData.email.trim(), password:userData.password.trim()})
        if(result){
            jwt.sign(userData,'Google',{expiresIn:'5d'},(error,token)=>{
                resp.cookie('token', token)
                resp.send({
                    success:true,
                    message:"login is done",
                    token
                })
            })
        }else{
            resp.send({success:false,message:"invalid email or password"})
        }
    }else{
         resp.send({
                    success:false,
                    message:"login is not done",
                })
    }
})


app.post("/signup", async(req,resp)=>{
    const userData = req.body;
    if(userData.name && userData.email && userData.password){
        const db = await connection();
        const collection = await db.collection('user');
        const result = await collection.insertOne(userData)
        if(result){
            jwt.sign(userData,'Google',{expiresIn:'5d'},(error,token)=>{
                resp.cookie('token', token)
                resp.send({
                    success:true,
                    message:"signup is done",
                    token
                })
            })
        }
    }else{
         resp.send({
                    success:false,
                    message:"signup is not done",
                })
    }
})

app.post("/add-task", verifyJWTToken ,async (req,resp)=>{
    try {
    const db =await connection();
    const collection =await db.collection(collectionName)
    const result =await collection.insertOne(req.body)
    if(result){
        resp.send({message:'new task added successfully',success:true,result})
    }else{
         resp.send({message:'new task not added successfully',success:false})
    }
    } catch (error) {
        console.log("ERROR:", error);

    resp.status(500).send({
      message: "Task not added",
      success: false,
      error: error.message,
    });
    }
   

})


app.get("/task",verifyJWTToken, async (req,resp)=>{
    console.log("cookies test", req.cookies['token']);
    
    try {
         const db =await connection();
    const collection =await db.collection(collectionName)
    const result =await collection.find().toArray();
    if(result){
        resp.send({message:'task list fetch',success:true,result})
    }else{
         resp.send({message:'error try sometime after fatch task',success:false})
    }
    } catch (error) {
        console.log("ERROR:", error);

    resp.status(500).send({
      message: "Task not added",
      success: false,
      error: error.message,
    });
    }
   

})




app.get("/task/:id", verifyJWTToken, async (req,resp)=>{
    try {
         const db =await connection();
          const id = req.params.id
    const collection =await db.collection(collectionName)
    const result =await collection.findOne({_id:new ObjectId(id)})
    if(result){
        resp.send({message:'task list fetch',success:true,result})
    }else{
         resp.send({message:'error try sometime after fatch task',success:false})
    }
    } catch (error) {
        console.log("ERROR:", error);

    resp.status(500).send({
      message: "Task not added",
      success: false,
      error: error.message,
    });
    }
   

})


app.put("/UpdateTask/:id",verifyJWTToken ,async (req,resp)=>{
    try {
         const db =await connection();
          const id = req.params.id
    const collection =await db.collection(collectionName)
     const updateData = { ...req.body };
    delete updateData._id; 
    const update ={$set:updateData}
    const result =await collection.updateOne({_id:new ObjectId(id)},update)
    if(result){
        resp.send({message:'task updated ',success:true,result})
    }else{
         resp.send({message:'error try sometime after update task',success:false})
    }
    } catch (error) {
        console.log("ERROR:", error);

    resp.status(500).send({
      message: "Task not added",
      success: false,
      error: error.message,
    });
    }
   

})



app.delete("/delete/:id",verifyJWTToken, async (req,resp)=>{
    try {
         const db =await connection();
         const id = req.params.id
    const collection =await db.collection(collectionName)
    const result =await collection.deleteOne({_id:new ObjectId (id)})
    if(result){
        resp.send({message:'task list fetch',success:true,result})
    }else{
         resp.send({message:'error try sometime after fatch task',success:false})
    }
    } catch (error) {
        console.log("ERROR:", error);

    resp.status(500).send({
      message: "Task not added",
      success: false,
      error: error.message,
    });
    }
   

})

function verifyJWTToken(req,resp,next){
    //  console.log("verifyJWTToken", req.cookies['token']);
     const token = req.cookies['token'];
     jwt.verify(token, "Google",(error,decode)=>{
        if(error){
            return resp.send({
                message:"invalid token",
                success:false,
                token
            })
        }
         next()
     })
    

}

app.listen(2200);