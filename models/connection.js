const mongoose =require('mongoose')
const objectId=mongoose.Types.ObjectId  
const connectionSchema=new mongoose.Schema({
    connections:{
        user:{
            type:objectId,
            ref:"User",
            required:true
        },
        designer:{
            type:objectId,
             ref:"Designer",
             required:true
        }
    },
    lastmessage:{
        type:objectId,
        ref:""
    }
},{
    timestamps:true
})



const Connection = mongoose.model('Connection', connectionSchema)
module.exports = Connection