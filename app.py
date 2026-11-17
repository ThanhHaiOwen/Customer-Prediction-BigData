import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
import joblib
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__, static_url_path='', static_folder='static')

# CORS configuration
allowed_origins = os.getenv(
    'ALLOWED_ORIGINS',
    'http://localhost:3000,http://localhost:3001,https://customer-prediction-big-data-sfsa.vercel.app'
).split(',')

CORS(app, resources={
    r"/*": {
        "origins": allowed_origins,
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"],
        "supports_credentials": True
    }
})

# ------------------ TỐI ƯU HÓA TỐC ĐỘ: PRELOAD & CACHE DỮ LIỆU TRONG RAM ------------------
try:
    model = joblib.load("best_logistic_model.pkl")
    scaler = joblib.load("scaler.pkl")
except Exception as e:
    print(f"Error loading model or scaler: {e}")
    model = None
    scaler = None

contract_mapping = {"Month-to-month": 0, "One year": 1, "Two year": 2}

CACHED_CUSTOMERS = []
CACHED_CHURN_MAP = {"Yes": [], "No": []}
CACHED_CHART_DATA = []


def init_data_cache():
    """Đọc và chuẩn hóa dữ liệu 1 lần duy nhất khi khởi động để phản hồi API trong < 2ms"""
    global CACHED_CUSTOMERS, CACHED_CHURN_MAP, CACHED_CHART_DATA

    # 1. Preload xemfulldata.csv
    try:
        try:
            df = pd.read_csv("xemfulldata.csv", delimiter=";", quotechar='"')
            if "customerID" not in df.columns:
                df = pd.read_csv("xemfulldata.csv")
        except Exception:
            df = pd.read_csv("xemfulldata.csv")

        df = df.fillna("Unknown")
        records = df.to_dict(orient="records")

        cleaned_list = []
        yes_list = []
        no_list = []

        for row in records:
            total_charges_raw = row.get("TotalCharges", 0)
            try:
                total_charges_num = float(total_charges_raw)
            except (ValueError, TypeError):
                total_charges_num = 0.0

            cid = row.get("customerID") or row.get("CustomerID") or "Unknown"
            churn_status = row.get("Churn", "No")

            item = {
                "CustomerID": cid,
                "customerID": cid,
                "gender": row.get("gender", "Unknown"),
                "SeniorCitizen": row.get("SeniorCitizen", 0),
                "Partner": row.get("Partner", "No"),
                "Dependents": row.get("Dependents", "No"),
                "tenure": row.get("tenure", 0),
                "PhoneService": row.get("PhoneService", "No"),
                "MultipleLines": row.get("MultipleLines", "No"),
                "InternetService": row.get("InternetService", "No"),
                "OnlineSecurity": row.get("OnlineSecurity", "No"),
                "OnlineBackup": row.get("OnlineBackup", "No"),
                "DeviceProtection": row.get("DeviceProtection", "No"),
                "TechSupport": row.get("TechSupport", "No"),
                "StreamingTV": row.get("StreamingTV", "No"),
                "StreamingMovies": row.get("StreamingMovies", "No"),
                "Contract": row.get("Contract", "Month-to-month"),
                "PaperlessBilling": row.get("PaperlessBilling", "No"),
                "PaymentMethod": row.get("PaymentMethod", "Unknown"),
                "MonthlyCharges": row.get("MonthlyCharges", 0.0),
                "TotalCharges": row.get("TotalCharges", 0.0),
                "_totalChargesNum": total_charges_num,
                "Churn": churn_status
            }
            cleaned_list.append(item)
            if churn_status == "Yes":
                yes_list.append(item)
            elif churn_status == "No":
                no_list.append(item)

        CACHED_CUSTOMERS = cleaned_list
        CACHED_CHURN_MAP["Yes"] = yes_list
        CACHED_CHURN_MAP["No"] = no_list
        print(f"[Cache] Loaded {len(CACHED_CUSTOMERS)} customer records into memory.")
    except Exception as e:
        print(f"[Cache] Error preloading xemfulldata.csv: {e}")

    # 2. Preload thongke.csv
    try:
        df_chart = pd.read_csv("thongke.csv", delimiter=";", quotechar='"')
        df_chart.columns = [col.replace('"', '').strip() for col in df_chart.columns]
        df_chart.columns = ["Contract", "TotalCustomers", "AvgMonthlyCharges", "ChurnRate"]
        df_chart["ChurnRate"] = df_chart["ChurnRate"].astype(float).round(2)
        df_chart["AvgMonthlyCharges"] = df_chart["AvgMonthlyCharges"].astype(float).round(2)
        CACHED_CHART_DATA = df_chart.to_dict(orient="records")
        print(f"[Cache] Loaded {len(CACHED_CHART_DATA)} chart summary rows.")
    except Exception as e:
        print(f"[Cache] Error preloading thongke.csv: {e}")


