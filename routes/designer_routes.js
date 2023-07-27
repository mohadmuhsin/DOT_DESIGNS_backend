const { Router } = require('express')
const router = Router();
const designerController = require ('../controllers/designerController')
const {authorization} = require('../middleware/auth')


router.post('/designer_signup',designerController.signup)
router.patch('/verify',designerController.verify)
router.post('/login',designerController.login)
router.get('/designer',authorization,designerController.designer)
router.post('/logout', designerController.logout)
router.get('/getProfileData', designerController.getProfileData)
router.post('/updateProfile',designerController.updateProfile)

// design
// router.get('/retrive_categories',designerController.retrive_categories)//store 
router.post('/add_design',designerController.add_design)
router.get('/retrive_Designs/:id/:token',designerController.retrive_Designs)
router.get('/get_Designs',designerController.get_Designs)//store
router.get('/get_design_data/:id',designerController.get_design_data)
router.post('/sendRequest', designerController.sendRequest)
router.get('/getConsultationCount',designerController.getConsultationCount)
router.get('/getRequests/:token',designerController.getRequests)
router.post('/acceptRequest',designerController.acceptRequest)
router.post('/rejectRequest', designerController.rejectRequest)
router.post('/StartProject',designerController.StartProject)
router.post('/consultationDone',designerController.consultationDone)
router.post('/projectCompleted', designerController.projectCompleted)
router.put('/updateDesign', designerController.updateDesign)
router.delete('/deleteDesignImage', designerController.deleteDesignImage)
router.delete('/deleteDesign/:id', designerController.deleteDesign)
router.get('/getConnectionRequests/:id', designerController.getConnectionRequests)
router.post('/RejectConnection', designerController.RejectConnection)
router.post('/acceptConnectionRequest',designerController.acceptConnectionRequest)


module.exports = router;
