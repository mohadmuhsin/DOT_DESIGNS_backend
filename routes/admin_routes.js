const express = require('express');
const router = express.Router();
const adminController = require ('../controllers/adminController')

router.post('/admin_login',adminController.login)
router.get('/load_admin',adminController.load_admin)
router.post('/logout',adminController.logout)
router.post('/add_category',adminController.add_category)
router.get('/getCategories',adminController.getCategories)
router.get('/get_category/:id',adminController.get_category)
router.post('/edit_category',adminController.edit_category)
router.get('/getPendingRequest',adminController.getPendingRequest)


module.exports = router;
