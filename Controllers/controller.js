import jsonwebtoken from "jsonwebtoken";
import Datamodel from "../DB/DataSchema.js";


const DataInsertController=async(req,res)=>{
    console.log(req.body);
    const data=req.body;
    const {authorization,type}=req.headers;
    var obj={};
    if(type=="selling"){
        console.log(data.nameofHelment);
        if(data.nameofHelment && data.sellingprice){
        }
        else{
            return res.status(400).json({err:"data insufficient",status:400});
        }
        obj={"Name" : data.nameofHelment,"Price":data.sellingprice,type,"timing":`${new Date()}`};
    }
    else if (type=="repairing"){
        console.log(data);
        if((data.reparing && data.reparingprice)){
        }
        else{
            return res.status(400).json({err:"data insufficient",status:400})
           
        }
        obj={"Name" : data.reparing,"Price":data.reparingprice,type,"timing":`${new Date()}`};
    }
    else{
        if(data.nameofExpense && data.price){
        }
        else{
            return res.status(400).json({err:"data insufficient",status:400});
        }
        obj={"Name" : data.nameofExpense,"Price":data.price,type,"timing":`${new Date()}`};
    }
    console.log(obj);
    try{
        const jwtverification =await jsonwebtoken.verify(authorization,process.env.JsonPassword);
        console.log("jwtverification =>",jwtverification);
        const Data=await Datamodel.create({...obj,type});
        const result=await  Data.save();
        console.log(Data,result);
        res.json({"message":"data inserted"});
    }
    catch(e){
        console.log(e.message);
        res.status(501).json({err:"Some issues occured"});
    }
}

const GetdatabyId=async(req,res)=>{
    const data=req.body;
    const {authorization,type,page}=req.headers;
    console.log(authorization,type);
    try{
        const jwtverification=await  jsonwebtoken.verify(authorization,process.env.JsonPassword);
        console.log(jwtverification);
        const datacount=(await Datamodel.find({type:type})).length;
        const databyid=(await Datamodel.find({type:type})).reverse()
        .slice((page-1)*5,page*5);
        console.log({count:datacount,"data":databyid});
       res.status(200).json({msg:"Data Successfully recieved",count:datacount,"data":databyid});
        
    }
    catch(e){
        res.status(400).json({msg:e.message});
    }
}
export {DataInsertController,GetdatabyId};