# Khởi tạo cache ngay khi nạp module
init_data_cache()


@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "cached_customers": len(CACHED_CUSTOMERS),
        "message": "Server is running with in-memory cache enabled"
    })


def build_copilot_recommendation(monthly_charges, contract, customer_id, tenure=8, internet_service="Fiber optic"):
    """Hàm nội bộ tạo kịch bản giữ chân nhanh gọn, không tốn thêm vòng lặp mạng"""
    discount_amount = 12 if monthly_charges >= 75 else (8 if monthly_charges >= 50 else 5)
    new_price = max(15.0, monthly_charges - discount_amount)
    annual_saved = monthly_charges * 12
    net_retained = new_price * 12

    risk_summary = (
        f"Hồ sơ {customer_id} đang sử dụng hợp đồng '{contract}' với mức cước ${monthly_charges:.1f}/tháng "
        f"(thời gian gắn bó: {tenure} tháng, hạ tầng: {internet_service}). "
        f"Phân khúc này có xác suất rời mạng trung bình 42.7% nếu không chuyển đổi sang hợp đồng kỳ hạn. "
        f"Can thiệp giữ chân giúp bảo vệ dòng doanh thu định kỳ ${annual_saved:,.0f} USD/năm."
    )

    recommended_offer = {
        "title": "Chính Sách Chuyển Đổi Kỳ Hạn 12 Tháng (Executive Retention)",
        "discount": f"Ưu đãi định mức ${discount_amount}/tháng trong 6 kỳ cước (Cước sau ưu đãi: ${new_price:.1f}/tháng)",
        "perk": "Miễn phí gói Bảo mật Đường truyền & Hỗ trợ Kỹ thuật Ưu tiên (Priority SLA)",
        "financial_impact": f"Doanh thu giữ lại ròng (Net ARR): ${net_retained:,.0f} USD/năm • Chi phí chiến dịch: ${discount_amount * 6} USD"
    }

    telesales_script = (
        f"1. MỞ ĐẦU & GHI NHẬN:\n"
        f"\"Chào Anh/Chị, em liên hệ từ Bộ phận Quản lý Tài khoản Khách hàng của hệ thống viễn thông. "
        f"Hiện tại mã thuê bao {customer_id} của mình đã đồng hành {tenure} tháng trên hạ tầng {internet_service}.\"\n\n"
        f"2. ĐỀ XUẤT GIÁ TRỊ & ƯU ĐÃI TÀI CHÍNH:\n"
        f"\"Qua rà soát định kỳ, mức cước theo tháng hiện tại của Anh/Chị là ${monthly_charges:.1f}/tháng. "
        f"Trong kỳ này, hệ thống áp dụng chính sách tối ưu chi phí cho khách hàng chuyển sang kỳ hạn ổn định 12 tháng:\n"
        f"  • Giảm trực tiếp ${discount_amount}/tháng trên hóa đơn (chỉ còn ${new_price:.1f}/tháng).\n"
        f"  • Bổ sung miễn phí gói Hỗ trợ Kỹ thuật Ưu tiên & Bảo vệ đường truyền.\"\n\n"
        f"3. CHỐT CAM KẾT:\n"
        f"\"Việc chuyển đổi không phát sinh phí lắp đặt và áp dụng giảm cước ngay từ kỳ hóa đơn tới. "
        f"Em xin phép xác nhận kích hoạt ưu đãi này cho mã thuê bao {customer_id} của mình ngay hôm nay nhé?\""
    )

    email_draft = (
        f"Tiêu đề: [Thông báo Quyền lợi] Đề xuất tối ưu cước phí cho Mã thuê bao {customer_id}\n\n"
        f"Kính gửi Quý khách hàng ({customer_id}),\n\n"
        f"Cảm ơn Quý khách đã sử dụng dịch vụ {internet_service} của chúng tôi trong suốt {tenure} tháng qua.\n\n"
        f"Nhằm tối ưu hóa chi phí vận hành và nâng cao chất lượng đường truyền cho khách hàng hiện hữu, "
        f"chúng tôi trân trọng gửi tới Quý khách phương án nâng cấp kỳ hạn hợp đồng như sau:\n\n"
        f"• Cước phí điều chỉnh: ${new_price:.1f}/tháng (Tiết kiệm ${discount_amount}/tháng so với mức ${monthly_charges:.1f}/tháng hiện tại)\n"
        f"• Đặc quyền kỹ thuật: Miễn phí 06 tháng dịch vụ TechSupport SLA & Online Security\n"
        f"• Điều kiện áp dụng: Chuyển đổi từ hợp đồng '{contract}' sang kỳ hạn cam kết 12 tháng\n\n"
        f"Quý khách có thể phản hồi trực tiếp email này với nội dung \"XÁC NHẬN\" để hệ thống cập nhật tự động từ kỳ cước tiếp theo.\n\n"
        f"Trân trọng,\n"
        f"Phòng Quản Trị Trải Nghiệm Khách Hàng"
    )

    objection_handling = [
        f"Khách hàng đắn đo về giá cước: Nhấn mạnh tổng mức tiết kiệm ${discount_amount * 6} USD và cam kết cố định biểu phí suốt 12 tháng.",
        "Khách hàng ngại ràng buộc hợp đồng 1 năm: Áp dụng điều khoản linh hoạt cho phép bảo lưu hoặc chuyển nhượng địa điểm lắp đặt miễn phí.",
        f"Khách hàng phản ánh chất lượng {internet_service}: Tạo phiếu kỹ thuật ưu tiên kiểm tra suy hao quang học và nâng cấp băng thông dự phòng."
    ]

    return {
        "status": "success",
        "customer_id": customer_id,
        "risk_summary": risk_summary,
        "recommended_offer": recommended_offer,
        "telesales_script": telesales_script,
        "email_draft": email_draft,
        "objection_handling": objection_handling
    }


