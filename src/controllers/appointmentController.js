/**
 * Appointment Controller
 * Handles CRUD operations for appointments (Toy APIs connected to SQL Server)
 */
const { sql, poolPromise } = require('../config/db');

exports.getAllAppointments = async (req, res) => {
    try {
        const pool = await poolPromise;
        if (!pool) {
            return res.status(500).json({ error: 'Database connection failed' });
        }
        const result = await pool.request().query('SELECT * FROM Appointments ORDER BY createdAt DESC');
        res.status(200).json({
            message: 'Get all appointments from DB (toy)',
            data: result.recordset
        });
    } catch (err) {
        console.error('Error getting appointments:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.getAppointmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        if (!pool) {
            return res.status(500).json({ error: 'Database connection failed' });
        }
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Appointments WHERE id = @id');
            
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.status(200).json({
            message: `Get appointment ${id} from DB (toy)`,
            data: result.recordset[0]
        });
    } catch (err) {
        console.error('Error getting appointment by ID:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.createAppointment = async (req, res) => {
    try {
        const { userId, clientName, clientEmail, clientPhone, lawyerId, appointmentDate, description } = req.body;
        
        // Toy logic: simple defaults if missing
        const finalClientName = clientName || 'Anonymous Client';
        const finalClientEmail = clientEmail || 'client@example.com';
        const finalAppointmentDate = appointmentDate || new Date();
        
        const pool = await poolPromise;
        if (!pool) {
            return res.status(500).json({ error: 'Database connection failed' });
        }
        
        const result = await pool.request()
            .input('userId', sql.Int, userId || null)
            .input('clientName', sql.NVarChar, finalClientName)
            .input('clientEmail', sql.NVarChar, finalClientEmail)
            .input('clientPhone', sql.NVarChar, clientPhone || null)
            .input('lawyerId', sql.Int, lawyerId || null)
            .input('appointmentDate', sql.DateTime, finalAppointmentDate)
            .input('description', sql.NVarChar, description || '')
            .query(`
                INSERT INTO Appointments (userId, clientName, clientEmail, clientPhone, lawyerId, appointmentDate, description, status, createdAt, updatedAt)
                OUTPUT INSERTED.*
                VALUES (@userId, @clientName, @clientEmail, @clientPhone, @lawyerId, @appointmentDate, @description, 'Pending', GETDATE(), GETDATE())
            `);
            
        res.status(201).json({
            message: 'Appointment created in DB successfully (toy)',
            data: result.recordset[0]
        });
    } catch (err) {
        console.error('Error creating appointment:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { clientName, clientEmail, clientPhone, lawyerId, appointmentDate, description, status } = req.body;
        
        const pool = await poolPromise;
        if (!pool) {
            return res.status(500).json({ error: 'Database connection failed' });
        }
        
        // Fetch current record
        const checkResult = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Appointments WHERE id = @id');
            
        if (checkResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        
        const current = checkResult.recordset[0];
        
        // Combine or override
        const finalClientName = clientName !== undefined ? clientName : current.clientName;
        const finalClientEmail = clientEmail !== undefined ? clientEmail : current.clientEmail;
        const finalClientPhone = clientPhone !== undefined ? clientPhone : current.clientPhone;
        const finalLawyerId = lawyerId !== undefined ? lawyerId : current.lawyerId;
        const finalAppointmentDate = appointmentDate !== undefined ? appointmentDate : current.appointmentDate;
        const finalDescription = description !== undefined ? description : current.description;
        const finalStatus = status !== undefined ? status : current.status;
        
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('clientName', sql.NVarChar, finalClientName)
            .input('clientEmail', sql.NVarChar, finalClientEmail)
            .input('clientPhone', sql.NVarChar, finalClientPhone)
            .input('lawyerId', sql.Int, finalLawyerId)
            .input('appointmentDate', sql.DateTime, finalAppointmentDate)
            .input('description', sql.NVarChar, finalDescription)
            .input('status', sql.NVarChar, finalStatus)
            .query(`
                UPDATE Appointments 
                SET clientName = @clientName, 
                    clientEmail = @clientEmail, 
                    clientPhone = @clientPhone, 
                    lawyerId = @lawyerId, 
                    appointmentDate = @appointmentDate, 
                    description = @description, 
                    status = @status, 
                    updatedAt = GETDATE()
                OUTPUT INSERTED.*
                WHERE id = @id
            `);
            
        res.status(200).json({
            message: `Appointment ${id} updated in DB (toy)`,
            data: result.recordset[0]
        });
    } catch (err) {
        console.error('Error updating appointment:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        if (!pool) {
            return res.status(500).json({ error: 'Database connection failed' });
        }
        
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Appointments OUTPUT DELETED.id WHERE id = @id');
            
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        
        res.status(200).json({
            message: `Appointment ${id} deleted from DB (toy)`
        });
    } catch (err) {
        console.error('Error deleting appointment:', err);
        res.status(500).json({ error: err.message });
    }
};
