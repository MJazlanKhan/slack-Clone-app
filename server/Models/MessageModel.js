import mongoose from "mongoose";
const MessageModel = mongoose.Schema({
    sender:{type:mongoose.Schema.Types.ObjectId,ref:"UserModel"},
    content:{type:String, trim:true},
    imageUrl:{type:String},
    chat:{type:mongoose.Schema.Types.ObjectId, ref:"Chat"}
},
{
    timestamps:true,
}
)
const Message = mongoose.model("Message", MessageModel);
export default Message