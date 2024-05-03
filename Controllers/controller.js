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
const expenseCal=async (req,res)=>{
    
    try{
        var {date}=req.body;
        const {authorization}=req.headers;
        console.log(date);
        const jwtverification=await  jsonwebtoken.verify(authorization,process.env.JsonPassword);
        console.log(jwtverification);
        var  searchTerm = date ;
        searchTerm=(searchTerm.split(" ")[1]+" "+searchTerm.split(" ")[2]+" "+searchTerm.split(" ")[3]);
        console.log(searchTerm);
        // searchTerm="Apr 29 2024"
        console.log(await Datamodel.find({ timing: { $regex: searchTerm, $options: 'i' },type:"selling" }));
        const expense=await Datamodel.find({ timing: { $regex: searchTerm, $options: 'i' },type:"expense" },{ Price: 1, _id: 0 });
        const repairing=await Datamodel.find({ timing: { $regex: searchTerm, $options: 'i' },type:"repairing" },{ Price: 1, _id: 0 });
        const selling=await Datamodel.find({ timing: { $regex: searchTerm, $options: 'i' },type:"selling" },{ Price: 1, _id: 0 });
        var sellingamount=0;
        selling.forEach(e=>{
            sellingamount+=e.Price
        })
        var repairingamount=0;
        repairing.forEach(e=>{
            repairingamount+=e.Price
        })
        var expenseamount=0;
        expense.forEach(e=>{
            expenseamount+=e.Price
        })
        console.log(sellingamount,repairingamount,expenseamount);
        const count_=(await Datamodel.find({ timing: { $regex: searchTerm, $options: 'i' } })).length;

            // console.log(data_,count_);
            res.json({msg:"data getted it",sellingamount,repairingamount,expenseamount,"total transaction":count_});
        }
    
    catch(e){
        res.status(400).json({msg:e.message});
    }
}
export {DataInsertController,GetdatabyId,expenseCal};