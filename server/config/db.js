import mongoose from "mongoose";


const URL = 'mongodb+srv://slackapp:Jazlan123@cluster0.rvc4m0w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
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
