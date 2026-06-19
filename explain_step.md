# Hướng dẫn từng bước thiết lập dự án (Explain Steps)

Tài liệu này giải thích chi tiết các bước đã được thực hiện để hoàn thành các yêu cầu cho mã nguồn cơ sở (code base) của dự án Hãng Luật Lâm Nghiệp.

---

## Bước 1: Tạo tệp Kịch bản Cơ sở Dữ liệu (`database.sql`)
- **Tác vụ**: Tạo tệp `database.sql` tại thư mục gốc của dự án.
- **Chi tiết cấu trúc**:
  - `Users`: Quản lý tài khoản (Admin, Luật sư, Nhân sự, Khách hàng) và phân quyền tương ứng (`role`).
  - `News`: Quản lý tin tức chung và tin lâm nghiệp, hỗ trợ trường lưu trữ siêu dữ liệu truyền thông (`mediaUrl`, `mediaType`).
  - `LegalDocuments`: Lưu trữ văn kiện chỉ thị quốc gia, hỗ trợ đường dẫn PDF và siêu dữ liệu đi kèm (`fileUrl`, `fileType`).
  - `Appointments`: Bảng lưu thông tin đặt lịch, liên kết trực tiếp với người dùng và luật sư phụ trách.

## Bước 2: Bảo mật thông tin API và DB (`credential.json`)
- **Tác vụ**: Cập nhật tệp `credential.json` để cấu hình lưu trữ thông tin nhạy cảm.
- **Chi tiết cấu trúc**:
  - Đã thêm cấu hình `apiKeys.gemini` để chatbot AI có thể truy cập mã khóa động.
  - Các API key này được lưu riêng tư, tránh hiện tượng mã hóa cứng (hardcode) trong source code.

## Bước 3: Xây dựng Connection Pool cho CSDL (`src/config/db.js`)
- **Tác vụ**: Cấu trúc lại tệp cấu hình database.
- **Chi tiết kỹ thuật**:
  - Nhập thư viện `mssql`.
  - Khởi tạo một `ConnectionPool` toàn cục thông qua biến `poolPromise`.
  - Export `sql`, `poolPromise`, cấu hình và các API keys để tái sử dụng ở tất cả các controller khác.
  - Xử lý bắt lỗi lỗi kết nối CSDL (nếu cấu hình sai hoặc server DB chưa hoạt động) giúp ứng dụng không bị crash.

## Bước 4: Thiết lập Tuyến đường Chatbot AI (`/api/chatbot`)
- **Tác vụ**: Khởi tạo endpoint tư vấn pháp luật lâm nghiệp.
- **Chi tiết kỹ thuật**:
  - Tạo route `src/routes/chatbot.js` định nghĩa endpoint `POST /chatbot/message` kèm theo đặc tả tài liệu Swagger.
  - Tạo controller `src/controllers/chatbotController.js` thực hiện:
    - Đọc khóa API Gemini động từ config.
    - Xử lý các câu hỏi mẫu liên quan đến: "bảo vệ rừng", "khai thác lâm sản", "xử phạt vi phạm"... và trả về phản hồi giả định tương ứng.

## Bước 5: Cấu trúc lại Toy API Đặt Lịch (`src/controllers/appointmentController.js`)
- **Tác vụ**: Triển khai các phương thức CRUD thật lưu trữ và truy xuất trực tiếp từ database SQL Server.
- **Chi tiết kỹ thuật**:
  - Sử dụng đối tượng `poolPromise` và `sql` từ `db.js`.
  - Viết các câu lệnh SQL truy vấn trực tiếp (SELECT, INSERT, UPDATE, DELETE).
  - Có các logic toy (giả định) như gán tên mặc định nếu thiếu thông tin, gán trạng thái lịch hẹn ban đầu là `'Pending'`.

## Bước 6: Khai báo cấu trúc tuyến đường chính (`src/server.js`)
- **Tác vụ**: Đăng ký router `/api/chatbot` vào luồng chạy chính của server ExpressJS.

## Bước 7: Tạo khung giao diện ReactJS (`frontend/`)
- **Tác vụ**: Tạo sẵn các tệp của phía Frontend với cấu trúc hoàn chỉnh nhưng nội dung được tối giản hóa thành các component rỗng (Placeholder) giống nhau.
- **Cấu trúc thư mục tạo dựng**:
  - `frontend/package.json` và `frontend/vite.config.js`: Định cấu hình Vite & React cùng với Proxy chuyển hướng các yêu cầu `/api/*` tới backend cổng 3000.
  - `frontend/index.html` và `frontend/src/main.jsx`: Điểm khởi chạy của ứng dụng React.
  - `frontend/src/App.jsx`: Khởi tạo sẵn định tuyến React Router gồm 8 trang chính.
  - `frontend/src/components/`: Tạo sẵn các layout dùng chung `Navbar.jsx`, `Footer.jsx` có nội dung rỗng.
  - `frontend/src/pages/`: Tạo sẵn 8 trang nghiệp vụ chính có định dạng cấu trúc giống hệt nhau (`Home`, `Login`, `Register`, `Chatbot`, `News`, `LegalDocuments`, `Appointments`, `AdminDashboard`).

## Bước 8: Tích hợp Cơ sở dữ liệu Tri thức AI (`database.sql` lược đồ `dbo`)
- **Tác vụ**: Tích hợp toàn bộ cấu trúc bảng của `LawData` trực tiếp vào tệp `database.sql` của hệ thống dưới lược đồ mặc định `[dbo]`.
- **Ý nghĩa & Cấu trúc**:
  - Đây là cơ sở dữ liệu chuyên biệt phục vụ RAG (Retrieval-Augmented Generation) và tìm kiếm Vector Semantic cho Chatbot AI trong tương lai, được đặt chung trong cùng cơ sở dữ liệu `ForestryLawDB` của hệ thống dưới lược đồ `dbo` giúp truy vấn và huấn luyện AI trực tiếp.
  - Cấu trúc phân cấp gồm: `Documents` (Văn bản luật) -> `Chapters` (Chương) -> `Sections` (Mục) -> `Articles` (Điều) -> `Clauses` (Khoản) -> `Points` (Điểm).
  - Các bảng `Clauses`, `Points`, `LegalUnits` hỗ trợ trường `EmbeddingContext` (Dữ liệu vector nhúng phục vụ việc so khớp ngữ nghĩa của AI khi người dùng đặt câu hỏi).
  - Kịch bản hỗ trợ việc tự động kiểm tra và xóa bỏ bảng cũ nếu đã tồn tại trước khi tạo mới để tránh xung đột dữ liệu cấu trúc.
