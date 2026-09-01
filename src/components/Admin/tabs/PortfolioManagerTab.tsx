import React, { useState } from 'react';
import { useSiteConfig } from '../../../context/SiteConfigContext';
import { PortfolioItem } from '../../../types/cms';
import {
  Briefcase,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Star,
  ExternalLink,
  Save,
  Check,
  Image as ImageIcon
} from 'lucide-react';

export const PortfolioManagerTab: React.FC = () => {
  const { draftConfig, updateDraft, saveDraft, isSaving } = useSiteConfig();
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Graphic Design');
  const [description, setDescription] = useState('');
  const [client, setClient] = useState('');
  const [year, setYear] = useState('2025');
  const [image, setImage] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [toolsStr, setToolsStr] = useState('');
  const [externalLink, setExternalLink] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  const portfolio = draftConfig.portfolio || [];

  const handleOpenAdd = () => {
    setTitle('');
    setCategory('Graphic Design');
    setDescription('');
    setClient('');
    setYear(new Date().getFullYear().toString());
    setImage('');
    setVideoUrl('');
    setToolsStr('Photoshop, Illustrator');
    setExternalLink('');
    setIsFeatured(false);
    setEditingItem(null);
    setIsAddingNew(true);
  };

  const handleOpenEdit = (item: PortfolioItem) => {
    setTitle(item.title);
    setCategory(item.category);
    setDescription(item.description);
    setClient(item.client || '');
    setYear(item.year || '');
    setImage(item.image);
    setVideoUrl(item.videoUrl || '');
    setToolsStr(item.tools ? item.tools.join(', ') : '');
    setExternalLink(item.externalLink || '');
    setIsFeatured(Boolean(item.isFeatured));
    setEditingItem(item);
    setIsAddingNew(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const toolsArray = toolsStr
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const itemData: PortfolioItem = {
      id: editingItem ? editingItem.id : `proj-${Date.now()}`,
      title: title.trim(),
      category: category.trim(),
      description: description.trim(),
      image: image.trim() || 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=800&q=80',
      client: client.trim(),
      year: year.trim(),
      tools: toolsArray,
      videoUrl: videoUrl.trim() || undefined,
      externalLink: externalLink.trim() || undefined,
      isFeatured
    };

    if (editingItem) {
      updateDraft((prev) => ({
        ...prev,
        portfolio: (prev.portfolio || []).map((p) => (p.id === editingItem.id ? itemData : p))
      }));
    } else {
      updateDraft((prev) => ({
        ...prev,
        portfolio: [itemData, ...(prev.portfolio || [])]
      }));
    }

    setIsAddingNew(false);
    setEditingItem(null);
  };

  const handleDelete = (id: string, itemTitle: string) => {
    if (!window.confirm(`Delete project "${itemTitle}"?`)) return;
    updateDraft((prev) => ({
      ...prev,
      portfolio: (prev.portfolio || []).filter((p) => p.id !== id)
    }));
  };

  const handleDuplicate = (item: PortfolioItem) => {
    const duplicated: PortfolioItem = {
      ...item,
      id: `proj-${Date.now()}`,
      title: `${item.title} (Copy)`
    };
    updateDraft((prev) => ({
      ...prev,
      portfolio: [duplicated, ...(prev.portfolio || [])]
    }));
  };

  const handleToggleFeatured = (id: string) => {
    updateDraft((prev) => ({
      ...prev,
      portfolio: (prev.portfolio || []).map((p) =>
        p.id === id ? { ...p, isFeatured: !p.isFeatured } : p
      )
    }));
  };

  const handleSave = async () => {
    const success = await saveDraft();
    if (success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const filteredPortfolio =
    filterCategory === 'all'
      ? portfolio
      : portfolio.filter((p) => p.category.toLowerCase().includes(filterCategory.toLowerCase()));

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-rose-500" />
            <span>Portfolio Project Manager</span>
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Manage showcase case studies, motion reels, branding packages, and client work.
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
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Project</span>
          </button>
        </div>
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2">
        {['all', 'Graphic Design', 'Video Editing', 'Motion', 'Branding'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterCategory === cat
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-white/10'
            }`}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPortfolio.map((item) => (
          <div
            key={item.id}
            className="bg-neutral-900/80 border border-white/10 hover:border-white/20 rounded-2xl overflow-hidden transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Media Thumbnail */}
              <div className="relative h-44 w-full bg-black/60 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-black/70 backdrop-blur-md text-white border border-white/20">
                    {item.category}
                  </span>
                </div>
                <button
                  onClick={() => handleToggleFeatured(item.id)}
                  title={item.isFeatured ? 'Featured Project' : 'Mark as Featured'}
                  className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all ${
                    item.isFeatured
                      ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
                      : 'bg-black/60 text-white/60 hover:text-white'
                  }`}
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>

              {/* Details */}
              <div className="p-5">
                <h4 className="text-base font-bold text-white group-hover:text-rose-400 transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-neutral-400 mt-2 line-clamp-2">{item.description}</p>

                {item.tools && item.tools.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {item.tools.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/5 text-neutral-300 border border-white/5"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions Toolbar */}
            <div className="p-4 pt-0 border-t border-white/5 flex items-center justify-between gap-2 text-xs">
              <span className="text-neutral-500">{item.client || 'Personal Project'}</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white"
                  title="Edit project"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDuplicate(item)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white"
                  title="Duplicate project"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(item.id, item.title)}
                  className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                  title="Delete project"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: Add / Edit Project */}
      {isAddingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-white/15 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white">
              {editingItem ? 'Edit Project' : 'Add New Portfolio Project'}
            </h3>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Project Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Luxury Brand Rebrand & Social Campaign"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Graphic Design, Video Editing"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Client Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Unicivix Global"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Image Thumbnail URL</label>
                  <input
                    type="text"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Short Description</label>
                  <textarea
                    rows={3}
                    placeholder="Explain the project scope and key results..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Tools / Software (comma separated)</label>
                  <input
                    type="text"
                    placeholder="Photoshop, Premiere Pro, Figma"
                    value={toolsStr}
                    onChange={(e) => setToolsStr(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">External Link / Behance</label>
                  <input
                    type="text"
                    placeholder="https://behance.net/..."
                    value={externalLink}
                    onChange={(e) => setExternalLink(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="featuredCheck"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded bg-black/40 border-white/20 focus:ring-rose-500"
                />
                <label htmlFor="featuredCheck" className="text-xs font-semibold text-white cursor-pointer">
                  Feature prominently on homepage
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30"
                >
                  {editingItem ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
