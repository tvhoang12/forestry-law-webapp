# Forestry Law Web App Base

Dự án này cung cấp hệ thống cơ sở hoàn chỉnh bao gồm Backend (Node.js/Express) kết nối SQL Server và Frontend Boilerplate (ReactJS/Vite).

---

## 1. Công nghệ sử dụng
- **Backend**: Node.js, Express.js
- **Frontend**: ReactJS, Vite, React Router DOM (dưới dạng các file shell boilerplate rỗng giống nhau để phát triển tiếp)
- **Database**: SQL Server (sử dụng thư viện `mssql` quản lý Connection Pool)
- **Tài liệu API**: Swagger UI tự động tạo tài liệu từ chú thích JSDoc

---

## 2. Cấu trúc thư mục dự án

```text
/forrestry_law_webapp
│
├── frontend/                  # Mã nguồn của ReactJS (Vite)
│   ├── src/
│   │   ├── components/        # Các thành phần giao diện chung (rỗng)
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   ├── pages/             # Các trang chức năng chính (rỗng)
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Chatbot.jsx
│   │   │   ├── News.jsx
│   │   │   ├── LegalDocuments.jsx
│   │   │   ├── Appointments.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── App.jsx            # Điều hướng tuyến (React Router DOM)
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js         # Cấu hình Vite & Proxy kết nối API
│   └── package.json
│
├── src/                       # Mã nguồn của NodeJS Backend
│   ├── config/
│   │   └── db.js              # Cấu hình SQL Server Connection Pool & API keys
│   ├── controllers/           # Xử lý logic nghiệp vụ cho API
│   │   ├── appointmentController.js  # Toy API thao tác thật với SQL Server DB
│   │   ├── authController.js         # Bypass Auth Logic (mẫu đăng nhập)
│   │   ├── userController.js         # Khung CRUD quản lý người dùng
│   │   ├── newsController.js         # Khung CRUD quản lý tin tức
│   │   ├── documentController.js     # Khung CRUD văn bản luật & tải PDF
│   │   └── chatbotController.js      # Trợ lý AI tư vấn luật lâm nghiệp
│   ├── routes/                # Định nghĩa tuyến endpoint
│   │   ├── appointments.js
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── news.js
│   │   ├── documents.js
│   │   └── chatbot.js
│   ├── docs/
│   │   └── swagger.js         # Cấu hình Swagger API docs
│   └── server.js              # File chạy server chính
│
├── credential.json            # Cấu hình tài khoản DB và API keys (không hardcode)
├── database.sql               # File kịch bản tạo CSDL SQL Server ứng dụng (ForestryLawDB)
├── lawdata.sql                # File kịch bản tạo CSDL Tri thức AI (LawData)
├── package.json               # Các thư viện phụ thuộc của backend
├── explain_step.md            # Các bước giải thích triển khai
└── README.md                  # Hướng dẫn chung
```

---

## 3. Chi tiết các tính năng

### 1. Quản lý Đăng Nhập/Đăng Ký (`/api/auth`)
- **Đăng ký (`/signup`) & Đăng nhập (`/signin`)**: Đang sử dụng logic đơn giản (bypass) trả về token mẫu `mock_jwt_token_123` mà không kiểm tra thông tin nghiêm ngặt.
- **Tài khoản nhân sự**: Chỉ có tài khoản Quản trị viên (Admin) mới có quyền tạo thêm tài khoản cho Luật sư và Nhân viên của hãng luật thông qua giao diện admin (không cho đăng ký công khai).

### 2. Quản lý Người dùng (`/api/users`)
- Chứa các API CRUD đầy đủ cho người dùng. Khách hàng có thể truy cập qua biểu tượng Avatar sau khi đăng nhập để cập nhật thông tin cá nhân.

### 3. Chatbot Trợ lý AI Lâm Nghiệp (`/api/chatbot`)
- Endpoint `POST /chatbot/message` hỗ trợ trò chuyện về các chủ đề lâm nghiệp như bảo vệ rừng, khai thác rừng, xử lý vi phạm pháp luật lâm nghiệp.
- Logic đọc khóa bảo mật AI một cách an toàn từ `credential.json` thông qua `db.js`.

