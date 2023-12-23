import mongoose from "mongoose";

const UserSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    pic:{
        type:String,
        required:true,
        // default:"https://www.computerhope.com/jargon/g/guest-user.png"
    },
    intro:{
        type:String,
        required:true,
    },
    phone:{
        type:String,
        required:true,
    },
    DOB:{
        type:String,
        required:true,
    },
    Gender:{
        type:String,
        required:true,
    },
    status:{
        type:String,
    },
},
{
    timestamps:true
})
const UserModel = mongoose.model("UserModel", UserSchema)
export default UserModel