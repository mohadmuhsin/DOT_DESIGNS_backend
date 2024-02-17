const ChatModel = require('../routes/chat_routes')
const Messages = require('../models/messages');
const Designer = require('../models/designer');
const User = require('../models/user');
const Connection = require ('../models/connection');
const Message = require('../models/messages');

module.exports = {
    getUsers: async (req, res) => {
        try {
            const { designerId } = req.params 
            const result = await Designer.findOne({ _id: designerId},{connectionRequest:1,_id:1}).populate('connectionRequest.userId')
            if (!result) {
                return res.status(404).send({message:"data not found"})
            }
            return res.status(200).send(result)
        } catch (error) {
            return res.status(500).send({message:"Something went werong"})    
        }
    },

    getDesigners: async (req, res) => {
        try {
            const userId = req.userId

            const designers = await User.findOne({ _id: userId }).populate("connectedDesigners")
            if (!designers) {
            return res.status(404).send({message:"No desigers are in your list"})
            }    
            return res.status(200).send(designers)
        } catch (error) {
            console.log(error);
            return res.status(500).send({message:"Something went werong"})    
            
        }
    },

    getChats: async (req, res) => {
        try {
            const { userId, designerId } = req.params
            const chats = await Messages.find({ $or: [
            { $and: [{ sender: userId }, { reciever: designerId }] },
            { $and: [{ sender: designerId }, { reciever: userId }] }
            ]}).sort({ createdAt: 1 })
            if (!chats) {
                return res.status(404).send({message:"No messages found"})
            }
            return res.status(200).send(chats)
        } catch (error) {
            return res.status(500).send({message:"Something went werong"})    
            
        }
    },

    setDesignerNewMessage: async (req, res) => {
        try {
            const { message, userId, designerId } = req.body
            const messages = new Messages({
                sender: designerId,
                reciever: userId,
                text: message
            })
            const result = messages.save()
            if (!result) {
                return res.status(509).send({message:"message save failde"})
            }
            return res.status(200).send(result)
        } catch (error) {
            return res.status(500).send({message:"Something went werong"})    
            
        }
    },

    setUserNewMessage: async (req, res) => {
        try {
            const { message, userId, designerId } = req.body
            const messages = new Messages({
                sender: userId,
                reciever: designerId,
                text: message
            })
             const result = messages.save()
            if (!result) {
                return res.status(509).send({message:"message save failde"})
            }
            return res.status(200).send(result)
        } catch (error) {
            return res.status(500).send({message:"Something went werong"})    
        }
    },

    makeConnection: async (req, res) => {
        try {
            const { id } = req.body
            const userId = req.userId
            const connectionexsist = await Connection.findOne({
                'connections.user': userId,
                'connections.designer': id
            });
            if (connectionexsist) {
                return  res.status(200).json({ message: "success" })

            } else {
                let result = new Connection({
                    connections: {
                        user: userId,
                        designer: id
                    }
                })
                let data = await result.save()
                res.status(200).json(data)
            }

        } catch (error) {
            return res.status(500).send({message:"Something went werong"})    
            
        }
    },


    getUserChatList: async (req, res) => {
        try {
            const userId = req.userId
            const data = await Connection.find({ "connections.user": userId }).populate('connections.designer')
            
            if (!data) {
                return res.status(404).send({message:"No messages found"})
            }
            return res.status(200).json({ data: data, id: userId })

        } catch (error) {
            return res.status(500).send({message:"Something went werong"})    
            
        }
    },
    designerChatlist: async (req, res) => {
        try {
            const { designerId } = req.params
            const data = await Connection.find({ "connections.designer": designerId }).populate('connections.user')
            
            if (!data) {
                return res.status(404).send({message:"No messages found"})
            }
            return res.status(200).json({ data: data, id: designerId })

        } catch (error) {
            return res.status(500).send({message:"Something went werong"})    
            
        }
    }
    ,
   
// should change to one
    getFullChat: async (req, res) => {
        try {
            const { designerId } = req.params
            const userId = req.userId 
            const data = await Connection.findOne({
                "connections.user": userId,
                "connections.designer": designerId
            })

            if (!data) {
                return res.status(400).send({message:"Chat not found"})
            }
            
            const allMessages = await Message.find({connectionid:data._id}).sort('createdAt')
            return res.status(200).send({result:allMessages,cid:data._id,userId:userId})
        } catch (error) {
            return res.status(500).send({message:"Something went werong"})    
            
        }
    },


    // should change to one
    getFullUserChat: async (req, res) => {
        try {
            const {userId, designerId } = req.params
            const data = await Connection.findOne({
                "connections.user": userId,
                "connections.designer": designerId
            })

            if (!data) {
                return res.status(400).send({message:"Chat not found"})
            }
            const allMessages = await Message.find({connectionid:data._id}).sort('createdAt')
            return res.status(200).send({result:allMessages,cid:data._id,designerId:designerId})
        } catch (error) {
            return res.status(500).send({message:"Something went werong"})    
            
        }
    },

    sendMessages: async (req, res) => {
        try {

            const { connectionid, sender, reciever, message } = req.body
            const data = new Message({
                connectionid: connectionid,
                sender: sender,
                reciever: reciever,
                message: message
            })

            const result = await data.save()
            return res.status(200).send(result)

        } catch (error) {
            console.log(error);
            return res.status(500).send({message:"Something went werong"})    
            
        }
    }



    
}