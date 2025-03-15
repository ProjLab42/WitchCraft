import { useState, useEffect } from 'react';
import { runTests, testLogin, testGetUserProfile } from '../tests/api.test';
import { runConfigTest } from '../tests/config.test';
import { testUpdateResumeSections } from '../tests/resume.test';
import { 
  testAddCustomSection, 
  testAddCustomItem, 
  testUpdateCustomItem 
} from '../tests/custom-sections.test';
import { runTests as runAddCustomSectionTest } from '../tests/add-custom-section.test';

const TestRunner = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [configResults, setConfigResults] = useState<any>(null);

  // Run config test on mount
  useEffect(() => {
    try {
      const results = runConfigTest();
      setConfigResults(results);
    } catch (error) {
      console.error('Config test error:', error);
    }
  }, []);

  // Override console methods to capture logs
  useEffect(() => {
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;

    console.log = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
      ).join(' ');
      setLogs(prev => [...prev, `LOG: ${message}`]);
      originalConsoleLog(...args);
    };

    console.error = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
      ).join(' ');
      setLogs(prev => [...prev, `ERROR: ${message}`]);
      originalConsoleError(...args);
    };

    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
    };
  }, []);

  const handleRunTests = async () => {
    setLogs([]);
    setIsRunning(true);
    try {
      await runTests();
    } catch (error) {
      console.error('Test runner error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunLoginTest = async () => {
    setLogs([]);
    setIsRunning(true);
    try {
      await testLogin();
    } catch (error) {
      console.error('Login test error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunProfileTest = async () => {
    setLogs([]);
    setIsRunning(true);
    try {
      await testGetUserProfile();
    } catch (error) {
      console.error('Profile test error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunResumeTest = async () => {
    setLogs([]);
    setIsRunning(true);
    try {
      await testUpdateResumeSections();
    } catch (error) {
      console.error('Resume test error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunCustomSectionTest = async () => {
    setLogs([]);
    setIsRunning(true);
    try {
      await testLogin();
      const { sectionKey } = await testAddCustomSection();
      const { customItem } = await testAddCustomItem(sectionKey);
      await testUpdateCustomItem(sectionKey, customItem);
      console.log('Custom section tests completed successfully!');
    } catch (error) {
      console.error('Custom section test error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunAddCustomSectionTest = async () => {
    setLogs([]);
    setIsRunning(true);
    try {
      await runAddCustomSectionTest();
    } catch (error) {
      console.error('Add custom section test error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">API Test Runner</h1>
      
      {/* Configuration Results */}
      <div className="mb-6 p-4 border rounded bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">Configuration</h2>
        {configResults ? (
          <div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="font-medium">Backend URL:</div>
              <div>{configResults.backendUrl || 'Not set'}</div>
              
              <div className="font-medium">API URL:</div>
              <div>{configResults.apiUrl || 'Not set'}</div>
            </div>
            
            {configResults.hasIssues ? (
              <div className="text-red-500 mt-2">
                <div className="font-medium">Issues Found:</div>
                <ul className="list-disc list-inside">
                  {configResults.issues.map((issue: string, index: number) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-green-500 mt-2">No configuration issues found.</div>
            )}
          </div>
        ) : (
          <div>Loading configuration...</div>
        )}
      </div>
      
      <div className="flex flex-wrap gap-4 mb-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          onClick={handleRunTests}
          disabled={isRunning}
        >
          {isRunning ? 'Running...' : 'Run All Tests'}
        </button>
        
        <button
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          onClick={handleRunLoginTest}
          disabled={isRunning}
        >
          Test Login
        </button>
        
        <button
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
          onClick={handleRunProfileTest}
          disabled={isRunning}
        >
          Test Get Profile
        </button>
        
        <button
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
          onClick={handleRunResumeTest}
          disabled={isRunning}
        >
          Test Update Resume
        </button>
        
        <button
          className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 disabled:opacity-50"
          onClick={handleRunCustomSectionTest}
          disabled={isRunning}
        >
          Test Custom Sections
        </button>
        
        <button
          className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 disabled:opacity-50"
          onClick={handleRunAddCustomSectionTest}
          disabled={isRunning}
        >
          Test Add Custom Section
        </button>
      </div>
      
      <div className="border rounded p-4 bg-gray-100 h-[500px] overflow-auto">
        <pre className="whitespace-pre-wrap">
          {logs.length > 0 
            ? logs.join('\n') 
            : 'Click a button to run tests and see results here...'}
        </pre>
      </div>
    </div>
  );
};

export default TestRunner; 