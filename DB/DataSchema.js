import {model ,Schema} from "mongoose";
const DataSchema=new Schema({
    Name:String,
    Price:Number,
    type:String,
    timing:String,
});
const Datamodel=model("Datamodel",DataSchema);
export default Datamodel;
