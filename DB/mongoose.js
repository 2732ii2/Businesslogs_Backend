
import mongoose from  'mongoose';
const connectMongoose =async()=>{
    try{
        await mongoose.connect('mongodb+srv://Mkhan:Ashad123@cluster0.uydprj9.mongodb.net/');
        console.log("DB is CONNECTED");
    }
    catch(e){
        console.log(e.message);
    }
}

export default connectMongoose;
