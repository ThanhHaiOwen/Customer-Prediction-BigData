import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from flask import Flask, request, jsonify, send_file
import joblib
from io import BytesIO
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__, static_url_path='', static_folder='static')

# CORS configuration
allowed_origins = os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000,https://customer-prediction-bigdata.vercel.app').split(',')
CORS(app, resources={
    r"/*": {
        "origins": allowed_origins,
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Health check endpoint
@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy", "message": "Server is running"})

# ------------------ CHỨC NĂNG DỰ ĐOÁN ------------------
# Load model và scaler
try:
    model = joblib.load("best_logistic_model.pkl")
    scaler = joblib.load("scaler.pkl")
except Exception as e:
    print(f"Error loading model or scaler: {e}")
    model = None
    scaler = None

# Mapping cố định cho Contract (đảm bảo giống với lúc train)
contract_mapping = {"Month-to-month": 0, "One year": 1, "Two year": 2}

@app.route("/predict", methods=["POST", "GET"])
def predict():
    if request.method == "GET":
        return jsonify({"message": "API endpoint is working. Please use POST method to make predictions."})
    
    if model is None or scaler is None:
        return jsonify({"error": "Model or scaler not loaded properly"}), 500
    
    try:
        data = request.json
        monthly_charges = float(data["MonthlyCharges"])
        contract = data["Contract"]

        # Mã hóa Contract bằng mapping cố định
        contract_encoded = contract_mapping.get(contract)
        if contract_encoded is None:
            return jsonify({"error": "Invalid Contract value provided."}), 400

        # Tạo DataFrame đầu vào với đúng thứ tự cột như lúc train
        input_data = pd.DataFrame({
            "MonthlyCharges": [monthly_charges],
            "Contract": [contract_encoded]
        })

        # Chỉ chuẩn hóa cột MonthlyCharges (vì scaler được huấn luyện trên cột này)
        input_data["MonthlyCharges"] = scaler.transform(input_data[["MonthlyCharges"]])

        # Dự đoán
        prediction = model.predict(input_data)[0]
        return jsonify({"Churn Prediction": "Yes" if prediction == 1 else "No"})
    except Exception as e:
        return jsonify({"error": str(e)})
    








# ------------------ CHỨC NĂNG LỌC DỮ LIỆU KHÁCH HÀNG ------------------
def map_function_churn(data):
    """Ánh xạ dữ liệu với key = Churn và value là các thông tin liên quan"""
    mapped_data = []
    for _, row in data.iterrows():
        key = row["Churn"]  # Churn: Yes/No
        value = {
            "CustomerID": row["customerID"],
            "gender": row['gender'],
            "SeniorCitizen": row['SeniorCitizen'],
            "Partner": row['Partner'],
            "Dependents": row['Dependents'],
            "tenure": row["tenure"],
            "PhoneService": row['PhoneService'],
            "MultipleLines": row['MultipleLines'],
            "InternetService": row["InternetService"],
            "OnlineSecurity": row["OnlineSecurity"],
            "OnlineBackup": row["OnlineBackup"],
            "DeviceProtection": row["DeviceProtection"],
            "TechSupport": row["TechSupport"],
            "StreamingTV": row["StreamingTV"],
            "StreamingMovies": row["StreamingMovies"],
            "Contract": row["Contract"],
            "PaperlessBilling": row["PaperlessBilling"],
            "PaymentMethod": row["PaymentMethod"],
            "MonthlyCharges": row["MonthlyCharges"],
            "TotalCharges": row["TotalCharges"],
            "Churn": row["Churn"]
        }
        mapped_data.append((key, value))
    return mapped_data

def reduce_function_churn(mapped_data, churn_value):
    """Nhóm dữ liệu theo Churn ('Yes' hoặc 'No')"""
    reduced_data = [value for key, value in mapped_data if key == churn_value]
    return reduced_data

@app.route("/api/filter-churn", methods=["GET"])
def filter_churn():
    churn_value = request.args.get("churn")
    
    if not churn_value or churn_value not in ["Yes", "No"]:
        return jsonify({"error": "Tham số 'churn' là bắt buộc và phải có giá trị 'Yes' hoặc 'No'."}), 400
    try:
        try:
            df = pd.read_csv("xemfulldata.csv", delimiter=";", quotechar='"')
        except:
            try:
                df = pd.read_csv("xemfulldata.csv")
            except Exception as e:
                return jsonify({"error": f"Không thể đọc file xemfulldata.csv: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Lỗi khi đọc file: {str(e)}"}), 500
    
    required_columns = ["Churn", "customerID"]
    for col in required_columns:
        if col not in df.columns:
            return jsonify({"error": f"Cột '{col}' không tồn tại trong dữ liệu"}), 500
    
    mapped_data = map_function_churn(df)
    customers = reduce_function_churn(mapped_data, churn_value)
    
    # Xử lý NaN values
    for customer in customers:
        for key, value in customer.items():
            if pd.isna(value):
                customer[key] = "Unknown"
    
    return jsonify({"count": len(customers), "customers": customers})







# ------------------ CHỨC NĂNG SINH BIỂU ĐỒ THỐNG KÊ ------------------
def map_chart_data(file_path):
    """Đọc dữ liệu thống kê từ file CSV"""
    df = pd.read_csv(file_path, delimiter=";", quotechar='"')
    df.columns = [col.replace('"', '').strip() for col in df.columns]
    df.columns = ["Contract", "TotalCustomers", "AvgMonthlyCharges", "ChurnRate"]
    df["ChurnRate"] = df["ChurnRate"].astype(float).round(2)
    return df

@app.route("/api/churn-data", methods=["GET"])
def churn_data():
    try:
        try:
            df = map_chart_data("thongke.csv")
        except Exception as e:
            return jsonify({"error": f"Không thể đọc file thongke.csv: {str(e)}"}), 500
        return jsonify(df.to_dict(orient="records"))
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    







    
# ------------------ CHỨC NĂNG TÌM KIẾM ------------------
def map_function_search(df):
    """Chuyển đổi DataFrame thành danh sách cặp (khóa, giá trị) để xử lý MapReduce"""
    # Đầu tiên, tạo một bản đồ dựa trên Contract
    contract_groups = {}
    for _, row in df.iterrows():
        contract = row["Contract"]
        if contract not in contract_groups:
            contract_groups[contract] = []
        contract_groups[contract].append(row.to_dict())
    
    # Sau đó, chuyển đổi thành danh sách cặp (khóa, giá trị)
    mapped_data = []
    for contract, rows in contract_groups.items():
        for row in rows:
            mapped_data.append((contract, row))
    return mapped_data

def reduce_function_search(mapped_data, filters):
    """Lọc dữ liệu dựa trên các tiêu chí tìm kiếm"""
    reduced_data = []
    for key, value in mapped_data:
        # Nếu có filter theo Contract, chỉ lấy dữ liệu của Contract đó
        if filters.get("contract") and key != filters["contract"]:
            continue
        
        # Áp dụng các filter khác
        if filters.get("customerID") and filters["customerID"].lower() not in value["customerID"].lower():
            continue
        if filters.get("totalChargesMin") is not None and value.get("TotalCharges") is not None:
            if pd.to_numeric(value["TotalCharges"], errors="coerce") < filters["totalChargesMin"]:
                continue
        if filters.get("totalChargesMax") is not None and value.get("TotalCharges") is not None:
            if pd.to_numeric(value["TotalCharges"], errors="coerce") > filters["totalChargesMax"]:
                continue
        
        reduced_data.append(value)
    return reduced_data

@app.route("/api/search-customers", methods=["GET"])
def search_customers():
    """
    Tìm kiếm nhanh khách hàng dựa trên:
    - customerID (mã khách hàng)
    - totalChargesMin và totalChargesMax (khoảng tiền chi trả mỗi năm)
    - contract (loại hợp đồng)
    """
    try:
        try:
            df = pd.read_csv("xemfulldata.csv", delimiter=";", quotechar='"')
        except:
            try:
                df = pd.read_csv("xemfulldata.csv")
            except Exception as e:
                return jsonify({"error": f"Không thể đọc file xemfulldata.csv: {str(e)}"}), 500
        
        df["TotalCharges"] = pd.to_numeric(df["TotalCharges"], errors="coerce")
        
        search_filters = {
            "customerID": request.args.get("customerID", "").strip(),
            "totalChargesMin": float(request.args.get("totalChargesMin")) if request.args.get("totalChargesMin") else None,
            "totalChargesMax": float(request.args.get("totalChargesMax")) if request.args.get("totalChargesMax") else None,
            "contract": request.args.get("contract", "").strip() if request.args.get("contract", "") in ["Month-to-month", "One year", "Two year"] else None
        }
        
        # Thực hiện MapReduce
        mapped_data = map_function_search(df)
        reduced_data = reduce_function_search(mapped_data, search_filters)
        
        # Xử lý NaN values
        for item in reduced_data:
            for key, value in item.items():
                if pd.isna(value):
                    item[key] = None
        
        response = {
            "count": len(reduced_data),
            "customers": reduced_data
        }
        return jsonify(response)
    
    except ValueError as ve:
        return jsonify({"error": f"Lỗi giá trị đầu vào: {str(ve)}"}), 400
    except Exception as e:
        return jsonify({"error": f"Lỗi khi tìm kiếm: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True)