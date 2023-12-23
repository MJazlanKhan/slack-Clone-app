import express from "express";
import cors from 'cors';
import bodyParser from 'body-parser';
import router from './routes/routes.js'
import connectToMongo from './config/db.js';
import { Server } from "socket.io";
import path from "path"

const Mode = "production"
const app = express()
app.use(bodyParser.json());
const PORT = 9000;

connectToMongo()

app.use(cors());
app.use(express.json())
app.use("/api/v1", router)

const __dirname1 = path.resolve();
if(Mode === "production"){
    app.use(express.static(path.join(__dirname1, "../client/build")))
    app.get("*",(req, res)=>{
        res.sendFile(path.resolve(__dirname1 , "client", "build", "index.html"))
    })
}else{
    app.get("/", (req, res) => {
    res.send("API is Running....")
});
}

const server = app.listen(PORT, () => console.log(`Server is Running on ${PORT}`)
)

const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: "http://localhost:3000"
    }
})

io.on("connection", (socket) => {
    console.log('connected to socket.io');
    socket.on('setup', (userData) => {
        socket.join(userData);
        console.log(userData)
        socket.emit('Connected')
    });
    socket.on('join chat', (room) => {
        socket.join(room);
        console.log('user Joined Room ' + room)
    });
    socket.on('typing', (room) => socket.in(room).emit('typing'))
    socket.on('stop typing', (room) => socket.in(room).emit('stop typing'))
    socket.on('new message', (newMessageReceived) => {
        var chat = newMessageReceived.data;
        var users = chat.chat
        // Check if 'users' property is defined in the 'chat' object
        console.log(users)
        if (!users.users) {
            return console.log("Chat Users Not Defined");
        }

        users.users.forEach((user) => {

            if (user && user._id && user._id === chat.sender._id) {
                return;
            }

            // Emit the "message Received" event to the specific user
            socket.in(user._id).emit("messageReceived", chat);
            console.log(user);
        });
    });


})