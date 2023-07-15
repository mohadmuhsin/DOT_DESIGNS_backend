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
// router.get('/getCategories',adminController.getCategories)

// router.get('/retrive_categories',userController.retrive_categories)

module.exports = router;
