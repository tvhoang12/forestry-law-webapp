const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');

/**
 * @swagger
 * /news:
 *   get:
 *     summary: Get all news
 *     tags: [News]
 *     responses:
 *       200:
 *         description: List of news
 */
router.get('/', newsController.getAllNews);

/**
 * @swagger
 * /news/{id}:
 *   get:
 *     summary: Get news by ID
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: News details
 */
router.get('/:id', newsController.getNewsById);

/**
 * @swagger
 * /news:
 *   post:
 *     summary: Create new news
 *     tags: [News]
 *     responses:
 *       201:
 *         description: News created
 */
router.post('/', newsController.createNews);

/**
 * @swagger
 * /news/{id}:
 *   put:
 *     summary: Update news
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: News updated
 */
router.put('/:id', newsController.updateNews);

/**
 * @swagger
 * /news/{id}:
 *   delete:
 *     summary: Delete news
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: News deleted
 */
router.delete('/:id', newsController.deleteNews);

module.exports = router;
