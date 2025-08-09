# 🚀 Deploy Backend lên Render - Hướng dẫn chi tiết

## Bước 1: Truy cập Render

1. **Mở trình duyệt** và truy cập: https://render.com
2. **Đăng ký/Đăng nhập** bằng GitHub account
3. **Authorize Render** để truy cập GitHub repositories

## Bước 2: Tạo Web Service

1. **Click "New"** ở góc trên bên phải
2. **Chọn "Web Service"**
3. **Connect GitHub repository**:
   - Tìm repository: `Customer-Prediction-BigData`
   - Click "Connect"

## Bước 3: Cấu hình Service

### Basic Settings:
- **Name**: `customer-prediction-bigdata`
- **Environment**: `Python 3`
- **Region**: `Oregon (US West)` hoặc gần nhất
- **Branch**: `main`

### Build & Deploy Settings:
- **Root Directory**: `. ` (để trống hoặc dấu chấm)
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn wsgi:app`

### Advanced Settings:
- **Auto-Deploy**: `Yes`
- **Plan**: `Free`

## Bước 4: Environment Variables

Click **"Advanced"** và thêm Environment Variables:

```
ALLOWED_ORIGINS = https://customer-prediction-bigdata.vercel.app,http://localhost:3000,http://localhost:3001
PYTHON_VERSION = 3.9.16
```

## Bước 5: Deploy

1. **Click "Create Web Service"**
2. **Chờ deployment** (5-10 phút)
3. **Kiểm tra logs** để đảm bảo không có lỗi

## Bước 6: Lấy URL Backend

Sau khi deploy thành công:
- URL sẽ có dạng: `https://customer-prediction-bigdata.onrender.com`
- Copy URL này để cập nhật frontend

## Bước 7: Test Backend

Test các endpoints:
```bash
# Health check
curl https://customer-prediction-bigdata.onrender.com/health

# Test prediction
curl -X POST https://customer-prediction-bigdata.onrender.com/predict \
  -H "Content-Type: application/json" \
  -d '{"MonthlyCharges": 50, "Contract": "Month-to-month"}'
```

## Bước 8: Cập nhật Frontend

Cập nhật environment variable trong Vercel:
1. Vào Vercel dashboard
2. Chọn project frontend
3. Settings → Environment Variables
4. Cập nhật `REACT_APP_API_URL` = `https://customer-prediction-bigdata.onrender.com`
5. Redeploy frontend

## 🚨 Troubleshooting

### Lỗi thường gặp:

1. **Build Failed**:
   - Kiểm tra `requirements.txt`
   - Xem build logs trong Render dashboard

2. **Start Command Failed**:
   - Đảm bảo có file `wsgi.py`
   - Kiểm tra import trong `wsgi.py`

3. **Model Loading Error**:
   - Đảm bảo file `.pkl` có trong repository
   - Kiểm tra đường dẫn file

4. **CORS Error**:
   - Kiểm tra `ALLOWED_ORIGINS` environment variable
   - Đảm bảo URL frontend được thêm vào

### Debug:
- **Xem logs**: Render Dashboard → Service → Logs
- **Test local**: `python app.py` trước khi deploy
- **Check files**: Đảm bảo tất cả files cần thiết có trong repository

## ✅ Checklist

- [ ] Repository đã push lên GitHub
- [ ] Render account đã tạo và connect GitHub
- [ ] Web Service đã tạo với cấu hình đúng
- [ ] Environment variables đã set
- [ ] Build và deploy thành công
- [ ] Backend URL đã test
- [ ] Frontend đã cập nhật API URL
- [ ] End-to-end test hoạt động

**Lưu ý**: Lần đầu truy cập có thể chậm (cold start ~30s)
