import jsonwebtoken from "jsonwebtoken";
import Datamodel from "../DB/DataSchema.js";
import multiparty  from 'multiparty' ;
import ProductModel from "../DB/ProductSchema.js";
import  moment  from 'moment';

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

function getLastMonthSameDate(dateString) {
    // Parse the input date
    const date = new Date(dateString);

    // Subtract one month
    const lastMonthDate = new Date(date);
    lastMonthDate.setMonth(date.getMonth() - 1);

    // Format the date
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = lastMonthDate.toLocaleDateString('en-US', options);

    return formattedDate;
}
function filteredDataofmonth(arr,std,endd){
    const filteredResults = arr.filter(doc => {
        const docDate = new Date(doc.timing);
        return docDate >= std && docDate <= endd;
    });
    return filteredResults;
}
const expenseCal=async (req,res)=>{
 // if don't get any filteration according to the time 

 // then we show last month datat
 // else we definitely get start date and end date : now we can easily send the filtered data
 

    try{
        var {date}=req.body;
        const {authorization}=req.headers;
        var expense,selling,repairing,count_;
        console.log("date=>",date);
        const jwtverification=await  jsonwebtoken.verify(authorization,process.env.JsonPassword);
        console.log(jwtverification);
        var  searchTerm = date ;
        searchTerm=(searchTerm.split(" ")[1]+" "+searchTerm.split(" ")[2]+" "+searchTerm.split(" ")[3]);
        console.log(searchTerm);
        // searchTerm="Apr 29 2024"
        const lmd = getLastMonthSameDate(searchTerm);
        console.log("lmd=>",lmd);
        var startDate,endDate;
        // console.log(req.headers);
        if(req.headers.startdate && req.headers.enddate){
            console.log("1");
            startDate=new Date(req.headers.startdate);
            endDate=new Date(req.headers.enddate);
            const results = await Datamodel.find({
                type: "expense"
            });
            const res1 = await Datamodel.find({
                type: "selling"
            });
            const res2 = await Datamodel.find({
                type: "repairing"
            });
            const res3 = await Datamodel.find();
            // console.log("results=>",results,res1,res2);
            const filteredResults=filteredDataofmonth(results,startDate,endDate);
            const fil1Results=filteredDataofmonth(res1,startDate,endDate);
            const fil2Results=filteredDataofmonth(res2,startDate,endDate);
            const fil3Results=filteredDataofmonth(res3,startDate,endDate);
            console.log(filteredResults,fil1Results,fil2Results);
           expense = filteredResults.map(doc => ({ Price: doc.Price }));
            selling= fil1Results.map(doc => ({ Price: doc.Price }));
            repairing= fil2Results.map(doc => ({ Price: doc.Price }));
            count_=fil3Results.map(doc => ({ Price: doc.Price })).length;
            console.log("=>finalResults",expense,selling,repairing);
        }   
        else{
            // startDate = new Date(lmd);
            // endDate = new Date(searchTerm);
            console.log("2");
            // console.log(await Datamodel.find({ timing: { $regex: searchTerm, $options: 'i' },type:"selling" }));
         expense=await Datamodel.find({ timing: { $regex: searchTerm, $options: 'i' },type:"expense" },{ Price: 1, _id: 0 });
         repairing=await Datamodel.find({ timing: { $regex: searchTerm, $options: 'i' },type:"repairing" },{ Price: 1, _id: 0 });
         selling=await Datamodel.find({ timing: { $regex: searchTerm, $options: 'i' },type:"selling" },{ Price: 1, _id: 0 });
         count_=(await Datamodel.find({ timing: { $regex: searchTerm, $options: 'i' } })).length;
         // console.log(expense,repairing,selling);

        }
        // console.log(startDate,endDate);
        


        
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


            // console.log(data_,count_);
            res.json({msg:"data getted it",sellingamount,repairingamount,expenseamount,"total transaction":count_});
        }
    
    catch(e){
        res.status(400).json({msg:e.message});
    }
}


const Productadd=async (req,res)=>{
    const {authorization}=req.headers;
    try{
        const verified=jsonwebtoken.verify(authorization,process.env.JsonPassword);
        console.log(verified);
        var form = new multiparty.Form();
        await form.parse(req,async function(err, fields, files) {
            if(Object.keys(files).length){
                let {name,price}=fields;
                let {image}=files;
                console.log(price[0],name[0],image[0])
                const validate=new ProductModel({Name:name[0],Image:image[0],Price:price[0]});
                await validate.save();
                console.log("after Data Submitted");
                res.status(200).json({mes:'Data submitted'});
            }
            else{
                let {name,price,image}=fields;
                console.log(name[0],price[0],image[0]);
                const validate=new ProductModel({Name:name[0],Image:image[0],Price:price[0]});
                console.log(validate);
                await validate.save();
                console.log("after Data Submitted");
                res.status(200).json({mes:'Data submitted'});
            }
        });
        // console.log("Data submitted");
        // res.status(200).json({mes:'Data submitted'});
    }
    catch(e){
        console.log(e.message);
        res.status(401).json({mes:` unauthorized : ${e.message} `});
    }
}

const getProducts=async(req,res)=>{
    const data=req.body;
    const {authorization,type,page}=req.headers;
    console.log(authorization,type);
    try{
        const jwtverification=await  jsonwebtoken.verify(authorization,process.env.JsonPassword);
        console.log(jwtverification);
        const datacount=(await ProductModel.find()).length;
        const databyid=(await ProductModel.find())
        .reverse()
        // .slice((page-1)*5,page*5);
        console.log({count:datacount,"data":databyid});
       res.status(200).json({msg:"Data Successfully recieved",count:datacount,"data":databyid});
        
    }
    catch(e){
        res.status(400).json({msg:e.message});
    }
}
export {DataInsertController,GetdatabyId,expenseCal,Productadd,getProducts};