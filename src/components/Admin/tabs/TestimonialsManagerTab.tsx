import React, { useState } from 'react';
import { useSiteConfig } from '../../../context/SiteConfigContext';
import { TestimonialItem } from '../../../types/cms';
import { PageHeader } from '../layout/PageHeader';
import {
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  Star,
  Save,
  Check,
  Quote
} from 'lucide-react';

export const TestimonialsManagerTab: React.FC = () => {
  const { draftConfig, updateDraft, saveDraft, isSaving } = useSiteConfig();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [content, setContent] = useState('');
  const [avatar, setAvatar] = useState('');
  const [rating, setRating] = useState(5);
  const [project, setProject] = useState('');

  const testimonials = draftConfig.testimonials || [];

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setRole('');
    setCompany('');
    setContent('');
    setAvatar('');
    setRating(5);
    setProject('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: TestimonialItem) => {
    setEditingId(t.id);
    setName(t.name);
    setRole(t.role);
    setCompany(t.company);
    setContent(t.content);
    setAvatar(t.avatar || '');
    setRating(t.rating || 5);
    setProject(t.project || '');
    setIsModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    const item: TestimonialItem = {
      id: editingId || `tst-${Date.now()}`,
      name: name.trim(),
      role: role.trim(),
      company: company.trim(),
      content: content.trim(),
      avatar: avatar.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      rating,
      project: project.trim()
    };

    if (editingId) {
      updateDraft((prev) => ({
        ...prev,
        testimonials: (prev.testimonials || []).map((t) => (t.id === editingId ? item : t))
      }));
    } else {
      updateDraft((prev) => ({
        ...prev,
        testimonials: [...(prev.testimonials || []), item]
      }));
    }

    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleDelete = (id: string, clientName: string) => {
    if (!window.confirm(`Delete review from "${clientName}"?`)) return;
    updateDraft((prev) => ({
      ...prev,
      testimonials: (prev.testimonials || []).filter((t) => t.id !== id)
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
        title="Client Testimonials & Reviews"
        description="Showcase authentic client endorsements, star ratings, and project outcomes."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="h-9 px-3.5 rounded-lg text-xs font-semibold bg-bg-secondary hover:bg-bg-card-hover text-text-primary border border-border-color flex items-center justify-center gap-2 transition-all cursor-pointer select-none"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleOpenAdd}
              className="h-9 px-3.5 rounded-lg text-xs font-semibold bg-accent-primary hover:bg-accent-secondary text-white flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer select-none"
            >
              <Plus className="w-4 h-4" />
              <span>Add Review</span>
            </button>
          </div>
        }
      />

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-bg-card border border-border-color hover:border-rose-500/30 transition-all flex flex-col justify-between shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover border border-border-color flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-text-primary truncate">{t.name}</h4>
                    <p className="text-[11px] sm:text-xs text-text-muted truncate">{t.role} • {t.company}</p>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 text-amber-500 flex-shrink-0">
                  {Array.from({ length: t.rating || 5 }).map((_, i) => (
                    <Star key={i} className="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-current" />
                  ))}
                </div>
              </div>

              <div className="mt-3 sm:mt-4 relative">
                <Quote className="w-5 h-5 sm:w-6 sm:h-6 text-text-muted/20 absolute -top-1 -left-1" />
                <p className="text-xs sm:text-sm text-text-secondary italic pl-5 leading-relaxed">
                  &quot;{t.content}&quot;
                </p>
              </div>

              {t.project && (
                <div className="mt-2.5 text-[11px] sm:text-xs text-rose-600 dark:text-rose-400 font-medium">
                  Project: {t.project}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-border-color flex items-center justify-end gap-2">
              <button
                onClick={() => handleOpenEdit(t)}
                className="w-9 h-9 rounded-xl bg-bg-secondary hover:bg-bg-card-hover text-text-muted hover:text-text-primary border border-border-color flex items-center justify-center transition-colors active:scale-95"
                title="Edit review"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(t.id, t.name)}
                className="w-9 h-9 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center transition-colors active:scale-95"
                title="Delete review"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: Add / Edit Testimonial */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-bg-card border border-border-color rounded-xl sm:rounded-2xl max-w-lg w-full p-4 sm:p-6 space-y-3.5 sm:space-y-4 shadow-xl text-text-primary max-h-[92vh] overflow-y-auto">
            <h3 className="text-base sm:text-lg font-bold text-text-primary">
              {editingId ? 'Edit Testimonial' : 'Add Client Testimonial'}
            </h3>

            <form onSubmit={handleSaveItem} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Client Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Role / Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Marketing Director"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Company / Brand</label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Media"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Rating (1 to 5 Stars)</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-rose-500 focus:outline-none"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                    <option value={3}>⭐⭐⭐ (3 Stars)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Avatar Image URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Review Quote</label>
                <textarea
                  rows={3}
                  required
                  placeholder="What did the client say about your work and turnaround time?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-color rounded-xl p-3 text-sm text-text-primary focus:border-rose-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Associated Project (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. YouTube Channel Rebrand & 4K Trailer"
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border-color">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold bg-bg-secondary hover:bg-bg-card-hover text-text-primary border border-border-color transition-colors active:scale-98"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[42px] px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-all active:scale-98"
                >
                  Save Testimonial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
