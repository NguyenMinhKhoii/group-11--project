const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// CRUD đầy đủ
router.get("/users", userController.getUsers);
router.post("/users", userController.createUser);
router.put("/users/:id", userController.updateUser);     // PUT
router.delete("/users/:id", userController.deleteUser);   // DELETE

// 📤 SHARE APIs - Để chia sẻ tokens/messages giữa thành viên nhóm
router.get("/shared-messages", userController.getSharedMessages);
router.post("/share-message", userController.shareMessage);
router.delete("/shared-messages", userController.clearSharedMessages);

module.exports = router;
