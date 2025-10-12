const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// CRUD đầy đủ
router.get("/users", userController.getUsers);
router.post("/users", userController.createUser);
router.put("/users/:id", userController.updateUser);     // PUT
router.delete("/users/:id", userController.deleteUser);   // DELETE

module.exports = router;
