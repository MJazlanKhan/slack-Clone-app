import mongoose from "mongoose";


const URL = 'mongodb+srv://slackapp:Jazlan@cluster0.rvc4m0w.mongodb.net/?retryWrites=true&w=majority'
const connectToMongo = async () => {
  try {
    const res = await mongoose.connect(URL);
    if(res){
        console.log("connection sucessfull")
    }
   } catch (error) {
    console.log(error)
   }
}

export default connectToMongo