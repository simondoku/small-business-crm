// src/pages/ApiTest.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ApiTest = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [directUrl, setDirectUrl] = useState('https://businesscrm-hkz52byai-simons-projects-94c78eac.vercel.app/api/health');

  const runTest = async () => {
    setLoading(true);
    setResults([]);
    
    try {
      // Test 1: Direct axios call to the full URL
      const result1 = await axios.get(directUrl, { timeout: 10000 })
        .then(res => ({ success: true, data: res.data, status: res.status }))
        .catch(err => ({ 
          success: false, 
          error: err.message, 
          status: err.response?.status,
          data: err.response?.data
        }));
      
      setResults(prev => [...prev, {
        name: 'Direct Axios Call',
        url: directUrl,
        result: result1
      }]);
      
    } catch (error) {
      console.error("Test execution error:", error);
      setResults(prev => [...prev, {
        name: 'Test Execution Error',
        error: error.message
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">API Connectivity Test</h1>
      
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Test URL:</label>
          <input 
            type="text" 
            value={directUrl}
            onChange={(e) => setDirectUrl(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <button 
          onClick={runTest} 
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Running Tests...' : 'Run Test'}
        </button>
      </div>
      
      {results.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <h2 className="text-xl font-semibold p-4 bg-gray-200">Test Results</h2>
          
          {results.map((test, index) => (
            <div key={index} className="border-t p-4">
              <h3 className="font-medium text-lg">{test.name}</h3>
              {test.url && <p className="text-gray-600 text-sm mb-2">URL: {test.url}</p>}
              
              {test.error ? (
                <div className="mt-2 p-3 bg-red-100 text-red-800 rounded">
                  <p className="font-medium">Error: {test.error}</p>
                  {test.result?.status && <p>Status: {test.result.status}</p>}
                  {test.result?.data && (
                    <pre className="mt-2 p-2 bg-gray-800 text-gray-200 rounded overflow-x-auto">
                      {JSON.stringify(test.result.data, null, 2)}
                    </pre>
                  )}
                </div>
              ) : (
                test.result && (
                  <div className={`mt-2 p-3 ${test.result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} rounded`}>
                    <p className="font-medium">
                      Status: {test.result.status || (test.result.success ? 'Success' : 'Failed')}
                    </p>
                    {test.result.data && (
                      <pre className="mt-2 p-2 bg-gray-800 text-gray-200 rounded overflow-x-auto">
                        {JSON.stringify(test.result.data, null, 2)}
                      </pre>
                    )}
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApiTest;