const express = require('express');
const router = express.Router();
const adminController = require ('../controllers/adminController')

router.post('/admin_login',adminController.login)
router.get('/load_admin',adminController.load_admin)
router.post('/logout',adminController.logout)
router.post('/add_category',adminController.add_category)
router.get('/getCategories',adminController.getCategories)
router.get('/get_category/:id',adminController.get_category)
router.patch('/edit_category',adminController.edit_category)
router.get('/getPendingRequest',adminController.getPendingRequest)
router.patch('/approveCategory',adminController.approveCategory)
router.delete('/dropCategory/:id',adminController.dropCategory)
router.delete('/rejectCategoryApproval/:id', adminController.rejectCategoryApproval)
router.get('/getCounts', adminController.getCounts)
router.get('/getDesigners', adminController.getDesigners)
router.patch('/blockDesigner/:id', adminController.blockDesigner)
router.patch('/unblockDesigner/:id', adminController.unblockDesigner)
router.get('/getUsers', adminController.getUsers)
router.patch('/blockUser/:id',adminController.blockUsers)
router.patch('/unblockUser/:id',adminController.unblockUsers)


module.exports = router;
