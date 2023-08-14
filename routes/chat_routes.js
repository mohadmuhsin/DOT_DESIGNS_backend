const { Router } = require("express");
const router = Router();


const userController = require("../controllers/userController");
const adminController = require("../controllers/adminController");
const connectionController = require ('../controllers/connectionController');
const {
    getUsers,
    setDesignerNewMessage,
    getChats,
    getDesigners,
    setUserNewMessage,
    getUserChatList,
    designerChatlist,
    makeConnection,
    getFullChat,
    getFullUserChat,
    sendMessages
} = require("../controllers/chatController");
const { authorization } = require("../middleware/auth");


router.get("/getUsers/:designerId", getUsers)
router.get('/getChats/:userId/:designerId', getChats)
router.post('/setDesignerNewMessage', setDesignerNewMessage)

router.get('/getDesigners', authorization, getDesigners)
router.post('/setUserNewMessage', setUserNewMessage)
router.get('/getUserChatList', authorization, getUserChatList)
router.get('/designerChatlist/:designerId',designerChatlist)
router.post('/makeConnection', authorization, makeConnection)
router.get('/getFullChat/:designerId', authorization, getFullChat)
router.get('/getFullUserChat/:userId/:designerId',getFullUserChat)
router.post('/sendMessages',authorization,sendMessages)

module.exports = router;