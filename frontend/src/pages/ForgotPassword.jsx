import React, { useState } from "react";
import axios from "axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      // Gọi API backend với endpoint đúng
      const response = await axios.post("http://localhost:3001/api/auth/forgot-password", { 
        email 
      });
      
      // Thành công
      setMessage("✅ Gửi thành công! Kiểm tra email để nhận token reset mật khẩu.");
      setEmail(""); // Clear form
      
    } catch (error) {
      // Thất bại
      console.error("Forgot password error:", error);
      setMessage("❌ Không thể gửi được! Vui lòng kiểm tra email và thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>🔐 Quên mật khẩu</h2>
      <p>Nhập email để nhận token reset mật khẩu</p>
      
      <form onSubmit={handleSubmit} style={styles.form}>
        <input 
          type="email" 
          placeholder="Nhập địa chỉ email của bạn" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required 
          style={styles.input}
          disabled={isLoading}
        />
        <button 
          type="submit" 
          style={{...styles.button, opacity: isLoading ? 0.6 : 1}}
          disabled={isLoading}
        >
          {isLoading ? "Đang gửi..." : "🚀 Gửi token reset"}
        </button>
      </form>

      {/* Thông báo kết quả */}
      {message && (
        <div style={{
          ...styles.message,
          color: message.includes("✅") ? "#28a745" : "#dc3545",
          backgroundColor: message.includes("✅") ? "#d4edda" : "#f8d7da",
          borderColor: message.includes("✅") ? "#c3e6cb" : "#f5c6cb"
        }}>
          {message}
        </div>
      )}

      {/* Hướng dẫn test bằng Postman */}
      <div style={styles.testInfo}>
        <h3>🧪 Test bằng Postman:</h3>
        <div style={styles.codeBlock}>
          <strong>POST</strong> http://localhost:3001/api/auth/forgot-password<br/>
          <strong>Body (JSON):</strong><br/>
          {`{
  "email": "test@example.com"
}`}
        </div>
        <p><strong>Token sẽ được trả về trong response để test.</strong></p>
      </div>
    </div>
  );
}

const styles = {
  container: { 
    maxWidth: "500px", 
    margin: "20px auto", 
    padding: "20px", 
    border: "1px solid #ddd", 
    borderRadius: "8px" 
  },
  form: { 
    marginBottom: "20px" 
  },
  input: { 
    display: "block", 
    width: "100%", 
    padding: "12px", 
    margin: "10px 0", 
    border: "1px solid #ddd", 
    borderRadius: "4px",
    fontSize: "16px"
  },
  button: { 
    width: "100%",
    padding: "12px", 
    backgroundColor: "#007bff", 
    color: "#fff", 
    border: "none", 
    borderRadius: "4px",
    fontSize: "16px",
    cursor: "pointer"
  },
  message: {
    padding: "12px",
    margin: "15px 0",
    border: "1px solid",
    borderRadius: "4px",
    fontSize: "14px"
  },
  testInfo: {
    marginTop: "30px",
    padding: "15px",
    backgroundColor: "#f8f9fa",
    borderRadius: "4px",
    fontSize: "14px"
  },
  codeBlock: {
    backgroundColor: "#e9ecef",
    padding: "10px",
    borderRadius: "4px",
    fontFamily: "monospace",
    margin: "10px 0"
  }
};
