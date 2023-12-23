import express from "express"
import authController from "../controller/authController.js";
import mongoose from "mongoose";
import protect from "../Middleware/authMiddleware.js";
const router = express.Router();



router.post('/user/signup', authController.userRegisteration)
router.post('/user/signin', authController.userLogin)
router.post('/user/logout', authController.logoutUser)
router.get('/currentUser/:username', authController.currentUser)
// router.get('/SearchUser', authController.SearchUser)
router.get('/search', authController.SearchUser)
// router.get('/chat/:friendName', authController.chatFriend)
router.get('/users', protect, authController.allUsers)
router.post('/chat/:chatId', protect, authController.accessChat)
router.get('/chat', protect, authController.fetchChat)
router.post('/group', protect, authController.createGroupChat)
router.post('/groupPic', authController.changeGroupProfilePic)
router.post('/ChangeProfile', authController.singleChatProfileChange)
router.post('/editProfile', authController.editProfile)
router.put('/rename', protect, authController.renameGroup)
router.put('/groupremove', authController.removeFromGroup)
router.put('/groupadd', authController.addToGroup)
router.post('/message', protect, authController.sendMessage)
router.get('/message/:chatId', protect, authController.allMessages)


export default router