### 4. Tin tức hãng luật (`/api/news`)
- Cho phép lưu trữ tin tức về luật lâm nghiệp cũng như các lĩnh vực pháp luật khác.
- Chứa các cột metadata để liên kết tài liệu hình ảnh, video trong database.

### 5. Văn bản pháp luật (`/api/documents`)
- Danh mục chứa các thông tư chỉ thị, nghị định của nhà nước về lâm nghiệp.
- Cho phép người dùng tải các file tài liệu PDF trực tiếp qua API `/documents/{id}/download`.

### 6. Đặt lịch hẹn với Luật sư (`/api/appointments`) - **Toy API Thao Tác DB Thật**
- Cho phép đặt lịch trực tuyến với các luật sư.
- Toàn bộ 5 phương thức CRUD của Đặt lịch đã được liên kết trực tiếp với database SQL Server (thêm mới, hiển thị danh sách, cập nhật thông tin, hủy lịch hẹn).

### 7. Cơ sở dữ liệu Tri thức AI (`LawData`)
- Đây là cơ sở dữ liệu chuyên biệt phục vụ lưu trữ tài liệu luật lâm nghiệp (phân cấp theo Văn bản -> Chương -> Mục -> Điều -> Khoản -> Điểm).
- Chứa các cột dữ liệu ngữ nghĩa/vector nhúng `EmbeddingContext` trong các bảng `Clauses`, `Points`, `LegalUnits` để sử dụng cho việc huấn luyện AI và tìm kiếm ngữ nghĩa (Semantic Search/RAG) sau này.

---

## 4. Hướng dẫn cài đặt và khởi chạy

### Bước 1: Thiết lập Cơ sở dữ liệu SQL Server
1. Đảm bảo SQL Server của bạn đang hoạt động.
2. **Cơ sở dữ liệu Ứng dụng (`ForestryLawDB`)**:
   - Tạo database mới tên là `ForestryLawDB`.
   - Thực thi toàn bộ câu lệnh trong tệp [database.sql](file:///c:/Users/hh950/Documents/Nodejs/forrestry_law_webapp/database.sql). Tệp này sẽ tự động tạo toàn bộ các bảng ứng dụng cốt lõi (`Users`, `News`, `LegalDocuments`, `Appointments`) cùng các bảng dữ liệu train AI liên quan (`Documents`, `Chapters`, `Sections`, `Articles`, `Clauses`, `Points`, `LegalUnits`) dưới lược đồ mặc định `dbo`.
   - Kịch bản được thiết lập để tự động kiểm tra và xóa bỏ các bảng tương ứng (drop) trước khi khởi tạo lại nếu chúng đã tồn tại.

### Bước 2: Cập nhật thông tin kết nối (`credential.json`)
Sửa đổi các thông số đăng nhập SQL Server của bạn tại [credential.json](file:///c:/Users/hh950/Documents/Nodejs/forrestry_law_webapp/credential.json):
```json
{
  "database": {
    "server": "localhost",
    "port": 1433,
    "user": "sa",
    "password": "Mật_Khẩu_Của_Bạn",
    "database": "ForestryLawDB",
    "options": {
      "encrypt": true,
      "trustServerCertificate": true
    }
  },
  "jwt": {
    "secret": "your_jwt_secret_key_here",
    "expiresIn": "1d"
  },
  "apiKeys": {
    "gemini": "mã_khóa_api_nếu_có"
  }
}
```

### Bước 3: Chạy ứng dụng Backend
Tại thư mục gốc dự án, thực hiện:
```bash
npm install
npm run dev
```
Server backend sẽ chạy ở cổng `http://localhost:3000`.

### Bước 4: Chạy ứng dụng Frontend
Di chuyển tới thư mục `frontend` và chạy:
```bash
cd frontend
npm install
npm run dev
```
Giao diện phát triển sẽ chạy ở cổng `http://localhost:5173`. Các yêu cầu đến `/api/*` sẽ được cấu hình proxy tự động chuyển tiếp tới backend.

### Bước 5: Xem tài liệu Swagger API
Sau khi backend khởi chạy thành công, truy cập trình duyệt tại địa chỉ:
[http://localhost:3000/api-docs](http://localhost:3000/api-docs) để thực nghiệm gọi các API.
