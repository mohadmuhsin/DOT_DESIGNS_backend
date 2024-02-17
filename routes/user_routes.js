const { Router } = require("express");
const router = Router();

const { authorization } = require("../middleware/auth");
const userController = require("../controllers/userController");
const adminController = require("../controllers/adminController");
const connectionController = require('../controllers/connectionController');
const feedbackController = require("../controllers/feedbackController");


router.post("/signUp", userController.signUp);
router.post("/login", userController.login);
router.patch("/verify", userController.verify);
router.get('/verifyEmailforForget/:mail', userController.verifyEmailforForget)
router.patch('/changePassword/:data', userController.changePassword)
router.get("/user", authorization, userController.user);
router.get('/getUser/:id', userController.getUser)
router.post('/logout', userController.logout)

router.get('/retrive_DesignbyId/:id', userController.retrive_DesignbyId)
router.get('/getDesignDetails/:id', userController.getDesignDetails)
router.post('/addTowhishlist', authorization, userController.addTowhishlist)
router.get('/getWishlistDesigns', authorization, userController.getWishlistDesigns)
router.post('/removeFromWishlist', authorization, userController.removeFromWishlist)
router.post('/bookingRequest', authorization, userController.bookingRequest)
router.post('/feePayment', authorization, userController.feePayment)
router.get('/get_last_booking', authorization, userController.get_last_booking)
router.get('/getbookings', authorization, userController.getbookings)
router.get('/booking_detail/:id', authorization, userController.booking_detail)
router.patch('/rejectBooking/:id', authorization, userController.rejectBooking)
router.patch('/rejectPayment/:id', userController.rejectPayment)
router.patch('/cancellConsultation', userController.cancellConsultation)
router.patch('/cancellProject', userController.cancellProject)
router.get('/getDesignersList', authorization, connectionController.getDesignersList)
router.post('/connectDesigner/:id', authorization, connectionController.connectDesigner)
router.get('/getDesignerData/:id', userController.getDesignerData)
router.get('/getDesignerDesign', userController.getDesignerDesign)
router.post('/addFeedback', authorization, feedbackController.addFeedback)
router.get('/getFeedBack/:id', authorization, feedbackController.getUserFeedBack)
router.get('/getFeedbacks/:id', feedbackController.getFeedbacks)
router.post('/sendMessage', userController.sendMessage)

module.exports = router;
