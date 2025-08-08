# Customer Prediction System

Hệ thống dự đoán khách hàng rời bỏ dịch vụ (Customer Churn Prediction) sử dụng Machine Learning.

## Cấu trúc dự án

```
├── Backend (Python/Flask)
│   ├── app.py                          # Flask server
│   ├── best_logistic_model.pkl         # Model đã train
│   ├── scaler.pkl                      # Bộ chuẩn hóa dữ liệu
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
pip install flask flask-cors pandas numpy matplotlib joblib

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

- `POST /predict`: Dự đoán khách hàng
  ```json
  {
    "MonthlyCharges": 50.5,
    "Contract": "Month-to-month"
  }
  ```

## Công nghệ sử dụng

- **Backend**: Python, Flask, Pandas, Scikit-learn
- **Frontend**: React, Chart.js
- **Machine Learning**: Logistic Regression

## Cách sử dụng

1. Truy cập http://localhost:3000
2. Nhập thông tin khách hàng vào form
3. Nhận kết quả dự đoán

## Authors

- Thanh Hải