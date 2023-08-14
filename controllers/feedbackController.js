const User = require('../models/user')
const Design = require('../models/design')
const Booking = require('../models/bookings')


module.exports = {
     addFeedback:async (req, res) => {
    try {
        const { feedback, image } = req.body.feedback
        const { booking_id } = req.body
        const booking = await Booking.findOne({ _id: booking_id })
        if (!booking) {
            return res.status(404).send({ message: "Booking not found" })
        }
        const existReview = await Design.findOne({ _id: booking.designId, "feedback.userId": booking.userId })
        const review = await Design.updateOne({ _id: booking.designId },
            {
                $push:
                {
                    feedback:
                    {
                        text: feedback,
                        image: image,
                        userId: booking.userId,
                        bookingId: booking._id,
                    }
                }
            })
        if (!review) {
            return res.status(400).send({message:"feedback failed"})
        }
        return res.status(200).send({review, existReview})
        
    } catch (error) {
        console.log(error);
      return res.send({message:"Something went wrong"})
    }
    },
    getUserFeedBack: async (req, res) => {
        try {
            const { id } = req.params
            const userId = req.userId
            const booking = await Booking.findOne({ _id: id })
            const feedback = await Design.findOne({ _id: booking.designId, "feedback.bookingId": booking._id },{feedback:1})
            if (feedback) {
                return res.send(feedback)
            }
        } catch (error) {
            console.log(error);
          return res.send({message:"Something went wrong"}) 
        }
    },
    getFeedbacks: async (req, res) => {
        try {
            const { id } = req.params
            const feedbacks = await Design.find({ _id:id},{})
        } catch (error) {
          return res.send({message:"Something went wrong"}) 
            
        }
    },
    
}