@app.route("/predict", methods=["POST", "GET"])
def predict():
    if request.method == "GET":
        return jsonify({"message": "API endpoint is working. Please use POST method to make predictions."})

    if model is None or scaler is None:
        return jsonify({"error": "Model or scaler not loaded properly"}), 500

    try:
        data = request.json or {}
        monthly_charges = float(data["MonthlyCharges"])
        contract = data["Contract"]
        customer_id = data.get("CustomerID", "KH-7892")
        tenure = int(data.get("Tenure", 8))
        internet_service = data.get("InternetService", "Fiber optic")

        contract_encoded = contract_mapping.get(contract)
        if contract_encoded is None:
            return jsonify({"error": "Invalid Contract value provided."}), 400

        input_data = pd.DataFrame({
            "MonthlyCharges": [monthly_charges],
            "Contract": [contract_encoded]
        })
        input_data["MonthlyCharges"] = scaler.transform(input_data[["MonthlyCharges"]])

        prediction = int(model.predict(input_data)[0])
        probabilities = model.predict_proba(input_data)[0]
        churn_prob = float(probabilities[1])
        risk_score = round(churn_prob * 100, 1)

        if risk_score >= 70:
            risk_level = "High"
        elif risk_score >= 40:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        risk_factors = []
        if contract == "Month-to-month":
            risk_factors.append("Hợp đồng thanh toán theo tháng — Không có cam kết giữ chân (Tỷ lệ rời mạng trung bình phân khúc: 42.7%)")
        elif contract == "One year":
            risk_factors.append("Hợp đồng kỳ hạn 1 năm — Mức độ ổn định trung bình (Tỷ lệ rời mạng phân khúc: 11.3%)")
        elif contract == "Two year":
            risk_factors.append("Hợp đồng kỳ hạn 2 năm — Cam kết dài hạn vững chắc (Tỷ lệ rời mạng chỉ 2.8%)")

        if monthly_charges >= 70:
            risk_factors.append(f"Cước phí hàng tháng cao (${monthly_charges:.1f}/tháng) — Vượt ngưỡng nhạy cảm giá trung bình ($64.76)")
        elif monthly_charges <= 30:
            risk_factors.append(f"Cước phí cơ bản (${monthly_charges:.1f}/tháng) — Biên độ rủi ro tài chính thấp")

        if tenure <= 6:
            risk_factors.append(f"Thời gian gắn bó ngắn ({tenure} tháng) — Giai đoạn nhạy cảm nhất trong vòng đời thuê bao")

        # Trả về luôn gói Copilot trong 1 lần gọi để giảm 50% độ trễ mạng
        copilot_data = build_copilot_recommendation(
            monthly_charges=monthly_charges,
            contract=contract,
            customer_id=customer_id,
            tenure=tenure,
            internet_service=internet_service
        )

        return jsonify({
            "Churn Prediction": "Yes" if prediction == 1 else "No",
            "prediction": "Yes" if prediction == 1 else "No",
            "churn_probability": round(churn_prob, 4),
            "risk_score": risk_score,
            "risk_level": risk_level,
            "risk_factors": risk_factors,
            "copilot": copilot_data
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400


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

        result = build_copilot_recommendation(
            monthly_charges=monthly_charges,
            contract=contract,
            customer_id=customer_id,
            tenure=tenure,
            internet_service=internet_service
        )
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/filter-churn", methods=["GET"])
def filter_churn():
    churn_value = request.args.get("churn")
    if not churn_value or churn_value not in ["Yes", "No"]:
        return jsonify({"error": "Tham số 'churn' là bắt buộc và phải có giá trị 'Yes' hoặc 'No'."}), 400

    if not CACHED_CUSTOMERS:
        init_data_cache()

    customers = CACHED_CHURN_MAP.get(churn_value, [])
    # Cho phép giới hạn số lượng trả về nếu client yêu cầu để tăng tốc tải
    limit = request.args.get("limit", type=int)
    if limit and limit > 0:
        return jsonify({"count": len(customers), "customers": customers[:limit]})

    return jsonify({"count": len(customers), "customers": customers})


@app.route("/api/churn-data", methods=["GET"])
def churn_data():
    if not CACHED_CHART_DATA:
        init_data_cache()
    return jsonify(CACHED_CHART_DATA)


@app.route("/api/search-customers", methods=["GET"])
def search_customers():
    try:
        if not CACHED_CUSTOMERS:
            init_data_cache()

        cid_query = request.args.get("customerID", "").strip().lower()
        min_charges = float(request.args.get("totalChargesMin")) if request.args.get("totalChargesMin") else None
        max_charges = float(request.args.get("totalChargesMax")) if request.args.get("totalChargesMax") else None
        contract_filter = request.args.get("contract", "").strip()
        if contract_filter not in ["Month-to-month", "One year", "Two year"]:
            contract_filter = None

        limit = request.args.get("limit", type=int)

        reduced_data = []
        for item in CACHED_CUSTOMERS:
            if contract_filter and item["Contract"] != contract_filter:
                continue
            if cid_query and cid_query not in str(item["CustomerID"]).lower():
                continue
            if min_charges is not None and item["_totalChargesNum"] < min_charges:
                continue
            if max_charges is not None and item["_totalChargesNum"] > max_charges:
                continue
            reduced_data.append(item)

        total_count = len(reduced_data)
        if limit and limit > 0:
            reduced_data = reduced_data[:limit]

        return jsonify({
            "count": total_count,
            "customers": reduced_data
        })
    except ValueError as ve:
        return jsonify({"error": f"Lỗi giá trị đầu vào: {str(ve)}"}), 400
    except Exception as e:
        return jsonify({"error": f"Lỗi khi tìm kiếm: {str(e)}"}), 500


if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
