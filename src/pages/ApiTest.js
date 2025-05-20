// src/pages/ApiTest.js
import React, { useState, useEffect } from 'react';
import { testApiConnection } from '../services/api';

const ApiTest = () => {
  const [apiStatus, setApiStatus] = useState({
    loading: true,
    success: null,
    data: null,
    error: null
  });

  const [manualEndpoint, setManualEndpoint] = useState('/debug');
  const [manualResponse, setManualResponse] = useState(null);
  const [manualLoading, setManualLoading] = useState(false);
  const [manualError, setManualError] = useState(null);

  useEffect(() => {
    const checkApi = async () => {
      try {
        const result = await testApiConnection();
        setApiStatus({
          loading: false,
          success: result.success,
          data: result.data,
          error: result.error
        });
      } catch (error) {
        setApiStatus({
          loading: false,
          success: false,
          data: null,
          error: {
            message: error.message,
          }
        });
      }
    };

    checkApi();
  }, []);

  const testManualEndpoint = async () => {
    setManualLoading(true);
    setManualResponse(null);
    setManualError(null);

    try {
      const { default: api } = await import('../services/api');
      const response = await api.get(manualEndpoint);
      setManualResponse(response.data);
    } catch (error) {
      setManualError({
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
    } finally {
      setManualLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">API Connection Test</h1>
      
      <div className="mb-8 bg-gray-100 p-4 rounded">
        <h2 className="text-xl font-semibold mb-2">Automatic API Test</h2>
        {apiStatus.loading ? (
          <p>Testing API connection...</p>
        ) : apiStatus.success ? (
          <div>
            <div className="flex items-center mb-2">
              <span className="bg-green-500 text-white px-2 py-1 rounded mr-2">SUCCESS</span>
              <span>API is working properly!</span>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold">Response Data:</h3>
              <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(apiStatus.data, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center mb-2">
              <span className="bg-red-500 text-white px-2 py-1 rounded mr-2">FAILED</span>
              <span>Could not connect to API</span>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold">Error:</h3>
              <pre className="bg-gray-800 text-red-400 p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(apiStatus.error, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

      <div className="mb-8 bg-gray-100 p-4 rounded">
        <h2 className="text-xl font-semibold mb-2">Test Custom Endpoint</h2>
        <div className="flex mb-4">
          <input
            type="text"
            value={manualEndpoint}
            onChange={(e) => setManualEndpoint(e.target.value)}
            className="flex-grow p-2 border rounded"
            placeholder="/users"
          />
          <button
            onClick={testManualEndpoint}
            disabled={manualLoading}
            className="ml-2 bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
          >
            {manualLoading ? 'Testing...' : 'Test'}
          </button>
        </div>

        {manualLoading ? (
          <p>Testing endpoint...</p>
        ) : manualResponse ? (
          <div>
            <h3 className="font-semibold">Response:</h3>
            <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(manualResponse, null, 2)}
            </pre>
          </div>
        ) : manualError ? (
          <div>
            <h3 className="font-semibold">Error:</h3>
            <pre className="bg-gray-800 text-red-400 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(manualError, null, 2)}
            </pre>
          </div>
        ) : null}
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-xl font-semibold mb-2">API Configuration</h2>
        <table className="w-full border-collapse">
          <tbody>
            <tr className="border-b">
              <td className="py-2 font-medium">Base URL:</td>
              <td>{window.location.protocol}//{window.location.host}/api</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 font-medium">Environment:</td>
              <td>{process.env.NODE_ENV}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 font-medium">Debug Endpoint:</td>
              <td>/api/debug</td>
            </tr>
            <tr>
              <td className="py-2 font-medium">Health Check:</td>
              <td>/api/health</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApiTest;