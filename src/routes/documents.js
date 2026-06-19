const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');

/**
 * @swagger
 * /documents:
 *   get:
 *     summary: Get all legal documents
 *     tags: [Documents]
 *     responses:
 *       200:
 *         description: List of documents
 */
router.get('/', documentController.getAllDocuments);

/**
 * @swagger
 * /documents/{id}:
 *   get:
 *     summary: Get document by ID
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document details
 */
router.get('/:id', documentController.getDocumentById);

/**
 * @swagger
 * /documents/{id}/download:
 *   get:
 *     summary: Download document PDF
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document downloaded
 */
router.get('/:id/download', documentController.downloadDocument);

/**
 * @swagger
 * /documents:
 *   post:
 *     summary: Create new document
 *     tags: [Documents]
 *     responses:
 *       201:
 *         description: Document created
 */
router.post('/', documentController.createDocument);

/**
 * @swagger
 * /documents/{id}:
 *   put:
 *     summary: Update document
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document updated
 */
router.put('/:id', documentController.updateDocument);

/**
 * @swagger
 * /documents/{id}:
 *   delete:
 *     summary: Delete document
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document deleted
 */
router.delete('/:id', documentController.deleteDocument);

module.exports = router;
