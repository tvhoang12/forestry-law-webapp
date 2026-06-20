/**
 * User Controller
 * Handles user authentication (register, login, logout) and CRUD operations
 */
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { sql, poolPromise, jwtSecret } = require('../config/db');

// Helper: Hash password using PBKDF2/SHA-512
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
}

// Helper: Verify password match
function verifyPassword(password, storedPassword) {
    if (!storedPassword || !storedPassword.includes(':')) {
        return false;
    }
    const [salt, originalHash] = storedPassword.split(':');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === originalHash;
}

/**
 * 1. User Registration (SignUp)
 * Requirements:
 * - Inputs: username, firstName, lastName, phoneNumber, email, password, reCheckPassword
 * - SQL Injection proof (uses parameterized inputs)
 * - Password: min length 8, at least 1 uppercase, at least 1 lowercase, at least 1 number, at least 1 special char
 * - Phone number: starts with '0' -> length 10; starts with '+84' -> length 12
 * - Forced Role: 'customer' (strictly overridden)
 * - Password hashed before storing
 */
exports.register = async (req, res) => {
    try {
        const { username, firstName, lastName, phoneNumber, email, password, reCheckPassword } = req.body;

        // Basic presence validation
        if (!username || !firstName || !lastName || !phoneNumber || !email || !password || !reCheckPassword) {
            return res.status(400).json({ error: 'Tất cả các trường thông tin đều là bắt buộc.' });
        }

        // 1. Password confirmation check
        if (password !== reCheckPassword) {
            return res.status(400).json({ error: 'Mật khẩu và xác nhận mật khẩu không khớp.' });
        }

        // 2. Password strength validation
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

        if (password.length < 8 || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
            return res.status(400).json({
                error: 'Mật khẩu phải dài tối thiểu 8 ký tự, bao gồm ít nhất 1 ký tự in hoa, ít nhất 1 ký tự viết thường, ít nhất 1 ký tự số và ít nhất 1 ký tự đặc biệt.'
            });
        }

        // 3. Phone number validation
        let isPhoneValid = false;
        if (phoneNumber.startsWith('0')) {
            isPhoneValid = phoneNumber.length === 10 && /^\d+$/.test(phoneNumber);
        } else if (phoneNumber.startsWith('+84')) {
            isPhoneValid = phoneNumber.length === 12 && /^\+\d+$/.test(phoneNumber);
        }

        if (!isPhoneValid) {
            return res.status(400).json({
                error: 'Số điện thoại không đúng định dạng chuẩn (10 chữ số bắt đầu bằng 0, hoặc 12 ký tự bắt đầu bằng +84).'
            });
        }

        const pool = await poolPromise;
        if (!pool) {
            return res.status(500).json({ error: 'Không thể kết nối đến cơ sở dữ liệu.' });
        }

        // 4. Check duplicate username
        const dupCheck = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT id FROM Users WHERE username = @username');

        if (dupCheck.recordset.length > 0) {
            return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại.' });
        }

        // 5. Encrypt password and force role 'customer'
        const hashedPassword = hashPassword(password);
        const customerRole = 'customer';

        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .input('password', sql.NVarChar, hashedPassword)
            .input('email', sql.NVarChar, email)
            .input('role', sql.NVarChar, customerRole)
            .input('firstName', sql.NVarChar, firstName)
            .input('lastName', sql.NVarChar, lastName)
            .input('phoneNumber', sql.NVarChar, phoneNumber)
            .query(`
                INSERT INTO Users (username, password, email, role, firstName, lastName, phoneNumber, createdAt, updatedAt)
                OUTPUT INSERTED.id, INSERTED.username, INSERTED.email, INSERTED.role, INSERTED.firstName, INSERTED.lastName, INSERTED.phoneNumber, INSERTED.createdAt
                VALUES (@username, @password, @email, @role, @firstName, @lastName, @phoneNumber, GETDATE(), GETDATE())
            `);

        res.status(201).json({
            message: 'Đăng ký tài khoản thành công.',
            user: result.recordset[0]
        });

    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * 2. User Sign-In (Login)
 * Requirements:
 * - Query username in DB. If not exists -> return "Người dùng không tồn tại"
 * - Validate password. If incorrect -> return "Password sai"
 * - Returns JWT token and profile details
 */
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Tên đăng nhập và mật khẩu là bắt buộc.' });
        }

        const pool = await poolPromise;
        if (!pool) {
            return res.status(500).json({ error: 'Không thể kết nối đến cơ sở dữ liệu.' });
        }

        // Find user by username
        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT * FROM Users WHERE username = @username');

        if (result.recordset.length === 0) {
            return res.status(400).json({ error: 'Người dùng không tồn tại' });
        }

        const user = result.recordset[0];

        // Verify password
        const isMatch = verifyPassword(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Password sai' });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            jwtSecret,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: 'Đăng nhập thành công.',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber
            }
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * 3. User Sign-Out (Logout)
 * Requirements:
 * - Handles client-side logout invalidation response
 */
exports.logout = async (req, res) => {
    res.status(200).json({
        message: 'Đăng xuất thành công. Hãy xóa token ở client.'
    });
};

/**
 * 4. CRUD: Get All Users
 */
exports.getAllUsers = async (req, res) => {
    try {
        const pool = await poolPromise;
        if (!pool) {
            return res.status(500).json({ error: 'Không thể kết nối đến cơ sở dữ liệu.' });
        }
        const result = await pool.request().query(`
            SELECT id, username, email, role, firstName, lastName, phoneNumber, createdAt, updatedAt 
            FROM Users 
            ORDER BY id DESC
        `);
        res.status(200).json({
            message: 'Danh sách người dùng',
            data: result.recordset
        });
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * 5. CRUD: Get User By ID
 */
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        if (!pool) {
            return res.status(500).json({ error: 'Không thể kết nối đến cơ sở dữ liệu.' });
        }
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT id, username, email, role, firstName, lastName, phoneNumber, createdAt, updatedAt 
                FROM Users 
                WHERE id = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
        }

        res.status(200).json({
            message: 'Thông tin người dùng',
            data: result.recordset[0]
        });
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * 6. CRUD: Create User (Admin only, allows creating HR/Lawyer/Staff/Client)
 */
exports.createUser = async (req, res) => {
    try {
        const { username, email, password, role, firstName, lastName, phoneNumber } = req.body;

        if (!username || !email || !password || !role) {
            return res.status(400).json({ error: 'Username, email, password, and role are required.' });
        }

        const pool = await poolPromise;
        if (!pool) {
            return res.status(500).json({ error: 'Không thể kết nối đến cơ sở dữ liệu.' });
        }

        // Check duplicates
        const dupCheck = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT id FROM Users WHERE username = @username');

        if (dupCheck.recordset.length > 0) {
            return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại.' });
        }

        const hashedPassword = hashPassword(password);
        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .input('password', sql.NVarChar, hashedPassword)
            .input('email', sql.NVarChar, email)
            .input('role', sql.NVarChar, role)
            .input('firstName', sql.NVarChar, firstName || null)
            .input('lastName', sql.NVarChar, lastName || null)
            .input('phoneNumber', sql.NVarChar, phoneNumber || null)
            .query(`
                INSERT INTO Users (username, password, email, role, firstName, lastName, phoneNumber, createdAt, updatedAt)
                OUTPUT INSERTED.id, INSERTED.username, INSERTED.email, INSERTED.role, INSERTED.firstName, INSERTED.lastName, INSERTED.phoneNumber, INSERTED.createdAt
                VALUES (@username, @password, @email, @role, @firstName, @lastName, @phoneNumber, GETDATE(), GETDATE())
            `);

        res.status(201).json({
            message: 'Tạo tài khoản thành công (Admin).',
            user: result.recordset[0]
        });
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * 7. CRUD: Update User
 */
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, role, firstName, lastName, phoneNumber, password } = req.body;

        const pool = await poolPromise;
        if (!pool) {
            return res.status(500).json({ error: 'Không thể kết nối đến cơ sở dữ liệu.' });
        }

        // Fetch current user
        const checkResult = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Users WHERE id = @id');

        if (checkResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
        }

        const current = checkResult.recordset[0];

        // Prepare updates
        const finalEmail = email !== undefined ? email : current.email;
        const finalRole = role !== undefined ? role : current.role;
        const finalFirstName = firstName !== undefined ? firstName : current.firstName;
        const finalLastName = lastName !== undefined ? lastName : current.lastName;
        const finalPhoneNumber = phoneNumber !== undefined ? phoneNumber : current.phoneNumber;
        const finalPassword = password ? hashPassword(password) : current.password;

        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('email', sql.NVarChar, finalEmail)
            .input('role', sql.NVarChar, finalRole)
            .input('firstName', sql.NVarChar, finalFirstName)
            .input('lastName', sql.NVarChar, finalLastName)
            .input('phoneNumber', sql.NVarChar, finalPhoneNumber)
            .input('password', sql.NVarChar, finalPassword)
            .query(`
                UPDATE Users 
                SET email = @email,
                    role = @role,
                    firstName = @firstName,
                    lastName = @lastName,
                    phoneNumber = @phoneNumber,
                    password = @password,
                    updatedAt = GETDATE()
                OUTPUT INSERTED.id, INSERTED.username, INSERTED.email, INSERTED.role, INSERTED.firstName, INSERTED.lastName, INSERTED.phoneNumber, INSERTED.updatedAt
                WHERE id = @id
            `);

        res.status(200).json({
            message: 'Cập nhật thông tin người dùng thành công.',
            user: result.recordset[0]
        });
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * 8. CRUD: Delete User
 */
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        if (!pool) {
            return res.status(500).json({ error: 'Không thể kết nối đến cơ sở dữ liệu.' });
        }

        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Users OUTPUT DELETED.id WHERE id = @id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
        }

        res.status(200).json({
            message: `Xóa người dùng ID ${id} thành công.`
        });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: err.message });
    }
};
