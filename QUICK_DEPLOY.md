# 🚀 Quick Deploy Guide

## ✅ Frontend đã sẵn sàng
**URL Frontend**: https://customer-prediction-big-data-sfsa.vercel.app

## 🔧 Bước tiếp theo: Deploy Backend

### 1. Chạy script chuẩn bị:
```bash
deploy-complete.bat
```

### 2. Deploy Backend lên Render:

1. **Truy cập**: https://render.com
2. **Đăng nhập** bằng GitHub
3. **New** → **Web Service**
4. **Connect repository**: `Customer-Prediction-BigData`

### 3. Cấu hình Render:
```
Name: customer-prediction-bigdata-sfsa
Environment: Python 3
Build Command: pip install -r requirements.txt
Start Command: gunicorn wsgi:app
Plan: Free
```

### 4. Environment Variables:
```
ALLOWED_ORIGINS = https://customer-prediction-big-data-sfsa.vercel.app,http://localhost:3000
PYTHON_VERSION = 3.9.16
```

### 5. Sau khi Backend deploy xong:

**Backend URL sẽ là**: `https://customer-prediction-bigdata-sfsa.onrender.com`

### 6. Cập nhật Frontend:
1. Vào **Vercel Dashboard**: https://vercel.com/vothanhhai156-3787s-projects/customer-prediction-big-data-sfsa
2. **Settings** → **Environment Variables**
3. Cập nhật `REACT_APP_API_URL` = `https://customer-prediction-bigdata-sfsa.onrender.com`
4. **Redeploy**

### 7. Test kết nối:
```bash
# Test backend
curl https://customer-prediction-bigdata-sfsa.onrender.com/health

# Test frontend
# Truy cập: https://customer-prediction-big-data-sfsa.vercel.app
# Thử tính năng dự đoán
```

## 🎯 URLs cuối cùng:
- **Frontend**: https://customer-prediction-big-data-sfsa.vercel.app
- **Backend**: https://customer-prediction-bigdata-sfsa.onrender.com

## ⏱️ Thời gian:
- Backend deploy: 5-10 phút
- Frontend update: 2-3 phút
- **Tổng**: ~15 phút

## 🚨 Lưu ý:
- Lần đầu truy cập backend có thể chậm (cold start)
- Free plan có giới hạn, server sẽ "ngủ" sau 15 phút không dùng
