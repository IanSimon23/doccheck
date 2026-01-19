import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Check, ChevronDown, ChevronUp } from 'lucide-react';
import type { Profile, DocCheckConfig } from '../../../src/shared/types';

interface SettingsProps {
  onProfileChange?: (profileName: string) => void;
}

function Settings({ onProfileChange }: SettingsProps) {
  const [config, setConfig] = useState<DocCheckConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [editingGlobals, setEditingGlobals] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/config');
      const data = await response.json();
      setConfig(data);
      if (data.profiles?.length > 0 && expandedIndex === null) {
        const activeIdx = data.profiles.findIndex((p: Profile) => p.name === data.activeProfile);
        setExpandedIndex(activeIdx >= 0 ? activeIdx : 0);
      }
    } catch (err) {
      console.error('Failed to load config:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save config:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddProfile = () => {
    if (!config) return;
    const newProfile: Profile = {
      name: `profile-${config.profiles.length + 1}`,
      description: 'New profile',
      defaults: {},
      techStack: {},
    };
    const newProfiles = [...config.profiles, newProfile];
    setConfig({
      ...config,
      profiles: newProfiles,
    });
    setExpandedIndex(newProfiles.length - 1);
  };

  const handleDeleteProfile = (name: string) => {
    if (!config || name === 'default') return;
    setConfig({
      ...config,
      profiles: config.profiles.filter(p => p.name !== name),
      activeProfile: config.activeProfile === name ? 'default' : config.activeProfile,
    });
  };

  const handleSetActive = (name: string) => {
    if (!config) return;
    setConfig({ ...config, activeProfile: name });
    onProfileChange?.(name);
  };

  const updateProfileByIndex = (index: number, updates: Partial<Profile>) => {
    setConfig(prev => {
      if (!prev) return prev;

      const oldName = prev.profiles[index]?.name;
      const newName = updates.name;

      // Update activeProfile if this was the active one and name changed
      let newActiveProfile = prev.activeProfile;
      if (newName && oldName && prev.activeProfile === oldName) {
        newActiveProfile = newName;
      }

      return {
        ...prev,
        activeProfile: newActiveProfile,
        profiles: prev.profiles.map((p, i) =>
          i === index ? { ...p, ...updates } : p
        ),
      };
    });
  };

  const updateProfileDefaults = (index: number, key: string, value: string) => {
    if (!config) return;
    setConfig({
      ...config,
      profiles: config.profiles.map((p, i) =>
        i === index
          ? { ...p, defaults: { ...p.defaults, [key]: value } }
          : p
      ),
    });
  };

  const updateProfileTechStack = (index: number, key: string, value: string) => {
    if (!config) return;
    setConfig({
      ...config,
      profiles: config.profiles.map((p, i) =>
        i === index
          ? { ...p, techStack: { ...p.techStack, [key]: value } }
          : p
      ),
    });
  };

  const updateGlobalDefaults = (key: string, value: string) => {
    if (!config) return;
    setConfig({
      ...config,
      globalDefaults: { ...config.globalDefaults, [key]: value },
    });
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading settings...</div>;
  }

  if (!config) {
    return <div className="text-center py-8 text-red-500">Failed to load settings</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Settings & Profiles</h2>
          <p className="text-sm text-gray-500">Configure defaults for new CLAUDE.md files</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            saved
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved' : saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Global Defaults */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <button
          onClick={() => setEditingGlobals(!editingGlobals)}
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <div>
            <h3 className="font-medium text-gray-900">Global Defaults</h3>
            <p className="text-sm text-gray-500">Applied to all profiles</p>
          </div>
          {editingGlobals ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        {editingGlobals && (
          <div className="p-4 pt-0 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Development Practices
              </label>
              <textarea
                value={config.globalDefaults.practices || ''}
                onChange={(e) => updateGlobalDefaults('practices', e.target.value)}
                placeholder="e.g., TDD, use BlogLog for commits..."
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Architecture Philosophy
              </label>
              <textarea
                value={config.globalDefaults.architecture || ''}
                onChange={(e) => updateGlobalDefaults('architecture', e.target.value)}
                placeholder="e.g., Keep it simple, avoid over-engineering..."
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quality Standards
              </label>
              <textarea
                value={config.globalDefaults.quality || ''}
                onChange={(e) => updateGlobalDefaults('quality', e.target.value)}
                placeholder="e.g., All tests must pass, clear commit messages..."
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                AI Guidance (Gotchas)
              </label>
              <textarea
                value={config.globalDefaults.gotchas || ''}
                onChange={(e) => updateGlobalDefaults('gotchas', e.target.value)}
                placeholder="e.g., Always run build after changes..."
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                rows={2}
              />
            </div>
          </div>
        )}
      </div>

      {/* Profiles */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Profiles</h3>
        <button
          onClick={handleAddProfile}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Profile
        </button>
      </div>

      <div className="space-y-3">
        {config.profiles.map((profile, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden"
          >
            <div
              className="flex items-center justify-between p-4 cursor-pointer"
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
            >
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{profile.name}</span>
                    {config.activeProfile === profile.name && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  {profile.description && (
                    <p className="text-sm text-gray-500">{profile.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {config.activeProfile !== profile.name && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetActive(profile.name);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1"
                  >
                    Set Active
                  </button>
                )}
                {profile.name !== 'default' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProfile(profile.name);
                    }}
                    className="text-gray-400 hover:text-red-500 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                {expandedIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>

            {expandedIndex === index && (
              <div className="p-4 pt-0 border-t border-gray-100 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Profile Name
                    </label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => updateProfileByIndex(index, { name: e.target.value })}
                      disabled={profile.name === 'default'}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={profile.description || ''}
                      onChange={(e) => updateProfileByIndex(index, { description: e.target.value })}
                      placeholder="e.g., For CLI tools"
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Tech Stack</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Language</label>
                      <input
                        type="text"
                        value={profile.techStack?.language || ''}
                        onChange={(e) => updateProfileTechStack(index, 'language', e.target.value)}
                        placeholder="e.g., TypeScript"
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Framework</label>
                      <input
                        type="text"
                        value={profile.techStack?.framework || ''}
                        onChange={(e) => updateProfileTechStack(index, 'framework', e.target.value)}
                        placeholder="e.g., React, Express"
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Styling</label>
                      <input
                        type="text"
                        value={profile.techStack?.styling || ''}
                        onChange={(e) => updateProfileTechStack(index, 'styling', e.target.value)}
                        placeholder="e.g., Tailwind CSS"
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Testing</label>
                      <input
                        type="text"
                        value={profile.techStack?.testing || ''}
                        onChange={(e) => updateProfileTechStack(index, 'testing', e.target.value)}
                        placeholder="e.g., Vitest, Jest"
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Default Answers</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Practices</label>
                      <textarea
                        value={profile.defaults.practices || ''}
                        onChange={(e) => updateProfileDefaults(index, 'practices', e.target.value)}
                        placeholder="Override global practices..."
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Architecture</label>
                      <textarea
                        value={profile.defaults.architecture || ''}
                        onChange={(e) => updateProfileDefaults(index, 'architecture', e.target.value)}
                        placeholder="Override global architecture..."
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Settings;
