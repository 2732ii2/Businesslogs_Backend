import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import connectMongoose from "./DB/mongoose.js";
import UserRegisterModel from "./DB/Schema.js";


const Port = process.env.Port || 7400;

const app=express();
app.use(express.json());
app.use(cors());

connectMongoose();

var noofRequest=0;
app.use((req,res,next)=>{
    noofRequest+=1;
    next();
})
app.get('/',(req,res)=>{
    return res.send("<h1>Hei user Server is running perfectly </h1>");
})


app.get('/noofRequest',(req,res)=>{
    return res.send(`<h1> Current Reuest count is : ${noofRequest} </h1>`);
})

app.post("/register",async(req,res)=>{
    try{
        console.log(req.body);
        const {userName,userId,password}=req.body;
        const SearchUsername= await  UserRegisterModel.findOne({"userName": userName });
        console.log(SearchUsername);
        if(SearchUsername){
            // in user Exists
            res.json({err:"User exists"});
            return ;
        }
        else{
            // not in DB : create And Save
            const decryptedPassword=await bcrypt.hash(password,10);
            console.log(decryptedPassword,userName,userId,password);

            const MainData=new UserRegisterModel({userName,userId,decryptedPassword});
            await MainData.save();
            const token= await jsonwebtoken.sign({userName,userId,decryptedPassword},process.env.JsonPassword);
            console.log(token);
            console.log("congrates data is saved");
            res.json({msg:"User is registered ",token:token});
            return ;
        }
    }
    catch(e){
        res.json({err:e.message});
    }
})
app.post("/login",async(req,res)=>{
    try{
        console.log(req.body);
        const {userName,password}=req.body;
        const SearchUsername= await  UserRegisterModel.findOne({"userName": userName });
        console.log(SearchUsername);
        const {decryptedPassword}=SearchUsername;
        if(SearchUsername?.decryptedPassword){
        
            const jwtCompare=await bcrypt.compare(password,SearchUsername?.decryptedPassword);
            console.log(jwtCompare);

            if(jwtCompare){
                //  user name and password is correct 
                const token= await jsonwebtoken.sign({userName,decryptedPassword},process.env.JsonPassword);
                res.json({msg:"Succeessfully Login",token})
                return ;
            }
            else{
                res.json({err:"Sorry , Password is not correct "})
                return ;
            }
        }
        else{
            res.json({msg:"Sorry , User is not registered "});
            return ;
        }
    }
    catch(e){
        res.json({err:e.message});
    }
})


app.post("/userslist",async(req,res)=>{
    console.log(req.body);
    const {authorization}=req.body;
    try{
        const jwtverification =await jsonwebtoken.verify(authorization,process.env.JsonPassword);
        console.log("jwtverification =>",jwtverification);
        const userList =await UserRegisterModel.find();
        const users=userList.map(e=>e.userName);
        console.log(users.length,users);
        res.json({'msg':"we will send a data"});
    }
    catch(e){
        console.log(e.message);
        res.json({err:e.message});
    }
})
// so basically we don't have to write a functionality for sign out on server side
app.use((err,req,res,next)=>{
    if(err){
        res.json({msg:err.message})
    }
})
app.listen(Port,()=>{
    console.log(`SERVER IS RUNNING at Port : ${Port}`);
})