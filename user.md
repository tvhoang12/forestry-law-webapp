# Hướng Dẫn Chi Tiết Xác Thực Người Dùng & Các Phương Pháp Bảo Mật

Tài liệu này giải thích chi tiết các bước triển khai logic Đăng ký, Đăng nhập, Đăng xuất cho dự án **Forestry Law Web App**, đề xuất phương án bảo mật tất cả tính năng khác bằng Middleware và đưa ra các khuyến nghị bảo mật nâng cao.

---

## 1. Giải Thích Logic Đăng Ký, Đăng Nhập, Đăng Xuất Từng Bước

Tất cả các logic nghiệp vụ đã được hoàn thiện trong hai tệp:
- **Bộ điều khiển**: [userController.js](file:///c:/Users/hh950/Documents/Nodejs/forrestry_law_webapp/src/controllers/userController.js)
- **Tuyến đường (Routes)**: [user.js](file:///c:/Users/hh950/Documents/Nodejs/forrestry_law_webapp/src/routes/user.js)

### Bước 1: Đăng Ký Tài Khoản (`POST /api/user/register`)
1. **Thu thập dữ liệu**: Nhận `username`, `firstName`, `lastName`, `phoneNumber`, `email`, `password` và `reCheckPassword` từ `req.body`.
2. **Kiểm tra đầu vào đầy đủ**: Đảm bảo tất cả các trường đều được gửi lên, nếu thiếu trả về mã lỗi `400`.
3. **Kiểm tra khớp mật khẩu**: So sánh `password` với `reCheckPassword`. Nếu không khớp, trả về lỗi.
4. **Kiểm tra độ mạnh của mật khẩu (Password Strength)**:
   - Sử dụng các biểu thức chính quy (Regex) để xác thực mật khẩu có độ dài tối thiểu là 8 ký tự, chứa ít nhất 1 chữ in hoa (`/[A-Z]/`), ít nhất 1 chữ thường (`/[a-z]/`), ít nhất 1 số (`/[0-9]/`) và ít nhất 1 ký tự đặc biệt (`/[^A-Za-z0-9]/`).
5. **Kiểm tra độ dài số điện thoại chuẩn**:
   - Nếu bắt đầu bằng `0`: Độ dài phải chính xác là 10 ký tự số.
   - Nếu bắt đầu bằng `+84`: Độ dài phải chính xác là 12 ký tự (tính cả dấu `+`) và theo sau bởi các chữ số.
6. **Bảo mật chống SQL Injection**:
   - Sử dụng các truy vấn được tham số hóa (Parameterized Queries) của thư viện `mssql` thông qua phương thức `.input()`. Các giá trị đầu vào không được chèn trực tiếp vào chuỗi SQL mà được truyền dưới dạng các tham số an toàn, ngăn chặn hoàn toàn tấn công SQL Injection.
7. **Kiểm tra trùng lặp Tên đăng nhập (Username)**: Truy vấn trong database xem username đã tồn tại chưa trước khi tạo.
8. **Mã hóa mật khẩu**:
   - Sử dụng module `crypto` tích hợp sẵn trong Node.js để mã hóa mật khẩu theo thuật toán **PBKDF2 with SHA-512** (kèm theo muối ngẫu nhiên `salt`). Dữ liệu lưu trữ có định dạng `salt:hash`.
9. **Ép buộc vai trò (Role Override)**:
   - Vai trò lưu vào DB được gán cứng là `customer`. Bất kỳ tham số `role` nào do client gửi lên trong body của request Đăng ký đều bị bỏ qua để tránh tấn công chiếm quyền quản trị.
10. **Lưu DB và trả về kết quả**: Chèn bản ghi vào bảng `Users` và trả về thông tin người dùng mới (không kèm mật khẩu).

### Bước 2: Đăng Nhập Tài Khoản (`POST /api/user/login`)
1. **Truy vấn người dùng**: Tìm kiếm tài khoản trong DB theo `username` bằng truy vấn tham số hóa.
2. **Kiểm tra sự tồn tại**: Nếu kết quả truy vấn rỗng, trả về thông báo lỗi cụ thể: `"Người dùng không tồn tại"` với mã trạng thái `400`.
3. **Kiểm tra mật khẩu**:
   - Sử dụng hàm kiểm tra mật mã để sinh hash từ mật khẩu đăng nhập của người dùng và muối (`salt`) đã lưu trong DB. So sánh giá trị hash này với hash trong DB.
   - Nếu không khớp, trả về thông báo lỗi cụ thể: `"Password sai"` với mã trạng thái `400`.
4. **Tạo mã thông báo JWT**:
   - Khi thông tin chính xác, hệ thống ký mã thông báo JWT (JSON Web Token) chứa `id`, `username`, và `role` của người dùng sử dụng chuỗi bí mật lấy từ tệp `credential.json`. Thời gian hết hạn là `1 ngày` (1d).
5. **Trả về client**: Gửi về JWT cùng thông tin tài khoản của người dùng.

### Bước 3: Đăng Xuất Tài Khoản (`POST /api/user/logout`)
- Vì JWT là một cơ chế xác thực phi trạng thái (stateless), server không cần lưu trữ session.
- Endpoint trả về phản hồi thành công và hướng dẫn phía Client xóa mã JWT khỏi bộ lưu trữ cục bộ (`localStorage` / `sessionStorage`) hoặc xóa cookies.

---

## 2. Đề Xuất Các Phương Án Xác Thực Cho Các Tính Năng Còn Lại

Để bảo vệ toàn bộ các tính năng khác trong dự án (News, Documents, Chatbot, Appointments) nhằm yêu cầu người dùng phải đăng nhập trước khi truy cập, phương án tối ưu nhất là sử dụng **Middleware Xác thực (Authentication Middleware)** trong Express.

### Phương Án: Tạo và Áp Dụng `authMiddleware`

#### Bước 1: Tạo tệp Middleware mới `src/middlewares/auth.js`
Tệp này sẽ chịu trách nhiệm chặn các yêu cầu, kiểm tra Header `Authorization`, giải mã JWT và kiểm tra tính hợp lệ.

```javascript
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/db');

module.exports = (req, res, next) => {
    // Lấy token từ header Authorization (định dạng: Bearer <token>)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Yêu cầu đăng nhập trước khi thực hiện hành động này.' });
    }

    try {
        // Xác thực chữ ký và giải mã JWT
        const decoded = jwt.verify(token, jwtSecret);
        
        // Gắn thông tin người dùng đã xác thực vào object request
        req.user = decoded;
        
        next(); // Cho phép request tiếp tục đi tới controller
    } catch (err) {
        return res.status(403).json({ error: 'Mã xác thực không hợp lệ hoặc đã hết hạn.' });
    }
};
```

#### Bước 2: Tích hợp Middleware vào các Tuyến đường (Routes) cần bảo vệ
Chúng ta chỉ cần thêm Middleware này vào trước các bộ xử lý controller trong tệp route tương ứng.

##### Ví dụ bảo vệ toàn bộ tính năng Lịch hẹn trong `src/routes/appointments.js`:
```javascript
const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const auth = require('../middlewares/auth'); // Import middleware xác thực

// Yêu cầu đăng nhập đối với TẤT CẢ các hành động liên quan tới lịch hẹn
router.use(auth); 

router.get('/', appointmentController.getAllAppointments);
router.get('/:id', appointmentController.getAppointmentById);
router.post('/', appointmentController.createAppointment);
router.put('/:id', appointmentController.updateAppointment);
router.delete('/:id', appointmentController.deleteAppointment);

module.exports = router;
```

##### Ví dụ bảo vệ tính năng Chatbot AI trong `src/routes/chatbot.js`:
```javascript
const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const auth = require('../middlewares/auth');

// Chỉ cho phép người dùng đã đăng nhập trò chuyện với Chatbot
router.post('/message', auth, chatbotController.sendMessage);

module.exports = router;
```

##### Phân quyền truy cập nâng cao (RBAC - Role Based Access Control)
Ta có thể mở rộng middleware để lọc quyền truy cập theo vai trò. Ví dụ chỉ cho phép Admin hoặc Staff quản lý Tin tức và Tài liệu pháp luật:

```javascript
// Middleware phân quyền
const authorize = (roles = []) => {
    return (req, res, next) => {
        if (!req.user || (roles.length && !roles.includes(req.user.role))) {
            return res.status(403).json({ error: 'Bạn không có quyền thực hiện hành động này.' });
        }
        next();
    };
};

// Áp dụng trong src/routes/news.js
router.post('/', auth, authorize(['admin', 'staff']), newsController.createNews);
```

---

## 3. Đề Xuất Các Phương Pháp Bảo Mật Người Dùng Nâng Cao

Để bảo vệ thông tin người dùng khỏi các nguy cơ tấn công mạng hiện đại, chúng tôi đề xuất áp dụng các giải pháp bảo mật sau:

### 1. Sử dụng Cookies HTTP-Only thay thế LocalStorage
* **Vấn đề**: Lưu JWT trong `localStorage` dễ bị tấn công đánh cắp token thông qua lỗ hổng XSS (Cross-Site Scripting).
* **Giải pháp**: Gửi JWT qua Cookie với cờ `httpOnly: true`, `secure: true` (chỉ gửi qua HTTPS) và `sameSite: 'strict'`. Việc này khiến JavaScript phía client không thể đọc được cookie, triệt tiêu nguy cơ bị ăn cắp token qua XSS.

### 2. Triển khai Giới hạn Tần suất Yêu cầu (Rate Limiting)
* **Vấn đề**: Kẻ tấn công có thể thực hiện dò quét mật khẩu hàng loạt (Brute-Force Attack) vào các API đăng nhập hoặc đăng ký.
* **Giải pháp**: Sử dụng thư viện như `express-rate-limit` để giới hạn số lượng request từ một địa chỉ IP (ví dụ: tối đa 5 lần đăng nhập sai trong 15 phút, nếu vượt quá sẽ tạm khóa IP).

### 3. Cơ chế Khóa tài khoản tạm thời (Account Lockout)
* **Giải pháp**: Thiết lập số lần đăng nhập sai tối đa cho tài khoản (ví dụ: 5 lần). Khi vượt quá, cột `isLocked` trong DB của tài khoản đó sẽ được đặt thành `true` trong vòng 30 phút, hoặc yêu cầu đặt lại mật khẩu qua email.

### 4. Sử dụng HTTPS / TLS bắt buộc
* **Giải pháp**: Tất cả dữ liệu truyền qua internet (đặc biệt là mật khẩu và token) bắt buộc phải được mã hóa bằng giao thức HTTPS. Cấu hình HTTP Strict Transport Security (HSTS) để ép trình duyệt luôn sử dụng HTTPS.

### 5. Lưu trữ nhật ký kiểm toán (Audit Logs)
* **Giải pháp**: Lưu lại nhật ký các hành động nhạy cảm (Đăng nhập thất bại, Thay đổi mật khẩu, Thay đổi quyền hạn, Đăng ký mới) kèm theo IP và thời gian để dễ dàng điều tra khi xảy ra sự cố bảo mật.
