import { useState } from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface ValidationResult {
  rule: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
}

interface AuditReviewProps {
  results: ValidationResult[];
  claudeMd: string;
  onUpdate: (content: string) => void;
  onSave: (content: string) => void;
}

function AuditReview({ results, claudeMd: _claudeMd, onUpdate: _onUpdate, onSave: _onSave }: AuditReviewProps) {
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const errors = results.filter(r => r.severity === 'error');
  const warnings = results.filter(r => r.severity === 'warning');
  const infos = results.filter(r => r.severity === 'info');

  const toggleExpand = (index: number) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpanded(newExpanded);
  };

  const handleDismiss = (index: number) => {
    const newDismissed = new Set(dismissed);
    newDismissed.add(index);
    setDismissed(newDismissed);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  // const activeResults = results.filter((_, i) => !dismissed.has(i));

  if (results.length === 0) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-green-800 mb-2">All checks passed!</h2>
          <p className="text-green-600">
            Your CLAUDE.md is in sync with your project reality.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-2xl font-bold text-red-700">{errors.length}</span>
          </div>
          <p className="text-sm text-red-600 mt-1">Errors</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <span className="text-2xl font-bold text-yellow-700">{warnings.length}</span>
          </div>
          <p className="text-sm text-yellow-600 mt-1">Warnings</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-500" />
            <span className="text-2xl font-bold text-blue-700">{infos.length}</span>
          </div>
          <p className="text-sm text-blue-600 mt-1">Suggestions</p>
        </div>
      </div>

      {/* Results list */}
      <div className="space-y-3">
        {results.map((result, index) => {
          if (dismissed.has(index)) return null;

          const isExpanded = expanded.has(index);

          return (
            <div
              key={index}
              className={`border rounded-lg overflow-hidden ${getSeverityBg(result.severity)}`}
            >
              <div
                className="flex items-start gap-3 p-4 cursor-pointer"
                onClick={() => toggleExpand(index)}
              >
                {getSeverityIcon(result.severity)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded">
                      {result.rule}
                    </span>
                  </div>
                  <p className="text-gray-900">{result.message}</p>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 pt-0">
                  {result.suggestion && (
                    <div className="bg-white rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Suggestion:</span> {result.suggestion}
                      </p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDismiss(index);
                      }}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:bg-white rounded-lg transition-colors"
                    >
                      Dismiss
                    </button>
                    {result.rule.includes('incomplete') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Add to CLAUDE.md
                        }}
                        className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add to CLAUDE.md
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {dismissed.size > 0 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setDismissed(new Set())}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Show {dismissed.size} dismissed item{dismissed.size !== 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  );
}

export default AuditReview;
