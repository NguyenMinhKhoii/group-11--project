import React, { useState } from 'react';
import axios from 'axios';

export default function TestRefresh() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testRefreshAPI = async () => {
    setLoading(true);
    try {
      // Lấy refresh token thật từ localStorage
      const realRefreshToken = localStorage.getItem('refresh_token');
      const tokenToUse = realRefreshToken || 'dummy_refresh_token';
      
      const response = await axios.post('http://localhost:3001/api/auth/refresh', {
        refreshToken: tokenToUse
      });
      setResult(JSON.stringify(response.data, null, 2));
    } catch (error) {
      setResult(`Error: ${error.response?.data?.message || error.message}`);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>🔄 Test Refresh Token API</h2>
      
      <button 
        onClick={testRefreshAPI} 
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        {loading ? 'Testing...' : 'Test /api/auth/refresh'}
      </button>

      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '5px',
        fontFamily: 'monospace'
      }}>
        <strong>Response:</strong>
        <pre>{result || 'Click button to test'}</pre>
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <strong>API Details:</strong><br/>
        • Method: POST<br/>
        • URL: http://localhost:3001/api/auth/refresh<br/>
        • Body: {`{"refreshToken": "[from localStorage or dummy]"}`}
      </div>
    </div>
  );
}