const User = require("../models/user");
const mongoose = require('mongoose')
const Category = require("../models/category");
const Design = require("../models/design");
const Designer = require("../models/designer");


module.exports = {

    getDesignersList:async (req, res) => {
        try {
          const userId = req.userId   
          console.log(userId);
          const designers = await Designer.find({ verified: true }).sort({ IsPremium: -1 })
          console.log(designers,"sorted");
            const user = await User.findOne ({_id:userId})
          if (!designers||!user) {
            return res.status(404).send({message:"Designers not Found"})
          }
          return res.status(200).send({designers,user})
        } catch (error) {
          return res.status(500).send({message:"Server Error"})
        }
    },

    connectDesigner: async (req, res) => {
      try {
        const designer_id = req.params.id
        const user = req.userId 

        const exist = await Designer.findOne({ _id: designer_id, connectionRequest:{$elemMatch: { userId: user }} })
        if (exist) {
          return res.status(409).send({message:'Request already sent!'})
        }
        const permission = await Designer.updateOne({ _id: designer_id}, { $push:{connectionRequest:{ request: "requested",userId:user,_id: new mongoose.Types.ObjectId(),}}})
        if (!permission) {
        return res.status(404).send({message:'No matching found'})
        }
        return res.status(200).send({message:"Request send Successfully"})
      } catch (error) {
        console.log(error);
        return res.status(500).send({message:"Server Error"})
      }
    },
     
    getConnectionRequests: async (req, res) => {
        try {
        const id = req.params.id
        const requests = await Designer.findOne({
            _id: id,
            'connectionRequest.request': 'requested'},
          { connectionRequest: { $elemMatch: { request: 'requested' } } }
        ).populate('connectionRequest.userId');
          console.log(requests,"skld");
        if (!requests) {
            return res.status(404).send({message:"No requests pending"})
        }
        return res.status(200).send(requests)
        
        } catch (error) {
        return res.status(500).send({message:"Something went wrong"})
        }
    },

    acceptConnectionRequest: async (req, res) => {
      try {
        const { id, designer, userId } = req.body
        console.log(req.body);
          console.log('ithippoet');
        const exist = await User.findOne({ _id: userId, connectedDesigners: designer })
        console.log(exist,"lkklkk")
        if (exist) {
            return res.status(409).send({message:"Already connected"})
        }
        const update = await Designer.updateOne(
          { _id: designer,"connectionRequest._id":id },
          { $set: { "connectionRequest.$.request": "accepted" } });
        const userConnect = await User.updateOne({_id:userId},{$addToSet: { connectedDesigners: designer }},
        { new: true })
        console.log(userConnect,"user update");
        if (!update|| !userConnect) {
          return res.status(409).send({message:"not updated"})
        }
        
        return res.status(200).send({message:"Request accepted"})
      } catch (error) {
        return res.status(500).send({message:"Something went Wrong"})
      }
    },

  RejectConnection: async (req, res) => {
    try {
      const { id,designer } = req.body
      const update = await Designer.updateOne(
        { _id: designer,"connectionRequest._id":id },
        { $set: { "connectionRequest.$.request": "rejected" } });
      
      if (!update) {
        return res.status(409).send({message:"not updated"})
      }
      return res.status(200).send({message:"Request rejected"})
    } catch (error) {
      return res.status(500).send({message:"Something went wrong"})  
    }
  },
    
    



}