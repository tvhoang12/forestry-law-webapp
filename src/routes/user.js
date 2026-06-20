const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Register a new customer
 *     description: Creates a new user in the system. The role is strictly forced to 'customer'. Password must meet complexity requirements and phone numbers must fit standard length rules.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - firstName
 *               - lastName
 *               - phoneNumber
 *               - email
 *               - password
 *               - reCheckPassword
 *             properties:
 *               username:
 *                 type: string
 *                 example: customer123
 *               firstName:
 *                 type: string
 *                 example: Nguyễn
 *               lastName:
 *                 type: string
 *                 example: Văn A
 *               phoneNumber:
 *                 type: string
 *                 example: "0987654321"
 *               email:
 *                 type: string
 *                 example: customer@example.com
 *               password:
 *                 type: string
 *                 example: Password123!
 *               reCheckPassword:
 *                 type: string
 *                 example: Password123!
 *     responses:
 *       201:
 *         description: Account successfully registered
 *       400:
 *         description: Invalid inputs or duplicate user
 *       500:
 *         description: Internal server error
 */
router.post('/register', userController.register);

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Log in to the application
 *     description: Authenticates user credentials and returns a JWT token.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: customer123
 *               password:
 *                 type: string
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Successful login
 *       400:
 *         description: Invalid inputs or incorrect credentials
 *       500:
 *         description: Internal server error
 */
router.post('/login', userController.login);

/**
 * @swagger
 * /user/logout:
 *   post:
 *     summary: Log out of the application
 *     description: Invalidate the client session.
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Successful logout
 */
router.post('/logout', userController.logout);

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/', userController.getAllUsers);

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 */
router.get('/:id', userController.getUserById);

/**
 * @swagger
 * /user:
 *   post:
 *     summary: Create a user (Admin only)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *                 example: staff_member
 *               email:
 *                 type: string
 *                 example: staff@forestrylaw.com
 *               password:
 *                 type: string
 *                 example: SecureStaffPass99!
 *               role:
 *                 type: string
 *                 example: staff
 *               firstName:
 *                 type: string
 *                 example: Trần
 *               lastName:
 *                 type: string
 *                 example: Thị B
 *               phoneNumber:
 *                 type: string
 *                 example: "0912345678"
 *     responses:
 *       201:
 *         description: User created successfully
 */
router.post('/', userController.createUser);

/**
 * @swagger
 * /user/{id}:
 *   put:
 *     summary: Update user details
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: updated_email@example.com
 *               firstName:
 *                 type: string
 *                 example: Nguyễn
 *               lastName:
 *                 type: string
 *                 example: Văn A
 *               phoneNumber:
 *                 type: string
 *                 example: "0987654321"
 *               password:
 *                 type: string
 *                 example: NewPassword123!
 *               role:
 *                 type: string
 *                 example: customer
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.put('/:id', userController.updateUser);

/**
 * @swagger
 * /user/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
router.delete('/:id', userController.deleteUser);

module.exports = router;
