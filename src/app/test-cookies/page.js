'use client';
import { useState } from 'react';
import { API_CONFIG } from '@/config/api';

export default function TestCookies() {
  const [result, setResult] = useState(null);

  const testSimple = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/admin/test-cookies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include' // важно!
      });

      const data = await response.json();
      setResult({
        status: response.status,
        data: data,
        cookies: document.cookie
      });
    } catch (error) {
      setResult({ error: error.message });
    }
  };

  const testLogin = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          login: 'test',
          password: 'test'
        })
      });

      const data = await response.json();
      setResult({
        status: response.status,
        data: data,
        headers: Object.fromEntries(response.headers.entries()),
        cookies: document.cookie
      });
    } catch (error) {
      setResult({ error: error.message });
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Cookies</h1>
      <button onClick={testSimple} style={{ marginRight: '10px' }}>
        Test Simple Cookie
      </button>
      <button onClick={testLogin}>
        Test Login
      </button>
      {result && (
        <pre style={{ background: '#f5f5f5', padding: '15px', marginTop: '20px' }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}