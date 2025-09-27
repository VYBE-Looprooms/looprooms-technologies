"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuthDebug() {
  const [authState, setAuthState] = useState({
    userToken: null as string | null,
    userInfo: null as string | null,
    adminToken: null as string | null,
    adminInfo: null as string | null,
  });
  const [backendStatus, setBackendStatus] = useState('checking...');

  const refreshAuthState = () => {
    if (typeof window !== 'undefined') {
      setAuthState({
        userToken: localStorage.getItem('userToken'),
        userInfo: localStorage.getItem('userInfo'),
        adminToken: localStorage.getItem('adminToken'),
        adminInfo: localStorage.getItem('adminInfo'),
      });
    }
  };

  useEffect(() => {
    refreshAuthState();
    checkBackend();
  }, []);

  const checkBackend = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/health`);
      if (response.ok) {
        const data = await response.json();
        setBackendStatus(`✅ Connected (${data.status})`);
      } else {
        setBackendStatus('❌ Backend error');
      }
    } catch (error) {
      setBackendStatus('❌ Cannot connect');
    }
  };

  const clearAllAuth = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    refreshAuthState();
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Authentication Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="mb-4">
          <h3 className="font-semibold">Backend Status</h3>
          <p className="text-sm">{backendStatus}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold">User Auth</h3>
            <p className="text-sm">Token: {authState.userToken ? '✅ Present' : '❌ Missing'}</p>
            <p className="text-sm">Info: {authState.userInfo ? '✅ Present' : '❌ Missing'}</p>
            {authState.userInfo && (
              <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto">
                {JSON.stringify(JSON.parse(authState.userInfo), null, 2)}
              </pre>
            )}
          </div>
          
          <div>
            <h3 className="font-semibold">Admin Auth</h3>
            <p className="text-sm">Token: {authState.adminToken ? '✅ Present' : '❌ Missing'}</p>
            <p className="text-sm">Info: {authState.adminInfo ? '✅ Present' : '❌ Missing'}</p>
            {authState.adminInfo && (
              <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto">
                {JSON.stringify(JSON.parse(authState.adminInfo), null, 2)}
              </pre>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button onClick={refreshAuthState} variant="outline">
            Refresh
          </Button>
          <Button onClick={checkBackend} variant="outline">
            Test Backend
          </Button>
          <Button onClick={clearAllAuth} variant="destructive">
            Clear All Auth
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}