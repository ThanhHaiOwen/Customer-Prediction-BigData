# 🚀 Hướng dẫn Deploy lên Internet

## Phương án 1: Render + Vercel (Miễn phí) - **Khuyến nghị**

### 📋 Chuẩn bị

1. **Tài khoản cần thiết**:
   - GitHub account
   - Render account (render.com)
   - Vercel account (vercel.com)

2. **Push code lên GitHub**:
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 🔧 Bước 1: Deploy Backend lên Render

1. **Truy cập [render.com](https://render.com)**
2. **Đăng nhập bằng GitHub**
3. **Tạo Web Service**:
   - Click "New" → "Web Service"
   - Connect GitHub repository
   - Chọn repository này
   - Cấu hình:
     - **Name**: `customer-prediction-bigdata`
     - **Environment**: `Python 3`
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `gunicorn wsgi:app`
     - **Plan**: Free

4. **Environment Variables** (trong Advanced settings):
   ```
   ALLOWED_ORIGINS = https://customer-prediction-bigdata.vercel.app,http://localhost:3000
   PYTHON_VERSION = 3.9.16
   ```

5. **Deploy**: Click "Create Web Service"

**URL Backend sẽ là**: `https://customer-prediction-bigdata.onrender.com`

### 🎨 Bước 2: Deploy Frontend lên Vercel

1. **Truy cập [vercel.com](https://vercel.com)**
2. **Đăng nhập bằng GitHub**
3. **Import Project**:
   - Click "New Project"
   - Import từ GitHub
   - Chọn repository này
   - **Root Directory**: `react-frontend`
   - **Framework Preset**: `Create React App`

4. **Environment Variables**:
   ```
   REACT_APP_API_URL = https://customer-prediction-bigdata.onrender.com
   REACT_APP_ENV = production
   ```

5. **Deploy**: Click "Deploy"

**URL Frontend sẽ là**: `https://customer-prediction-bigdata.vercel.app`

### ✅ Bước 3: Kiểm tra

1. **Test Backend**: Truy cập `https://customer-prediction-bigdata.onrender.com/health`
2. **Test Frontend**: Truy cập `https://customer-prediction-bigdata.vercel.app`

### 🔄 Auto Deploy

- **Render**: Tự động deploy khi push code mới
- **Vercel**: Tự động deploy khi push code mới

---

## Phương án 2: Ngrok (Nhanh nhất - Tạm thời)

### 📥 Cài đặt Ngrok

1. **Download**: [ngrok.com](https://ngrok.com)
2. **Đăng ký tài khoản** để có authtoken
3. **Cài đặt authtoken**:
```bash
ngrok authtoken YOUR_AUTHTOKEN
```

### 🚀 Chạy

1. **Khởi động Backend**:
```bash
python app.py
```

2. **Khởi động Frontend**:
```bash
cd react-frontend
npm start
```

3. **Tạo tunnel cho Backend**:
```bash
ngrok http 5000
```

4. **Tạo tunnel cho Frontend**:
```bash
ngrok http 3001
```

5. **Chia sẻ URL** mà ngrok cung cấp

**Lưu ý**: Ngrok chỉ hoạt động khi máy tính của bạn bật

---

## Phương án 3: Railway (Thay thế Render)

### 🚂 Deploy lên Railway

1. **Truy cập [railway.app](https://railway.app)**
2. **Đăng nhập bằng GitHub**
3. **New Project** → **Deploy from GitHub repo**
4. **Chọn repository**
5. **Environment Variables**:
   ```
   ALLOWED_ORIGINS = https://your-frontend-url.vercel.app
   ```

---

## 🛠️ Troubleshooting

### Lỗi thường gặp:

1. **CORS Error**:
   - Kiểm tra `ALLOWED_ORIGINS` environment variable
   - Đảm bảo URL frontend được thêm vào

2. **Model Loading Error**:
   - Đảm bảo file `.pkl` có trong repository
   - Kiểm tra file size (GitHub có giới hạn 100MB)

3. **Build Failed**:
   - Kiểm tra `requirements.txt`
   - Kiểm tra Python version

4. **Cold Start (Render)**:
   - Lần đầu truy cập có thể chậm (30s)
   - Server sẽ "ngủ" sau 15 phút không sử dụng

### 🔍 Debug:

- **Backend logs**: Xem trong Render/Railway dashboard
- **Frontend logs**: Xem browser console
- **API test**: Dùng Postman hoặc curl

---

## 📱 Chia sẻ với người khác

Sau khi deploy thành công:

1. **Chia sẻ URL Frontend**: `https://customer-prediction-bigdata.vercel.app`
2. **Hướng dẫn sử dụng**:
   - Truy cập URL
   - Chọn tính năng muốn sử dụng
   - Nhập dữ liệu và xem kết quả

**Lưu ý**: Lần đầu truy cập có thể chậm vì server cần khởi động (cold start)
