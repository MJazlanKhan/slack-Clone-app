import express from "express";
import UserModel from "../Models/UserModel.js"
import bcryptjs from 'bcryptjs'
import jwt from "jsonwebtoken"
import Chat from "../Models/ChatModel.js";
import Message from "../Models/MessageModel.js"
import mongoose from "mongoose";
class authController {
    static userRegisteration = async (req, res) => {
        const { email, password, name, phone, intro, DOB, Gender, pic } = req.body;
        try {
            if (email, password, name, phone, intro, DOB, Gender, pic) {
                const isUser = await UserModel.findOne({ email: email });
                if (!isUser) {
                    const genSalt = await bcryptjs.genSalt(10);
                    const hashPassword = await bcryptjs.hash(password, genSalt);

                    const newUser = new UserModel({
                        email: email,
                        password: hashPassword,
                        name: name,
                        intro: intro,
                        phone: phone,
                        DOB: DOB,
                        Gender: Gender,
                        pic: pic,
                    })
                    const savedUser = await newUser.save()
                    if (savedUser) {
                        return res.status(200).json({ message: "Users Registration SUcessfully" })
                    }
                } else {
                    return res.status(400).json({ message: "Email Already Registered" })
                }
            } else {
                return res.status(400).json({ message: "All Fields are Required" })
            }
        } catch (error) {
            return res.status(400).json({ message: error.message })
        }
    }
    static userLogin = async (req, res) => {
        const { email, password } = req.body;
        try {
            if (email && password) {
                const isEmail = await UserModel.findOne({ email: email });
                if (isEmail) {
                    if (isEmail.email === email && await bcryptjs.compare(password, isEmail.password)) {
                        // Update user status to "Online" here
                        await UserModel.findByIdAndUpdate(isEmail._id, { status: "Online" });

                        const token = jwt.sign({ userID: isEmail._id }, "secretkey", {
                            expiresIn: "2d"
                        });

                        return res.status(200).json({
                            message: "Login Successfully",
                            token,
                            user: isEmail,
                        });
                    } else {
                        return res.status(400).json({ message: "Wrong Credentials" });
                    }
                } else {
                    return res.status(400).json({ message: "Email ID Not Found!!" });
                }
            } else {
                return res.status(400).json({ message: "All Fields are Required" });
            }
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }
    static logoutUser = async (req, res) => {
        const { email } = req.body
        try {
            const isEmail = await UserModel.findOne({ email: email });
            await UserModel.findByIdAndUpdate(isEmail._id, { status: "Offline" });
            res.status(200).json({ isEmail })
        } catch (error) {
            return res.status(400).json({ message: error.message });

        }
    }

    static currentUser = async (req, res) => {
        // const username = req.params.username;
        const {username}= req.params
        try {
            if (username) {
                const foundUser = await UserModel.findOne({ _id: username });
                return res.status(200).json(foundUser);

            } else {
                return res.status(400).json({ message: "Please Login Your Account" })
            }
        } catch (error) {
            console.error(error)
        }

    }
    static SearchUser = async (req, res) => {
        const searchWord = req.query.word;
        const loggedInUserId = req.headers['user-id'];

        try {
            const users = await UserModel.find({
                _id: { $ne: loggedInUserId }, // Exclude the logged-in user
                name: { $regex: searchWord, $options: 'i' }
            });

            // Log the users' names to the console
            users.forEach(user => {
            });

            res.json({ users });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };


    static chatFriend = async (req, res) => {
        const friendName = req.params.friendName;
        try {
            if (friendName) {
                const isFriendName = await UserModel.findOne({ name: friendName })
                return res.status(200).json({ friendName: isFriendName });

            } else {
                return res.status(400).json({ message: "Please Login Your Account" })
            }
            return res.status(200).json({ User: username });

        } catch (error) {
            console.error(error)
        }
    }
    static allUsers = async (req, res) => {
        const keyword = req.query.search ? {
            $or: [
                { name: { $regex: req.query.search, $options: "i" } },
                { email: { $regex: req.query.search, $options: "i" } },
            ]
        } : {}
        const users = await UserModel.find(keyword).find({ _id: { $ne: req.user._id } })
        res.send(users)
    }
    static accessChat = async (req, res) => {

        // const { userID } = req.body;
        const userID = req.params.chatId

        if (!userID) {
            console.log("User Id Param Not Sent with Request");
            return res.status(400).send("User ID not provided in the request");
        }

        try {
            var isChat = await Chat.find({
                isGroupChat: false,
                $and: [
                    { users: { $elemMatch: { $eq: req.user._id } } },
                    { users: { $elemMatch: { $eq: userID } } },
                ],
            })
                .populate({
                    path: 'users',
                    select: '-password', // exclude the password field
                })
                .populate('latestMessage')
                .exec();

            if (isChat && isChat.length > 0) {
                res.send(isChat[0]);
            } else {

                isChat = await UserModel.populate(isChat, {
                    path: "latestMessage.sender",
                    select: "name pic email"
                });
                if (isChat.length > 0) {
                    res.send(isChat[0])
                } else {
                    var chatData = {
                        chatName: "sender",
                        isGroupChat: false,
                        users: [req.user._id, userID]
                    }

                };
                try {
                    const createdChat = await Chat.create(chatData);
                    const FullChatt = await Chat.findOne({ _id: createdChat._id }).populate("users", "-password")
                    res.status(200).send(FullChatt)
                } catch (error) {
                    res.send(error)
                }
            }
        } catch (error) {
            console.error('Error in accessChat:', error);
            res.status(500).send("Internal Server Error");
        }
    };

    static fetchChat = async (req, res) => {
        try {
            Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
                .populate("users", "-password")
                .populate("groupAdmin", "-password")
                .populate("latestMessage")
                .sort({ updatedAt: -1 })
                .then(async (results) => {
                    results = await UserModel.populate(results, {
                        path: "latestMessage.sender",
                        select: "name pic email"
                    });
                    res.status(200).send(results)
                })
        } catch (error) {
            res.status(400).send(error.message)
        }
    }
    static createGroupChat = async (req, res) => {

        if (!req.body.users || !req.body.name || !req.body.pic) {
            return res.status(400).json({ message: "Please Fill all The Details" });
        }

        var users = JSON.parse(req.body.users);
        if (users.length < 2) {
            return res.status(400).json({ message: "Please Select Atleast 2 Users" });
        }

        users.push(req.user);

        try {
            const groupChat = await Chat.create({
                chatName: req.body.name,
                users: users,
                isGroupChat: true,
                groupAdmin: req.user,
                pic: req.body.pic
            });

            const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
                .populate("users", "-password")
                .populate("groupAdmin", "-password");

            return res.status(200).json({ message: "Successfully Created", data: fullGroupChat });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    };

    static renameGroup = async (req, res) => {
        const { chatId, chatName } = req.body
        const updatedChat = await Chat.findByIdAndUpdate(chatId, {
            chatName
        }, {
            new: true
        }).populate("users", "-password").populate("groupAdmin", "-password")

        if (!updatedChat) {
            res.status(400).send("Chat Not Found!!")
        } else {
            res.json(updatedChat)
        }
    }
    static removeFromGroup = async (req, res) => {
        const { chatId, userId } = req.body;
        const removed = await Chat.findByIdAndUpdate(chatId, {
            $pull: { users: userId },
        },
            {
                new: true
            }).populate("users", "-password").populate("groupAdmin", "-password")
        if (!removed) {
            res.status(400).send("Chat Not Found!!")
        } else {
            res.json(removed)
        }
    }
    static addToGroup = async (req, res) => {

        const { chatId, userId } = req.body;
      
        const userIds = userId.map(id => new mongoose.Types.ObjectId(id));  

        
        const added = await Chat.findByIdAndUpdate(
          chatId,
          {
            $push: {
              users: {
                $each: userIds
              }  
            }
          }, 
          {new: true}
        )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");
      
        if(!added) {
           return res.status(400).send("Chat not found!"); 
        }
      
        res.json(added);
      
      }
      
    static sendMessage = async (req, res) => {
        const { content, chatId, pic, imageUrl } = req.body;
        if (!content && !imageUrl) {
            return res.status(400).send("No Content or Picture Found")
        }
        var newMessage = {
            sender: req.user._id,
            content: content,
            chat: chatId,
            imageUrl: imageUrl,
        };

        try {
            // Log the new message before saving

            var message = await Message.create(newMessage);

            // Log the created message

            message = await message.populate("sender", "name pic")
            message = await message.populate("chat")
            message = await UserModel.populate(message, {
                path: "chat.users",
                select: "name pic email",
            });

            // Log the populated message

            await Chat.findByIdAndUpdate(req.body.chatId, {
                latestMessage: message,
            });

            res.json(message);
        } catch (error) {
            console.error('Error:', error);
            res.status(400).send(error.message);
        }
    }

    static allMessages = async (req, res) => {
        try {
            const messages = await Message.find({ chat: req.params.chatId }).populate("sender", "name pic email").populate("chat");
            res.json(messages)
        } catch (error) {
            res.status(400).send(error.message)
        }
    }
    static changeGroupProfilePic = async (req, res) => {
        const { groupChatid, imgUrl } = req.body
        try {
            const GroupChat = await Chat.findByIdAndUpdate(groupChatid, { pic: imgUrl },
                { new: true }).populate("users", "-password").populate("groupAdmin", "-password")
            if (GroupChat) {
                res.status(200).json(GroupChat)
            }

        } catch (error) {
            res.status(400).send({ message: "hehe" })
        }
    }
    static singleChatProfileChange = async (req, res) => {
        const { userId, imgUrl } = req.body
        console.log(userId)
        console.log(imgUrl)
        try {
            const MyChat = await UserModel.findByIdAndUpdate(userId, { pic: imgUrl }, { new: true })
            // const MyChat = await UserModel.findById(userId)

            res.status(200).json(MyChat)

            console.log(MyChat)
        } catch (error) {
            res.status(400).send({ message: "hehe" })
        }
    }
    static editProfile = async (req, res) => {
        const { userId, Details } = req.body
        const updatedname = req.body.Details.name;
        const updatedemail = req.body.Details.email;
        const updatedphone = req.body.Details.phone;
        const updatedintro = req.body.Details.intro;
        // console.log(imgUrl)
        try {
            const MyChat = await UserModel.findByIdAndUpdate(userId,
                {
                    name: updatedname,
                    email: updatedemail,
                    phone: updatedphone,
                    intro: updatedintro
                },
                { new: true })
            // const MyChat = await UserModel.findById(userId)

            res.status(200).json(MyChat)

            console.log(MyChat)
        } catch (error) {
            res.status(400).send({ message: "hehe" })
        }
    }


}
export default authController