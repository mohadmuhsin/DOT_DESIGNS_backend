const { Router } = require('express')
const router = Router();
const designerController = require ('../controllers/designerController')
const {authorization} = require('../middleware/auth')


router.post('/designer_signup',designerController.signup)
router.patch('/verify',designerController.verify)
router.post('/login',designerController.login)
router.get('/designer',authorization,designerController.designer)
router.post('/logout',designerController.logout)

// design
// router.get('/retrive_categories',designerController.retrive_categories)//store 
router.post('/add_design',designerController.add_design)
router.get('/retrive_Designs/:id',designerController.retrive_Designs)
router.get('/get_Designs',designerController.get_Designs)//store
router.get('/get_design_data/:id',designerController.get_design_data)
router.post('/sendRequest',designerController.sendRequest)

module.exports = router;
