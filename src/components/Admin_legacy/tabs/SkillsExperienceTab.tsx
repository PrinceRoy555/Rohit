import React, { useState } from 'react';
import { useSiteConfig } from '../../../context/SiteConfigContext';
import { SkillItem, ExperienceItem } from '../../../types/cms';
import { PageHeader } from '../layout/PageHeader';
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
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Skills & Experience Timeline"
        description="Highlight technical proficiencies, software masteries, and career trajectory."
        actions={
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="h-9 px-3.5 rounded-lg text-xs font-semibold bg-accent-primary hover:bg-accent-secondary text-white flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer select-none"
          >
            {savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Draft Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
              </>
            )}
          </button>
        }
      />

      {/* Sub-nav */}
      <div className="flex overflow-x-auto no-scrollbar gap-1.5 sm:gap-2 p-1.5 bg-bg-card border border-border-color rounded-xl sm:rounded-2xl shadow-xs">
        <button
          onClick={() => setActiveSubTab('skills')}
          className={`flex-shrink-0 whitespace-nowrap min-h-[38px] flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all active:scale-98 ${
            activeSubTab === 'skills'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-text-muted hover:text-text-primary hover:bg-bg-secondary'
          }`}
        >
          <Sparkles className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          <span>Skills ({skills.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('experience')}
          className={`flex-shrink-0 whitespace-nowrap min-h-[38px] flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all active:scale-98 ${
            activeSubTab === 'experience'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-text-muted hover:text-text-primary hover:bg-bg-secondary'
          }`}
        >
          <Briefcase className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          <span>Experience ({experience.length})</span>
        </button>
      </div>

      {/* SKILLS SUB-TAB */}
      {activeSubTab === 'skills' && (
        <div className="space-y-3.5 sm:space-y-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm sm:text-base font-bold text-text-primary">Skills Matrix</h3>
            <button
              onClick={handleOpenAddSkill}
              className="min-h-[38px] sm:min-h-[40px] px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1.5 active:scale-98"
            >
              <Plus className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
              <span>Add Skill</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4">
            {skills.map((s) => (
              <div
                key={s.id}
                className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-bg-card border border-border-color hover:border-emerald-500/40 transition-all flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-bold text-text-primary">{s.name}</h4>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{s.level}%</span>
                  </div>

                  <div className="w-full bg-bg-secondary rounded-full h-1.5 mt-2.5 sm:mt-3 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full"
                      style={{ width: `${s.level}%` }}
                    />
                  </div>

                  <div className="text-[11px] text-text-muted mt-2 font-medium">
                    {s.category}
                  </div>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-border-color flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => handleOpenEditSkill(s)}
                    className="min-w-[34px] min-h-[34px] p-1.5 rounded-lg bg-bg-secondary hover:bg-bg-card-hover text-text-secondary hover:text-text-primary border border-border-color flex items-center justify-center active:scale-95"
                    title="Edit skill"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteSkill(s.id)}
                    className="min-w-[34px] min-h-[34px] p-1.5 rounded-lg bg-bg-secondary hover:bg-red-500/10 text-text-muted hover:text-red-500 dark:hover:text-red-400 border border-border-color flex items-center justify-center active:scale-95"
                    title="Delete skill"
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
        <div className="space-y-3.5 sm:space-y-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm sm:text-base font-bold text-text-primary">Career Milestones</h3>
            <button
              onClick={handleOpenAddExp}
              className="min-h-[38px] sm:min-h-[40px] px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1.5 active:scale-98"
            >
              <Plus className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
              <span>Add Milestone</span>
            </button>
          </div>

          <div className="space-y-2.5 sm:space-y-4">
            {experience.map((ex) => (
              <div
                key={ex.id}
                className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-bg-card border border-border-color hover:border-emerald-500/40 transition-all flex flex-col md:flex-row md:items-start justify-between gap-3 sm:gap-4 shadow-xs"
              >
                <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <h4 className="text-sm sm:text-base font-bold text-text-primary">{ex.role}</h4>
                    <span className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400">@ {ex.company}</span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-medium tabular-nums bg-bg-secondary text-text-secondary border border-border-color">
                      {ex.period}
                    </span>
                    {ex.isCurrent && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        CURRENT ROLE
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">{ex.description}</p>

                  {ex.highlights && (
                    <ul className="mt-2 space-y-1">
                      {ex.highlights.map((h, idx) => (
                        <li key={idx} className="text-xs text-text-muted flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end md:self-start pt-1 md:pt-0">
                  <button
                    onClick={() => handleOpenEditExp(ex)}
                    className="min-w-[36px] min-h-[36px] p-2 rounded-xl bg-bg-secondary hover:bg-bg-card-hover text-text-secondary hover:text-text-primary border border-border-color flex items-center justify-center active:scale-95"
                    title="Edit milestone"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteExp(ex.id)}
                    className="min-w-[36px] min-h-[36px] p-2 rounded-xl bg-bg-secondary hover:bg-red-500/10 text-text-muted hover:text-red-500 dark:hover:text-red-400 border border-border-color flex items-center justify-center active:scale-95"
                    title="Delete milestone"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs">
          <div className="bg-bg-card border border-border-color rounded-xl sm:rounded-2xl max-w-md w-full p-4 sm:p-6 space-y-3.5 sm:space-y-4 shadow-xl text-text-primary">
            <h3 className="text-base sm:text-lg font-bold text-text-primary">
              {editingSkillId ? 'Edit Skill' : 'Add Technical Skill'}
            </h3>

            <form onSubmit={handleSaveSkill} className="space-y-3.5 sm:space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Adobe Premiere Pro"
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
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
                <label className="block text-xs font-semibold text-text-secondary mb-1">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Video Editing, UI Design"
                  value={skillCategory}
                  onChange={(e) => setSkillCategory(e.target.value)}
                  className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border-color">
                <button
                  type="button"
                  onClick={() => setIsSkillModalOpen(false)}
                  className="min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold bg-bg-secondary hover:bg-bg-card-hover text-text-primary border border-border-color active:scale-98"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[42px] px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs active:scale-98"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs">
          <div className="bg-bg-card border border-border-color rounded-xl sm:rounded-2xl max-w-md w-full p-4 sm:p-6 space-y-3.5 sm:space-y-4 shadow-xl max-h-[92vh] overflow-y-auto text-text-primary">
            <h3 className="text-base sm:text-lg font-bold text-text-primary">
              {editingExpId ? 'Edit Milestone' : 'Add Career Milestone'}
            </h3>

            <form onSubmit={handleSaveExp} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Role Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead Video Editor"
                  value={expRole}
                  onChange={(e) => setExpRole(e.target.value)}
                  className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Company / Studio</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unicivix Global"
                  value={expCompany}
                  onChange={(e) => setExpCompany(e.target.value)}
                  className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Period</label>
                <input
                  type="text"
                  placeholder="e.g. 2023 - Present"
                  value={expPeriod}
                  onChange={(e) => setExpPeriod(e.target.value)}
                  className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Description</label>
                <textarea
                  rows={2}
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-color rounded-xl p-3 text-sm text-text-primary focus:border-emerald-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Highlights (comma separated)</label>
                <input
                  type="text"
                  value={expHighlights}
                  onChange={(e) => setExpHighlights(e.target.value)}
                  className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="currentRoleCheck"
                  checked={expIsCurrent}
                  onChange={(e) => setExpIsCurrent(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded bg-bg-secondary border-border-color focus:ring-emerald-500"
                />
                <label htmlFor="currentRoleCheck" className="text-xs font-semibold text-text-primary cursor-pointer">
                  I currently work in this role
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border-color">
                <button
                  type="button"
                  onClick={() => setIsExpModalOpen(false)}
                  className="min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold bg-bg-secondary hover:bg-bg-card-hover text-text-primary border border-border-color active:scale-98"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[42px] px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs active:scale-98"
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
