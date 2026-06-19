const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

/**
 * @swagger
 * /chatbot/message:
 *   post:
 *     summary: Send message to Forestry Law Chatbot AI
 *     tags: [Chatbot]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: User's question or message regarding forestry law
 *                 example: Quy định về bảo vệ rừng đặc dụng là gì?
 *     responses:
 *       200:
 *         description: Chatbot response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                   description: Chatbot reply
 *                 apiKeyUsed:
 *                   type: boolean
 *                   description: Indicates whether the API Key was dynamically loaded
 *       400:
 *         description: Invalid input
 */
router.post('/message', chatbotController.sendMessage);

module.exports = router;
