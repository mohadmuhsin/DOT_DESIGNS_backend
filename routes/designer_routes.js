const { Router } = require('express')
const router = Router();
const designerController = require('../controllers/designerController')
const connectionController = require ('../controllers/connectionController')
const {authorization} = require('../middleware/auth')


router.post('/designer_signup',designerController.signup)
router.patch('/verify',designerController.verify)
router.post('/login', designerController.login)
router.get('/verifyDesignerEmailforForget/:email', designerController.verifyDesignerEmailforForget)
router.patch('/changeDesignerPassword',designerController.changeDesignerPassword)
router.get('/designer/:designerId',authorization,designerController.designer)
router.post('/logout', designerController.logout)
router.get('/getProfileData', designerController.getProfileData)
router.patch('/updateProfile',designerController.updateProfile)

// design
router.post('/add_design',designerController.add_design)
router.get('/retrive_Designs/:id/:token',designerController.retrive_Designs)
router.get('/get_Designs',designerController.get_Designs)//store
router.get('/get_design_data/:id',designerController.get_design_data)
router.patch('/sendRequest', designerController.sendRequest)
router.get('/getConsultationCount',designerController.getConsultationCount)
router.get('/getRequests/:token', designerController.getRequests)
router.get('/getConsultationDeatails',designerController.getConsultationDeatails)
router.patch('/acceptRequest',designerController.acceptRequest)
router.patch('/rejectRequest', designerController.rejectRequest)
router.patch('/StartProject',designerController.StartProject)
router.patch('/consultationDone',designerController.consultationDone)
router.patch('/projectCompleted', designerController.projectCompleted)
router.put('/updateDesign', designerController.updateDesign)
router.delete('/deleteDesignImage', designerController.deleteDesignImage)
router.delete('/deleteDesign/:id', designerController.deleteDesign)
router.post("/doPayment", designerController.doPayment)
router.get('/getCategorywiseQoute/:id',designerController.getCategorywiseQoute)
router.get('/getCatogoryWiseDesigns/:id',designerController.getCatogoryWiseDesigns)

// connection routes
router.get('/getConnectionRequests/:id', connectionController.getConnectionRequests)
router.patch('/acceptConnectionRequest',connectionController.acceptConnectionRequest)
router.patch('/RejectConnection', connectionController.RejectConnection)

module.exports = router;
