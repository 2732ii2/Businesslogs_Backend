import {model ,Schema} from "mongoose";


const UserRegisterSchema= new Schema({
     userName:String,
     userId:String,
     decryptedPassword:String,
    });
const UserRegisterModel = model('BusinessRegister', UserRegisterSchema);

export default UserRegisterModel;


// const kitty = new Cat({ name: 'Zildjian' });
// kitty.save().then(() => console.log('meow'));