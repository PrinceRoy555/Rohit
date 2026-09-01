import React, { useState } from 'react';
import { useSiteConfig } from '../../../context/SiteConfigContext';
import { TestimonialItem } from '../../../types/cms';
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
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-indigo-400" />
            <span>Client Testimonials & Reviews</span>
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Showcase authentic client endorsements, star ratings, and project outcomes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/15 flex items-center gap-2 transition-all"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
              </>
            )}
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Testimonial</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className="p-6 rounded-2xl bg-neutral-900/80 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-11 h-11 rounded-full object-cover border border-white/15"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white">{t.name}</h4>
                    <p className="text-xs text-neutral-400">{t.role} • {t.company}</p>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 text-amber-400">
                  {Array.from({ length: t.rating || 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
              </div>

              <div className="mt-4 relative">
                <Quote className="w-6 h-6 text-white/10 absolute -top-2 -left-1" />
                <p className="text-xs sm:text-sm text-neutral-300 italic pl-5 leading-relaxed">
                  "{t.content}"
                </p>
              </div>

              {t.project && (
                <div className="mt-3 text-xs text-indigo-400 font-medium">
                  Project: {t.project}
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-end gap-2">
              <button
                onClick={() => handleOpenEdit(t)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white"
                title="Edit review"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(t.id, t.name)}
                className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-white/15 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">
              {editingId ? 'Edit Testimonial' : 'Add Client Testimonial'}
            </h3>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Client Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Role / Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Marketing Director"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Company / Brand</label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Media"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Rating (1 to 5 Stars)</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                    <option value={3}>⭐⭐⭐ (3 Stars)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Avatar Image URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Review Quote</label>
                <textarea
                  rows={3}
                  required
                  placeholder="What did the client say about your work and turnaround time?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Associated Project (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. YouTube Channel Rebrand & 4K Trailer"
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30"
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
