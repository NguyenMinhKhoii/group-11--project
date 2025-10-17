const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const profileController = require("../controllers/profileController");

router.get("/", verifyToken, profileController.getProfile);
router.put("/", verifyToken, profileController.updateProfile);

module.exports = router;
