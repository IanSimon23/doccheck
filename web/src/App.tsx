import { useState, useEffect } from 'react';
import { FileText, CheckCircle, AlertTriangle, Loader2, Settings as SettingsIcon, Lightbulb } from 'lucide-react';
import Interview from './components/Interview';
import AuditReview from './components/AuditReview';
import Editor from './components/Editor';
import Settings from './components/Settings';
import Brainstorm from './components/Brainstorm';

interface ProjectInfo {
  name: string;
  path: string;
  packageManager: {
    type: string;
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
    scripts: Record<string, string>;
  } | null;
  structure: {
    directories: string[];
    sourceDir: string | null;
  };
  hasTests: boolean;
  claudeMd: string | null;
}

interface ValidationResult {
  rule: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
}

type Tab = 'brainstorm' | 'interview' | 'audit' | 'editor' | 'settings';

function App() {
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [claudeMd, setClaudeMd] = useState<string>('');
  const [activeTab, setActiveTab] = useState<Tab>('interview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjectData();
  }, []);

  const fetchProjectData = async () => {
    try {
      const response = await fetch('/api/project');
      if (!response.ok) throw new Error('Failed to load project data');
      const data = await response.json();
      setProjectInfo(data.projectInfo);
      setClaudeMd(data.claudeMd || '');
      setValidationResults(data.validationResults || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (content: string) => {
    try {
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error('Failed to save');
      setClaudeMd(content);
      // Re-run validation after save
      const checkResponse = await fetch('/api/check');
      const checkData = await checkResponse.json();
      setValidationResults(checkData.results || []);
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading project...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center gap-3 text-red-700">
            <AlertTriangle className="w-6 h-6" />
            <span className="font-medium">Error loading project</span>
          </div>
          <p className="mt-2 text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const errorCount = validationResults.filter(r => r.severity === 'error').length;
  const warningCount = validationResults.filter(r => r.severity === 'warning').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">DocCheck</h1>
                <p className="text-sm text-gray-500">{projectInfo?.name || 'Unknown project'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {errorCount > 0 && (
                <span className="flex items-center gap-1 text-red-600 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  {errorCount} error{errorCount !== 1 ? 's' : ''}
                </span>
              )}
              {warningCount > 0 && (
                <span className="flex items-center gap-1 text-yellow-600 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  {warningCount} warning{warningCount !== 1 ? 's' : ''}
                </span>
              )}
              {errorCount === 0 && warningCount === 0 && validationResults.length >= 0 && (
                <span className="flex items-center gap-1 text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  All checks passed
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex gap-6">
            <button
              onClick={() => setActiveTab('brainstorm')}
              className={`py-3 px-1 border-b-2 text-sm font-medium transition-colors flex items-center gap-1 ${
                activeTab === 'brainstorm'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              Brainstorm
            </button>
            <button
              onClick={() => setActiveTab('interview')}
              className={`py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                activeTab === 'interview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Interview
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                activeTab === 'audit'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Audit Review
              {(errorCount + warningCount) > 0 && (
                <span className="ml-2 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs">
                  {errorCount + warningCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('editor')}
              className={`py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                activeTab === 'editor'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-3 px-1 border-b-2 text-sm font-medium transition-colors flex items-center gap-1 ${
                activeTab === 'settings'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              Settings
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === 'brainstorm' && (
          <Brainstorm
            onExtract={(sections) => {
              // TODO: Pass extracted sections to interview
              console.log('Extracted sections:', sections);
              setActiveTab('interview');
            }}
          />
        )}
        {activeTab === 'interview' && (
          <Interview
            projectInfo={projectInfo}
            claudeMd={claudeMd}
            onUpdate={setClaudeMd}
            onSave={handleSave}
          />
        )}
        {activeTab === 'audit' && (
          <AuditReview
            results={validationResults}
            claudeMd={claudeMd}
            onUpdate={setClaudeMd}
            onSave={handleSave}
          />
        )}
        {activeTab === 'editor' && (
          <Editor
            content={claudeMd}
            onChange={setClaudeMd}
            onSave={handleSave}
          />
        )}
        {activeTab === 'settings' && (
          <Settings />
        )}
      </main>
    </div>
  );
}

export default App;
