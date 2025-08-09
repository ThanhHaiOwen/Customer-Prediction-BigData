# 🚀 Customer Churn Prediction System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-brightgreen)](https://customer-prediction-big-data-sfsa.vercel.app)
[![Backend API](https://img.shields.io/badge/Backend%20API-Render-blue)](https://customer-prediction-bigdata.onrender.com)
[![Python](https://img.shields.io/badge/Python-3.11.7-blue)](https://python.org)
[![React](https://img.shields.io/badge/React-19.0.0-blue)](https://reactjs.org)
[![Flask](https://img.shields.io/badge/Flask-3.0.0-green)](https://flask.palletsprojects.com)

Hệ thống dự đoán khách hàng rời bỏ dịch vụ (Customer Churn Prediction) sử dụng Machine Learning và Big Data. Dự án này giúp doanh nghiệp dự đoán khách hàng có khả năng rời bỏ dịch vụ để có chiến lược giữ chân phù hợp.

## 🌐 Live Demo

- **🎯 Frontend**: [https://customer-prediction-big-data-sfsa.vercel.app](https://customer-prediction-big-data-sfsa.vercel.app)
- **🔧 Backend API**: [https://customer-prediction-bigdata.onrender.com](https://customer-prediction-bigdata.onrender.com)

## ✨ Tính năng chính

- 📊 **Dự đoán Churn**: Dự đoán khả năng khách hàng rời bỏ dịch vụ
- 🔍 **Lọc dữ liệu**: Hiển thị danh sách khách hàng theo trạng thái churn
- 🔎 **Tìm kiếm**: Tìm kiếm khách hàng theo nhiều tiêu chí
- 📈 **Phân tích dữ liệu**: Biểu đồ thống kê và phân tích churn rate

## 🛠️ Công nghệ sử dụng

### Backend
- **Python 3.11.7** - Ngôn ngữ lập trình chính
- **Flask 3.0.0** - Web framework
- **Scikit-learn** - Machine Learning
- **Pandas** - Xử lý dữ liệu
- **Gunicorn** - WSGI server

### Frontend
- **React 19.0.0** - UI framework
- **Chart.js** - Hiển thị biểu đồ
- **Axios** - HTTP client
- **React Router** - Routing

### Deployment
- **Render** - Backend hosting
- **Vercel** - Frontend hosting
- **GitHub** - Version control

## 📸 Screenshots

### Trang chủ
![Homepage](https://via.placeholder.com/800x400/4285f4/ffffff?text=Customer+Churn+Prediction+Homepage)

### Dự đoán Churn
![Prediction](https://via.placeholder.com/800x400/34a853/ffffff?text=Churn+Prediction+Feature)

### Biểu đồ thống kê
![Charts](https://via.placeholder.com/800x400/ea4335/ffffff?text=Data+Analytics+Charts)

## 📁 Cấu trúc dự án

```
├── Backend (Python/Flask)
│   ├── app.py                          # Flask server
│   ├── best_logistic_model.pkl         # Model đã train
│   ├── scaler.pkl                      # Bộ chuẩn hóa dữ liệu
│   ├── wsgi.py                         # WSGI entry point
│   ├── requirements.txt                # Python dependencies
│   └── WA_Fn-UseC_-Telco-Customer-Churn.csv   # Dataset gốc
│
├── Frontend (React)
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── PredictionForm.js       # Form nhập liệu
│       │   ├── chartPage.js            # Trang biểu đồ
│       │   ├── FilterPage.js           # Trang lọc dữ liệu
│       │   └── search.js               # Component tìm kiếm
│       └── App.js                      # Component chính
```

## Tính năng

1. **Dự đoán khách hàng rời bỏ**
   - Nhập thông tin chi phí hàng tháng
   - Chọn loại hợp đồng
   - Nhận kết quả dự đoán

2. **Visualize dữ liệu**
   - Biểu đồ thống kê
   - Ma trận nhầm lẫn

3. **Tìm kiếm và lọc**
   - Tìm kiếm khách hàng
   - Lọc theo nhiều tiêu chí

## Cài đặt

### Backend

```bash
# Cài đặt dependencies
pip install -r requirements.txt

# Chạy server
python app.py
```

### Frontend

```bash
# Di chuyển vào thư mục frontend
cd react-frontend

# Cài đặt dependencies
npm install

# Chạy ứng dụng
npm start
```

## API Endpoints

- `GET /health`: Health check endpoint
- `POST /predict`: Dự đoán khách hàng
  ```json
  {
    "MonthlyCharges": 50.5,
    "Contract": "Month-to-month"
  }
  ```
- `GET /api/filter-churn?churn=Yes`: Lọc khách hàng theo churn status
- `GET /api/search-customers`: Tìm kiếm khách hàng
- `GET /api/churn-data`: Lấy dữ liệu thống kê

## Deployment

### Backend (Render)

1. **Tạo tài khoản Render**: Đăng ký tại [render.com](https://render.com)

2. **Tạo Web Service**:
   - Connect GitHub repository
   - Chọn branch `main`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn wsgi:app`

3. **Environment Variables**:
   ```
   ALLOWED_ORIGINS=https://customer-prediction-bigdata.vercel.app
   ```

4. **Deploy**: Render sẽ tự động deploy khi có push mới

### Frontend (Vercel)

1. **Tạo tài khoản Vercel**: Đăng ký tại [vercel.com](https://vercel.com)

2. **Import Project**:
   - Connect GitHub repository
   - Chọn thư mục `react-frontend`
   - Framework Preset: `Create React App`

3. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://your-render-app.onrender.com
   ```

4. **Deploy**: Vercel sẽ tự động deploy khi có push mới

## Công nghệ sử dụng

- **Backend**: Python, Flask, Pandas, Scikit-learn
- **Frontend**: React, Chart.js
- **Machine Learning**: Logistic Regression
- **Deployment**: Render (Backend), Vercel (Frontend)

## Cách sử dụng

### Local Development
1. Khởi động Backend: `python app.py` (chạy tại http://localhost:5000)
2. Khởi động Frontend: `cd react-frontend && npm start` (chạy tại http://localhost:3001)
3. Truy cập http://localhost:3001 để sử dụng ứng dụng
4. Sử dụng các tính năng:
   - **Dự đoán**: Nhập chi phí hàng tháng và loại hợp đồng
   - **Lọc dữ liệu**: Xem danh sách khách hàng theo trạng thái churn
   - **Tìm kiếm**: Tìm khách hàng theo ID, chi phí, hợp đồng
   - **Biểu đồ**: Xem thống kê và phân tích dữ liệu

### Production (Deploy lên Internet)

**🌐 Để chia sẻ với người khác, xem file [DEPLOY_GUIDE.md](DEPLOY_GUIDE.md)**

Sau khi deploy thành công:
- Frontend: [https://customer-prediction-bigdata.vercel.app](https://customer-prediction-bigdata.vercel.app)
- API: [https://customer-prediction-bigdata.onrender.com](https://customer-prediction-bigdata.onrender.com)

**Cách nhanh nhất (Ngrok)**:
```bash
# Terminal 1: Chạy backend
python app.py

# Terminal 2: Chạy frontend
cd react-frontend && npm start

# Terminal 3: Tạo tunnel
ngrok http 3001
```

Lưu ý: Lần đầu tiên truy cập có thể mất vài giây để server khởi động.

## Troubleshooting

### Lỗi thường gặp

1. **CORS Error**: Kiểm tra `ALLOWED_ORIGINS` environment variable
2. **Model Loading Error**: Đảm bảo file `best_logistic_model.pkl` và `scaler.pkl` có trong repository
3. **File Not Found**: Kiểm tra các file CSV cần thiết (`xemfulldata.csv`, `thongke.csv`)

### Debug

- Backend logs: Kiểm tra logs trong Render dashboard
- Frontend logs: Kiểm tra browser console
- API testing: Sử dụng Postman hoặc curl để test endpoints

## Authors

- Thanh Hải