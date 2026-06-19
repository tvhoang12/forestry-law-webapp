const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: Get all appointments (Toy API)
 *     tags: [Appointments]
 *     responses:
 *       200:
 *         description: List of appointments
 */
router.get('/', appointmentController.getAllAppointments);

/**
 * @swagger
 * /appointments/{id}:
 *   get:
 *     summary: Get appointment by ID (Toy API)
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Appointment details
 *       404:
 *         description: Appointment not found
 */
router.get('/:id', appointmentController.getAppointmentById);

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Create new appointment (Toy API)
 *     tags: [Appointments]
 *     responses:
 *       201:
 *         description: Appointment created
 */
router.post('/', appointmentController.createAppointment);

/**
 * @swagger
 * /appointments/{id}:
 *   put:
 *     summary: Update appointment (Toy API)
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Appointment updated
 *       404:
 *         description: Appointment not found
 */
router.put('/:id', appointmentController.updateAppointment);

/**
 * @swagger
 * /appointments/{id}:
 *   delete:
 *     summary: Delete appointment (Toy API)
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Appointment deleted
 *       404:
 *         description: Appointment not found
 */
router.delete('/:id', appointmentController.deleteAppointment);

module.exports = router;
