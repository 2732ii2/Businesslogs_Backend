import { Schema,model } from "mongoose";

const ProductSchema=new Schema({
    Name:String,
    Image: Object || String,
    Price:Number
})
const ProductModel=model("ProductSchema",ProductSchema);
export default ProductModel;