import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

// Thêm CSS inline
const styles = {
  container: {
    padding: '24px',
    backgroundColor: '#faf8f5',
    minHeight: '100vh',
  },
  header: {
    textAlign: 'center',
    marginBottom: '48px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '18px',
    color: '#666',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s ease',
    cursor: 'pointer',
  },
  cardHover: {
    transform: 'scale(1.05)',
  },
  cardHeader: {
    height: '8px',
  },
  cardBody: {
    padding: '24px',
  },
  cardTitle: {
    fontSize: '22px',
    fontWeight: '600',
    marginBottom: '8px',
  },
  cardDescription: {
    color: '#666',
    marginBottom: '16px',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shortcut: {
    backgroundColor: '#f3f3f3',
    color: '#555',
    padding: '4px 12px',
    borderRadius: '16px',
    fontSize: '14px',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    borderRadius: '50%',
    padding: '8px',
  },
  footer: {
    marginTop: '48px',
    textAlign: 'center',
    color: '#777',
  },
};

const HomePage = () => {
  const navigate = useNavigate();

  // Định nghĩa các cards cho các trang
  const pages = [
    {
      title: "Dự đoán Churn",
      description: "Nhập thông tin để dự đoán khả năng khách hàng rời đi",
      path: "/prediction",
      color: "#3b82f6", // blue-500
      shortcut: "Ctrl+P",
      bgColor: "#dbeafe", // light blue bg
      icon: "📊",
    },
    {
      title: "Lọc dữ liệu",
      description: "Lọc và hiển thị dữ liệu khách hàng theo Churn status",
      path: "/filter",
      color: "#22c55e", // green-500
      shortcut: "Ctrl+Shift+F",
      bgColor: "#dcfce7", // light green bg
      icon: "🔍",
    },
    {
      title: "Tìm kiếm",
      description: "Tìm kiếm thông tin khách hàng theo nhiều tiêu chí",
      path: "/search",
      color: "#a855f7", // purple-500
      shortcut: "Ctrl+Shift+S",
      bgColor: "#f3e8ff", // light purple bg
      icon: "🔎",
    },
    {
      title: "Phân tích dữ liệu",
      description: "Xem biểu đồ và thống kê về dữ liệu khách hàng",
      path: "/chart",
      color: "#f59e0b", // amber-500
      shortcut: "Ctrl+Shift+C",
      bgColor: "#fef3c7", // light amber bg
      icon: "📈",
    },
  ];

  // Thiết lập phím tắt
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey) {
        if (e.key.toLowerCase() === "f") {
          e.preventDefault();
          navigate("/filter");
        } else if (e.key.toLowerCase() === "s") {
          e.preventDefault();
          navigate("/search");
        } else if (e.key.toLowerCase() === "c") {
          e.preventDefault();
          navigate("/chart");
        }
      } else if (e.ctrlKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        navigate("/prediction");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Customer Churn Analysis</h1>
        <p style={styles.subtitle}>Phân tích và dự đoán khách hàng rời đi</p>
      </header>

      <div style={styles.grid}>
        {pages.map((page, index) => (
          <div 
            key={index} 
            style={styles.card}
            onClick={() => navigate(page.path)}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{...styles.cardHeader, backgroundColor: page.color}}></div>
            <div style={styles.cardBody}>
              <div style={{fontSize: '36px', marginBottom: '8px'}}>{page.icon}</div>
              <h2 style={styles.cardTitle}>{page.title}</h2>
              <p style={styles.cardDescription}>{page.description}</p>
              <div style={styles.cardFooter}>
                <span style={styles.shortcut}>
                  {page.shortcut}
                </span>
                <button 
                  style={{...styles.button, backgroundColor: page.color}}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(page.path);
                  }}
                >
                  →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <footer style={styles.footer}>
        <p>Nhấn các phím tắt để di chuyển nhanh giữa các trang</p>
        <p style={{marginTop: '8px'}}>© 2025 Customer Churn Analysis Tool</p>
      </footer>
    </div>
  );
};

export default HomePage;