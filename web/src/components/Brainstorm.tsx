import { useState } from 'react';
import { Lightbulb, ArrowRight, Copy, Check } from 'lucide-react';

interface BrainstormProps {
  onExtract: (sections: Record<string, string>) => void;
}

const PROMPTS = [
  "What problem does this project solve?",
  "Who is the target user?",
  "What makes this different from existing solutions?",
  "What are the core features?",
  "What tech stack are you considering and why?",
  "What are the known constraints or limitations?",
  "What would success look like?",
  "What are potential gotchas or pitfalls?",
];

function Brainstorm({ onExtract }: BrainstormProps) {
  const [notes, setNotes] = useState('');
  const [extracted, setExtracted] = useState<Record<string, string> | null>(null);
  const [copied, setCopied] = useState(false);

  const handleExtract = () => {
    // Simple extraction - in a real app, this could use AI
    // For now, we'll do keyword-based extraction
    const sections: Record<string, string> = {};

    const lines = notes.split('\n');
    let currentSection = 'purpose';

    const sectionKeywords: Record<string, string[]> = {
      purpose: ['problem', 'solve', 'purpose', 'goal', 'why'],
      goals: ['feature', 'want', 'need', 'should', 'will', 'plan'],
      architecture: ['tech', 'stack', 'framework', 'database', 'api', 'structure'],
      domain: ['user', 'customer', 'business', 'rule', 'term', 'concept'],
      gotchas: ['gotcha', 'careful', 'avoid', 'pitfall', 'constraint', 'limitation'],
      quality: ['test', 'quality', 'done', 'success', 'metric'],
    };

    for (const line of lines) {
      const lowerLine = line.toLowerCase();

      // Check if this line starts a new section
      for (const [section, keywords] of Object.entries(sectionKeywords)) {
        if (keywords.some(k => lowerLine.includes(k))) {
          currentSection = section;
          break;
        }
      }

      // Add to current section
      if (line.trim()) {
        sections[currentSection] = (sections[currentSection] || '') + line + '\n';
      }
    }

    // Clean up
    for (const key of Object.keys(sections)) {
      sections[key] = sections[key].trim();
    }

    setExtracted(sections);
  };

  const handleUseInInterview = () => {
    if (extracted) {
      onExtract(extracted);
    }
  };

  const handleCopy = () => {
    if (extracted) {
      const text = Object.entries(extracted)
        .map(([key, value]) => `## ${key}\n${value}`)
        .join('\n\n');
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Brainstorm</h2>
        <p className="text-gray-600">
          Dump your thoughts about the project. We'll help structure them into CLAUDE.md sections.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Input side */}
        <div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">Prompts to consider:</span>
            </div>
            <ul className="space-y-1">
              {PROMPTS.map((prompt, i) => (
                <li key={i} className="text-sm text-gray-600">• {prompt}</li>
              ))}
            </ul>
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Start typing your thoughts here...

Example:
This is a documentation tool that keeps CLAUDE.md files in sync with reality.
The problem is that docs get stale and AI assistants get confused.
Using Node.js/TypeScript for the CLI, React for the web UI.
Need to be careful about parsing README files - lots of edge cases.
Success = reduced context-switching time between projects."
            className="w-full h-80 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
          />

          <button
            onClick={handleExtract}
            disabled={!notes.trim()}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Extract Structure
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Output side */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Extracted Sections</span>
            {extracted && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>

          {!extracted ? (
            <div className="h-96 bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center">
              <p className="text-gray-400 text-sm">
                Extracted sections will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3 h-96 overflow-y-auto">
              {Object.entries(extracted).map(([section, content]) => (
                <div key={section} className="bg-white rounded-lg border border-gray-200 p-3">
                  <h4 className="text-sm font-medium text-gray-700 capitalize mb-2">
                    {section.replace(/([A-Z])/g, ' $1').trim()}
                  </h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{content}</p>
                </div>
              ))}

              <button
                onClick={handleUseInInterview}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Use in Interview
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Brainstorm;
