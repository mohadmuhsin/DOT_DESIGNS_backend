const { Router } = require("express");
const router = Router();

const { authorization } = require("../middleware/auth");
const userController = require("../controllers/userController");
const adminController = require("../controllers/adminController");


router.post("/signUp", userController.signUp);
router.post("/login", userController.login);
router.patch("/verify", userController.verify);
router.get("/user", authorization, userController.user);
router.post('/logout',userController.logout)

router.get('/retrive_DesignbyId/:id',userController.retrive_DesignbyId)
router.get('/getDesignDetails/:id', userController.getDesignDetails)
router.post('/bookingRequest',authorization,userController.bookingRequest)
router.post('/feePayment',authorization,userController.feePayment)
router.get('/get_last_booking',authorization,userController.get_last_booking)
router.get('/getbookings',authorization,userController.getbookings)
router.get('/booking_detail/:id',authorization,userController.booking_detail)
router.post('/rejectBooking/:id',authorization,userController.rejectBooking)    
router.post('/rejectPayment/:id', userController.rejectPayment)
router.post('/cancellConsultation', userController.cancellConsultation)
router.post('/cancellProject', userController.cancellProject)
router.get('/getDesignersList', userController.getDesignersList)
router.post('/connectDesigner/:id',authorization,userController.connectDesigner)
router.get('/getDesignerData/:id', userController.getDesignerData)
router.get('/getDesignerDesign',userController.getDesignerDesign)
// router.get('/getCategories',adminController.getCategories)

// router.get('/retrive_categories',userController.retrive_categories)

module.exports = router;
