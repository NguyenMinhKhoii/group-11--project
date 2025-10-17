import React from "react";

export default function ShareData() {
  return (
    <div style={{padding: "20px", maxWidth: "800px", margin: "0 auto"}}>
      <h1>📤 Share Data với Nhóm</h1>
      
      <div style={{marginBottom: "30px", padding: "20px", backgroundColor: "#f8f9fa", borderRadius: "8px"}}>
        <h2>🔗 API Endpoints để bạn nhóm lấy data:</h2>
        
        <h3>📋 Danh sách Users:</h3>
        <div style={{backgroundColor: "#e9ecef", padding: "10px", fontFamily: "monospace", borderRadius: "4px"}}>
          GET http://localhost:3001/api/users
        </div>
        
        <h3>📨 Messages đã share:</h3>
        <div style={{backgroundColor: "#e9ecef", padding: "10px", fontFamily: "monospace", borderRadius: "4px"}}>
          GET http://localhost:3001/api/shared-messages
        </div>
        
        <h3>🚀 Gửi message/token:</h3>
        <div style={{backgroundColor: "#e9ecef", padding: "10px", fontFamily: "monospace", borderRadius: "4px"}}>
          POST http://localhost:3001/api/share-message<br/>
          Body: {`{`}<br/>
          &nbsp;&nbsp;"type": "token",<br/>
          &nbsp;&nbsp;"content": "your-token-here",<br/>
          &nbsp;&nbsp;"from": "SV2",<br/>
          &nbsp;&nbsp;"to": "all"<br/>
          {`}`}
        </div>
      </div>

      <div style={{marginBottom: "30px", padding: "20px", backgroundColor: "#d1ecf1", borderRadius: "8px"}}>
        <h2>🌐 Frontend URLs:</h2>
        <ul>
          <li><strong>Trang chính:</strong> http://localhost:5173/</li>
          <li><strong>Đăng nhập:</strong> http://localhost:5173/login</li>
          <li><strong>Đăng ký:</strong> http://localhost:5173/signup</li>
          <li><strong>Quên mật khẩu:</strong> http://localhost:5173/forgot-password</li>
          <li><strong>Quản lý:</strong> http://localhost:5173/admin</li>
        </ul>
      </div>

      <div style={{padding: "20px", backgroundColor: "#d4edda", borderRadius: "8px"}}>
        <h2>📁 GitHub Repository:</h2>
        <div style={{fontSize: "16px", fontFamily: "monospace"}}>
          <a href="https://github.com/NguyenMinhKhoii/group-11--project.git" target="_blank" rel="noopener noreferrer">
            https://github.com/NguyenMinhKhoii/group-11--project.git
          </a>
        </div>
        
        <h3>📖 Clone project:</h3>
        <div style={{backgroundColor: "#c3e6cb", padding: "10px", fontFamily: "monospace", borderRadius: "4px"}}>
          git clone https://github.com/NguyenMinhKhoii/group-11--project.git
        </div>
      </div>

      <div style={{marginTop: "30px", padding: "20px", backgroundColor: "#fff3cd", borderRadius: "8px"}}>
        <h2>⚠️ Lưu ý cho bạn nhóm:</h2>
        <ul>
          <li>Đảm bảo backend server chạy trên port 3001</li>
          <li>Frontend chạy trên port 5173</li>
          <li>Sử dụng Postman hoặc curl để test API</li>
          <li>Tất cả API đều trả về JSON format</li>
          <li>Token reset có thời hạn 30 phút</li>
        </ul>
      </div>
    </div>
  );
}