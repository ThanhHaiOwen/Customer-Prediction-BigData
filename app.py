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
allowed_origins = os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:3001,https://customer-prediction-big-data-sfsa.vercel.app').split(',')

# Debug: Print allowed origins
print(f"Allowed origins: {allowed_origins}")

CORS(app, resources={
    r"/*": {
        "origins": allowed_origins,
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"],
        "supports_credentials": True
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

        # Dự đoán phân lớp và xác suất
        prediction = int(model.predict(input_data)[0])
        probabilities = model.predict_proba(input_data)[0]
        churn_prob = float(probabilities[1])
        risk_score = round(churn_prob * 100, 1)

        # Phân loại cấp độ rủi ro
        if risk_score >= 70:
            risk_level = "High"
        elif risk_score >= 40:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        # Phân tích nhân tố rủi ro chính
        risk_factors = []
        if contract == "Month-to-month":
            risk_factors.append("Hợp đồng theo tháng (Tỷ lệ rời bỏ trung bình 42.7%)")
        if monthly_charges >= 70:
            risk_factors.append(f"Cước phí hàng tháng cao (${monthly_charges:.1f}/tháng - Nhạy cảm về giá)")
        elif monthly_charges <= 30:
            risk_factors.append(f"Gói cước cơ bản (${monthly_charges:.1f}/tháng - Nguy cơ chuyển dịch)")
        if contract == "Two year":
            risk_factors.append("Hợp đồng 2 năm (Gắn kết bền vững, tỷ lệ churn chỉ 2.8%)")

        return jsonify({
            "Churn Prediction": "Yes" if prediction == 1 else "No",
            "prediction": "Yes" if prediction == 1 else "No",
            "churn_probability": round(churn_prob, 4),
            "risk_score": risk_score,
            "risk_level": risk_level,
            "risk_factors": risk_factors
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ------------------ CHỨC NĂNG AI RETENTION COPILOT ------------------
@app.route("/api/ai-retention-copilot", methods=["POST", "OPTIONS"])
def ai_retention_copilot():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    try:
        data = request.json or {}
        monthly_charges = float(data.get("MonthlyCharges", 75.0))
        contract = data.get("Contract", "Month-to-month")
        customer_id = data.get("CustomerID", "KH-VIP")
        tenure = int(data.get("Tenure", 8))
        internet_service = data.get("InternetService", "Fiber optic")

        # Phân tích đề xuất bằng AI Logic
        discount_amount = 10 if monthly_charges >= 60 else 5
        new_price = monthly_charges - discount_amount
        annual_saved = monthly_charges * 12
        net_retained = (monthly_charges - discount_amount) * 12

        # 1. Tóm tắt rủi ro
        risk_summary = (
            f"Khách hàng {customer_id} đang chi trả ${monthly_charges:.1f}/tháng với hợp đồng '{contract}'. "
            f"Nhóm hợp đồng này có tỷ lệ rời mạng lên tới 42.7% do không có ràng buộc cam kết. "
            f"Cần can thiệp ngay để bảo vệ dòng doanh thu quy năm ${annual_saved:,.0f} USD."
        )

        # 2. Gói ưu đãi giữ chân đề xuất
        recommended_offer = {
            "title": "Gói Nâng Cấp Cam Kết 1 Năm (Annual Loyalty Boost)",
            "discount": f"Giảm trực tiếp ${discount_amount}/tháng trong 6 tháng (Cước mới: ${new_price:.1f}/tháng)",
            "perk": "Miễn phí 6 tháng dịch vụ Hỗ trợ Kỹ thuật VIP 24/7 (TechSupport)",
            "financial_impact": f"Bảo toàn doanh thu thuần: ${net_retained:,.0f} USD/năm (Chi phí ưu đãi: ${discount_amount * 6} USD)"
        }

        # 3. Kịch bản gọi điện Telesales (Call Script)
        telesales_script = (
            f"DẠ CHÀO ANH/CHỊ [TÊN KHÁCH HÀNG],\n\n"
            f"Em là [Tên nhân viên] từ bộ phận Chăm sóc Khách hàng Đặc quyền của [Tên Công ty].\n"
            f"Nhân dịp tri ân khách hàng đã đồng hành cùng dịch vụ mạng trong suốt thời gian qua, "
            f"hệ thống của em ghi nhận anh/chị là một trong những khách hàng ưu tiên được nhận gói "
            f"nâng cấp đặc biệt trong tháng này:\n\n"
            f"• Giảm ngay ${discount_amount}/tháng cho cước thuê bao hiện tại (từ ${monthly_charges:.1f} xuống chỉ còn ${new_price:.1f}/tháng).\n"
            f"• Tặng kèm gói Hỗ trợ Kỹ thuật & Bảo vệ đường truyền VIP 24/7 hoàn toàn miễn phí.\n\n"
            f"Để kích hoạt ưu đãi này, em xin phép hỗ trợ chuyển đổi gói cước sang cam kết 12 tháng "
            f"giúp anh/chị cố định mức cước tốt nhất mà không sợ tăng giá. Anh/chị đồng ý để em kích hoạt luôn từ hôm nay nhé?"
        )

        # 4. Mẫu Email giữ chân
        email_draft = (
            f"Kính gửi Quý khách hàng {customer_id},\n\n"
            f"Lời đầu tiên, chúng tôi xin chân thành cảm ơn Quý khách đã tin tưởng và đồng hành cùng dịch vụ viễn thông của chúng tôi.\n\n"
            f"Chúng tôi trân trọng gửi tới Quý khách chương trình TRI ÂN ĐẶC QUYỀN:\n"
            f"- Mức cước ưu đãi mới: ${new_price:.1f}/tháng (Tiết kiệm ${discount_amount}/tháng so với mức cước hiện tại).\n"
            f"- Miễn phí 6 tháng dịch vụ Tech Support & Bảo vệ Thiết bị trực tuyến.\n\n"
            f"Chương trình áp dụng khi Quý khách xác nhận nâng cấp kỳ hạn hợp đồng 12 tháng trước ngày 30 hàng tháng.\n\n"
            f"Để kích hoạt, Quý khách chỉ cần phản hồi lại email này hoặc liên hệ hotline chăm sóc khách hàng 24/7.\n\n"
            f"Trân trọng,\n"
            f"Đội ngũ Chăm Sóc Khách Hàng"
        )

        # 5. Mẹo đàm phán khi khách hàng từ chối
        objection_handling = [
            f"Nếu khách chê cước đắt: Nhấn mạnh gói ưu đãi giúp tiết kiệm ${discount_amount * 6} USD trong 6 tháng đầu và cam kết không tăng giá.",
            "Nếu khách ngại cam kết dài hạn: Đưa ra cam kết trải nghiệm 30 ngày dùng thử miễn phí, hoàn tiền 100% nếu không hài lòng.",
            "Nếu khách phàn nàn sự cố mạng: Cam kết cử kỹ thuật viên kiểm tra modem trong vòng 24 giờ kèm tặng voucher cước."
        ]

        return jsonify({
            "status": "success",
            "customer_id": customer_id,
            "risk_summary": risk_summary,
            "recommended_offer": recommended_offer,
            "telesales_script": telesales_script,
            "email_draft": email_draft,
            "objection_handling": objection_handling
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    








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
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)