import { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, Save } from 'lucide-react';

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

interface InterviewProps {
  projectInfo: ProjectInfo | null;
  claudeMd: string;
  onUpdate: (content: string) => void;
  onSave: (content: string) => void;
}

interface InterviewStep {
  id: string;
  title: string;
  description: string;
  placeholder: string;
  section: string;
}

const INTERVIEW_STEPS: InterviewStep[] = [
  {
    id: 'purpose',
    title: 'Project Purpose',
    description: 'What does this project do? What problem does it solve? Who is it for?',
    placeholder: 'e.g., "A CLI tool that generates and validates CLAUDE.md documentation files, helping developers maintain accurate project context for AI assistants."',
    section: 'Project Overview',
  },
  {
    id: 'goals',
    title: 'Current Goals',
    description: 'What are you actively working on? What\'s the current focus?',
    placeholder: 'e.g., "Building the web interface for interactive documentation authoring. Next up is the audit review feature."',
    section: 'Project Overview',
  },
  {
    id: 'domain',
    title: 'Domain Knowledge',
    description: 'What business rules, terminology, or domain-specific concepts should an AI assistant understand?',
    placeholder: 'e.g., "Drift detection refers to when documentation claims don\'t match project reality. README claims are extracted from Tech Stack sections..."',
    section: 'Domain Knowledge',
  },
  {
    id: 'architecture',
    title: 'Key Architecture Decisions',
    description: 'What important technical decisions have been made? Why were they made?',
    placeholder: 'e.g., "CLI-first approach - web app enhances but doesn\'t replace CLI. Scanner extracts claims from README, validator compares against reality."',
    section: 'Architecture',
  },
  {
    id: 'gotchas',
    title: 'AI-Specific Guidance',
    description: 'What should an AI assistant know to work effectively on this codebase? Common mistakes to avoid?',
    placeholder: 'e.g., "Always run npm run build after changing scanner/validator code. Use bl commit for git commits to log to BlogLog."',
    section: 'AI-Specific Guidance',
  },
  {
    id: 'quality',
    title: 'Quality Gates',
    description: 'What does "done" look like? Testing requirements? Code review process?',
    placeholder: 'e.g., "All tests must pass. New features should be tested on real projects (Jironaut, BlogLog). Commits should have clear messages."',
    section: 'Quality Gates',
  },
];

function Interview({ projectInfo, claudeMd: _claudeMd, onUpdate, onSave }: InterviewProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    // Try to extract existing answers from CLAUDE.md
    const extracted: Record<string, string> = {};
    // For now, start fresh - could parse existing content later
    return extracted;
  });
  const [saved, setSaved] = useState(false);

  const step = INTERVIEW_STEPS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === INTERVIEW_STEPS.length - 1;
  const completedSteps = INTERVIEW_STEPS.filter(s => answers[s.id]?.trim()).length;

  const handleNext = () => {
    if (!isLast) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (!isFirst) setCurrentStep(currentStep - 1);
  };

  const handleAnswerChange = (value: string) => {
    setAnswers({ ...answers, [step.id]: value });
    setSaved(false);
  };

  const generateClaudeMd = (): string => {
    const sections: string[] = [];

    // Header
    sections.push(`# CLAUDE.md - ${projectInfo?.name || 'Project'} Context\n`);

    // Project Overview
    sections.push('## Project Overview\n');
    if (answers.purpose) {
      sections.push(answers.purpose + '\n');
    }
    if (answers.goals) {
      sections.push('### Current Goals\n');
      sections.push(answers.goals + '\n');
    }

    // Tech Stack (auto-generated from scanner)
    if (projectInfo?.packageManager) {
      sections.push('## Tech Stack\n');
      sections.push(`**Package Manager**: ${projectInfo.packageManager.type}\n`);

      const deps = Object.entries(projectInfo.packageManager.dependencies || {});
      if (deps.length > 0) {
        sections.push('\n**Key Dependencies**:\n');
        deps.slice(0, 10).forEach(([name, version]) => {
          sections.push(`- ${name}: ${version}\n`);
        });
      }
    }

    // Architecture
    if (answers.architecture) {
      sections.push('\n## Architecture\n');
      sections.push(answers.architecture + '\n');
    }

    // Project Structure (auto-generated)
    if (projectInfo?.structure.directories.length) {
      sections.push('\n## Project Structure\n');
      sections.push('```\n');
      projectInfo.structure.directories.forEach(dir => {
        sections.push(`${dir}/\n`);
      });
      sections.push('```\n');
    }

    // Domain Knowledge
    if (answers.domain) {
      sections.push('\n## Domain Knowledge\n');
      sections.push(answers.domain + '\n');
    }

    // AI-Specific Guidance
    if (answers.gotchas) {
      sections.push('\n## AI-Specific Guidance\n');
      sections.push(answers.gotchas + '\n');
    }

    // Quality Gates
    if (answers.quality) {
      sections.push('\n## Quality Gates\n');
      sections.push(answers.quality + '\n');
    }

    return sections.join('');
  };

  const handleSave = () => {
    const content = generateClaudeMd();
    onUpdate(content);
    onSave(content);
    setSaved(true);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">
            Step {currentStep + 1} of {INTERVIEW_STEPS.length}
          </span>
          <span className="text-sm text-gray-600">
            {completedSteps} of {INTERVIEW_STEPS.length} completed
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / INTERVIEW_STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {INTERVIEW_STEPS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setCurrentStep(i)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
              i === currentStep
                ? 'bg-blue-600 text-white'
                : answers[s.id]?.trim()
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {answers[s.id]?.trim() && i !== currentStep && (
              <Check className="w-3 h-3" />
            )}
            {s.title}
          </button>
        ))}
      </div>

      {/* Current step */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h2>
        <p className="text-gray-600 mb-4">{step.description}</p>

        <textarea
          value={answers[step.id] || ''}
          onChange={(e) => handleAnswerChange(e.target.value)}
          placeholder={step.placeholder}
          className="w-full h-48 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />

        <p className="text-xs text-gray-400 mt-2">
          This will be added to the "{step.section}" section of your CLAUDE.md
        </p>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={handlePrev}
          disabled={isFirst}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isFirst
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            saved
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {saved ? (
            <>
              <Check className="w-4 h-4" />
              Saved
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save CLAUDE.md
            </>
          )}
        </button>

        <button
          onClick={handleNext}
          disabled={isLast}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isLast
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default Interview;
