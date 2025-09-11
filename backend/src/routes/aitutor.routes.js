// src/routes/aitutor.routes.js
import express from "express";
import { askTutor, getConversation, listConversations, clearConversation } from "../controllers/aitutor.controller.js";

const router = express.Router();

router.post("/ask", askTutor);
router.get("/conversations", listConversations);
router.get("/conversation/:conversationId", getConversation);
router.delete("/conversation/:conversationId", clearConversation);

export default router;




// const express = require('express');
// const router = express.Router();
// const aiController = require('../controllers/aitutor.controller.js');

// // Require your auth middleware if you have one
// const auth = require('../middleware/auth.middleware.js'); // adjust path

// // Use auth where required. If you don't want auth for testing, comment it out.
// router.post('/query', auth, aiController.askTutor);
// router.get('/conversation/:conversationId', auth, aiController.getConversation);
// router.get('/list', auth, aiController.listConversations);
// router.delete('/conversation/:conversationId', auth, aiController.clearConversation);

// module.exports = router;
