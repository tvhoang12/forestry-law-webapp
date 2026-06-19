const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: User signup
 *     tags: [Auth]
 *     responses:
 *       201:
 *         description: Signup successful
 */
router.post('/signup', authController.signup);

/**
 * @swagger
 * /auth/signin:
 *   post:
 *     summary: User signin
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Signin successful
 */
router.post('/signin', authController.signin);

/**
 * @swagger
 * /auth/signout:
 *   post:
 *     summary: User signout
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Signout successful
 */
router.post('/signout', authController.signout);

module.exports = router;
