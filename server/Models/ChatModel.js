import mongoose from "mongoose";

const ChatModel = mongoose.Schema({
    chatName:{type:String, trim:true},
    isGroupChat:{type:Boolean, default:false},
    users:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"UserModel"
        },
    ],
    latestMessage:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Message"
    },
    groupAdmin:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"UserModel"
    },
    pic:{
        type:String
    }
},
{
    timestamps:true,
}

)

const Chat = mongoose.model("Chat", ChatModel)
export default Chat