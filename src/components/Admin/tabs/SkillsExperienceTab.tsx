import React, { useState } from 'react';
import { useSiteConfig } from '../../../context/SiteConfigContext';
import { SkillItem, ExperienceItem } from '../../../types/cms';
import {
  Sparkles,
  Briefcase,
  Plus,
  Trash2,
  Edit2,
  Save,
  Check,
  CheckCircle2
} from 'lucide-react';

export const SkillsExperienceTab: React.FC = () => {
  const { draftConfig, updateDraft, saveDraft, isSaving } = useSiteConfig();
  const [activeSubTab, setActiveSubTab] = useState<'skills' | 'experience'>('skills');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Skill modal
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [skillName, setSkillName] = useState('');
  const [skillLevel, setSkillLevel] = useState(90);
  const [skillCategory, setSkillCategory] = useState('Design & Motion');

  // Experience modal
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [expRole, setExpRole] = useState('');
  const [expCompany, setExpCompany] = useState('');
  const [expPeriod, setExpPeriod] = useState('2024 - Present');
  const [expDesc, setExpDesc] = useState('');
  const [expHighlights, setExpHighlights] = useState('');
  const [expIsCurrent, setExpIsCurrent] = useState(false);

  const skills = draftConfig.skills || [];
  const experience = draftConfig.experience || [];

  // Skills handlers
  const handleOpenAddSkill = () => {
    setEditingSkillId(null);
    setSkillName('');
    setSkillLevel(90);
    setSkillCategory('Design & Motion');
    setIsSkillModalOpen(true);
  };

  const handleOpenEditSkill = (s: SkillItem) => {
    setEditingSkillId(s.id);
    setSkillName(s.name);
    setSkillLevel(s.level);
    setSkillCategory(s.category);
    setIsSkillModalOpen(true);
  };

  const handleSaveSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) return;

    const item: SkillItem = {
      id: editingSkillId || `skl-${Date.now()}`,
      name: skillName.trim(),
      level: skillLevel,
      category: skillCategory.trim()
    };

    if (editingSkillId) {
      updateDraft((prev) => ({
        ...prev,
        skills: (prev.skills || []).map((s) => (s.id === editingSkillId ? item : s))
      }));
    } else {
      updateDraft((prev) => ({
        ...prev,
        skills: [...(prev.skills || []), item]
      }));
    }

    setIsSkillModalOpen(false);
  };

  const handleDeleteSkill = (id: string) => {
    if (!window.confirm('Delete this skill?')) return;
    updateDraft((prev) => ({
      ...prev,
      skills: (prev.skills || []).filter((s) => s.id !== id)
    }));
  };

  // Experience handlers
  const handleOpenAddExp = () => {
    setEditingExpId(null);
    setExpRole('');
    setExpCompany('');
    setExpPeriod('2024 - Present');
    setExpDesc('');
    setExpHighlights('Led visual identity, Scaled client retention by 40%');
    setExpIsCurrent(true);
    setIsExpModalOpen(true);
  };

  const handleOpenEditExp = (eItem: ExperienceItem) => {
    setEditingExpId(eItem.id);
    setExpRole(eItem.role);
    setExpCompany(eItem.company);
    setExpPeriod(eItem.period);
    setExpDesc(eItem.description);
    setExpHighlights(eItem.highlights ? eItem.highlights.join(', ') : '');
    setExpIsCurrent(Boolean(eItem.isCurrent));
    setIsExpModalOpen(true);
  };

  const handleSaveExp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expRole.trim() || !expCompany.trim()) return;

    const highArr = expHighlights.split(',').map((h) => h.trim()).filter(Boolean);

    const item: ExperienceItem = {
      id: editingExpId || `exp-${Date.now()}`,
      role: expRole.trim(),
      company: expCompany.trim(),
      period: expPeriod.trim(),
      description: expDesc.trim(),
      highlights: highArr,
      isCurrent: expIsCurrent
    };

    if (editingExpId) {
      updateDraft((prev) => ({
        ...prev,
        experience: (prev.experience || []).map((ex) => (ex.id === editingExpId ? item : ex))
      }));
    } else {
      updateDraft((prev) => ({
        ...prev,
        experience: [...(prev.experience || []), item]
      }));
    }

    setIsExpModalOpen(false);
  };

  const handleDeleteExp = (id: string) => {
    if (!window.confirm('Delete this career milestone?')) return;
    updateDraft((prev) => ({
      ...prev,
      experience: (prev.experience || []).filter((ex) => ex.id !== id)
    }));
  };

  const handleSave = async () => {
    const success = await saveDraft();
    if (success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-emerald-400" />
            <span>Skills & Experience Timeline</span>
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Highlight technical proficiencies, software masteries, and career trajectory.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Draft Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
            </>
          )}
        </button>
      </div>

      {/* Sub-nav */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-neutral-900/80 border border-white/10 rounded-2xl">
        <button
          onClick={() => setActiveSubTab('skills')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeSubTab === 'skills'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Technical Skills ({skills.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('experience')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeSubTab === 'experience'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Experience Timeline ({experience.length})</span>
        </button>
      </div>

      {/* SKILLS SUB-TAB */}
      {activeSubTab === 'skills' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Skills Matrix</h3>
            <button
              onClick={handleOpenAddSkill}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Skill</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {skills.map((s) => (
              <div
                key={s.id}
                className="p-5 rounded-2xl bg-neutral-900/80 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">{s.name}</h4>
                    <span className="text-xs font-mono font-bold text-emerald-400">{s.level}%</span>
                  </div>

                  <div className="w-full bg-neutral-800 rounded-full h-1.5 mt-3 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full"
                      style={{ width: `${s.level}%` }}
                    />
                  </div>

                  <div className="text-[11px] text-neutral-400 mt-2 font-medium">
                    {s.category}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => handleOpenEditSkill(s)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteSkill(s.id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EXPERIENCE SUB-TAB */}
      {activeSubTab === 'experience' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Career Milestones</h3>
            <button
              onClick={handleOpenAddExp}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Milestone</span>
            </button>
          </div>

          <div className="space-y-4">
            {experience.map((ex) => (
              <div
                key={ex.id}
                className="p-6 rounded-2xl bg-neutral-900/80 border border-white/10 hover:border-white/20 transition-all flex flex-col md:flex-row md:items-start justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-base font-bold text-white">{ex.role}</h4>
                    <span className="text-sm font-semibold text-emerald-400">@ {ex.company}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-white/5 text-neutral-300 border border-white/10">
                      {ex.period}
                    </span>
                    {ex.isCurrent && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        CURRENT ROLE
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-300">{ex.description}</p>

                  {ex.highlights && (
                    <ul className="mt-2 space-y-1">
                      {ex.highlights.map((h, idx) => (
                        <li key={idx} className="text-xs text-neutral-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end md:self-start">
                  <button
                    onClick={() => handleOpenEditExp(ex)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteExp(ex.id)}
                    className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: Skill */}
      {isSkillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-white/15 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">
              {editingSkillId ? 'Edit Skill' : 'Add Technical Skill'}
            </h3>

            <form onSubmit={handleSaveSkill} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Adobe Premiere Pro"
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Proficiency Level ({skillLevel}%)
                </label>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Video Editing, UI Design"
                  value={skillCategory}
                  onChange={(e) => setSkillCategory(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSkillModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30"
                >
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Experience */}
      {isExpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-white/15 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">
              {editingExpId ? 'Edit Milestone' : 'Add Career Milestone'}
            </h3>

            <form onSubmit={handleSaveExp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Role Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead Video Editor"
                  value={expRole}
                  onChange={(e) => setExpRole(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Company / Studio</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unicivix Global"
                  value={expCompany}
                  onChange={(e) => setExpCompany(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Period</label>
                <input
                  type="text"
                  placeholder="e.g. 2023 - Present"
                  value={expPeriod}
                  onChange={(e) => setExpPeriod(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Highlights (comma separated)</label>
                <input
                  type="text"
                  value={expHighlights}
                  onChange={(e) => setExpHighlights(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="currentRoleCheck"
                  checked={expIsCurrent}
                  onChange={(e) => setExpIsCurrent(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded bg-black/40 border-white/20 focus:ring-emerald-500"
                />
                <label htmlFor="currentRoleCheck" className="text-xs font-semibold text-white cursor-pointer">
                  I currently work in this role
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExpModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
