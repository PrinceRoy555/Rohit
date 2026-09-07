import React, { useState } from 'react';
import { useSiteConfig } from '../../../context/SiteConfigContext';
import { PortfolioItem } from '../../../types/cms';
import { PageHeader } from '../layout/PageHeader';
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
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="Portfolio Project Manager"
        description="Manage showcase case studies, motion reels, branding packages, and client work."
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
              <span>Add Project</span>
            </button>
          </div>
        }
      />

      {/* Category filter pills */}
      <div className="flex overflow-x-auto no-scrollbar sm:flex-wrap gap-1.5 sm:gap-2 pb-1">
        {['all', 'Graphic Design', 'Video Editing', 'Motion', 'Branding'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`flex-shrink-0 whitespace-nowrap min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-98 ${
              filterCategory === cat
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-bg-card text-text-muted hover:text-text-primary border border-border-color'
            }`}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
        {filteredPortfolio.map((item) => (
          <div
            key={item.id}
            className="bg-bg-card border border-border-color hover:border-rose-500/40 rounded-xl sm:rounded-2xl overflow-hidden transition-all flex flex-col justify-between group shadow-xs hover:shadow-sm"
          >
            <div>
              {/* Media Thumbnail */}
              <div className="relative h-44 w-full bg-black/10 dark:bg-black/60 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-black/75 backdrop-blur-md text-white border border-white/20">
                    {item.category}
                  </span>
                </div>
                <button
                  onClick={() => handleToggleFeatured(item.id)}
                  title={item.isFeatured ? 'Featured Project' : 'Mark as Featured'}
                  className={`absolute top-2.5 right-2.5 min-w-[36px] min-h-[36px] p-2 rounded-xl backdrop-blur-md transition-all flex items-center justify-center active:scale-95 ${
                    item.isFeatured
                      ? 'bg-amber-500 text-black shadow-xs'
                      : 'bg-black/60 text-white/70 hover:text-white'
                  }`}
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>

              {/* Details */}
              <div className="p-3.5 sm:p-5">
                <h4 className="text-sm sm:text-base font-bold text-text-primary group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-text-muted mt-1.5 line-clamp-2">{item.description}</p>

                {item.tools && item.tools.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {item.tools.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-bg-secondary text-text-secondary border border-border-color"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions Toolbar */}
            <div className="p-3.5 pt-2.5 border-t border-border-color flex items-center justify-between gap-2 text-xs">
              <span className="text-text-muted truncate text-[11px] sm:text-xs max-w-[120px] sm:max-w-[140px]">{item.client || 'Personal Project'}</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="min-h-[38px] px-3 py-1.5 rounded-xl bg-bg-secondary hover:bg-bg-card-hover text-text-secondary hover:text-text-primary border border-border-color flex items-center gap-1 transition-colors active:scale-95"
                  title="Edit project"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span className="text-xs">Edit</span>
                </button>
                <button
                  onClick={() => handleDuplicate(item)}
                  className="w-[38px] h-[38px] rounded-xl bg-bg-secondary hover:bg-bg-card-hover text-text-secondary hover:text-text-primary border border-border-color flex items-center justify-center transition-colors active:scale-95"
                  title="Duplicate project"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(item.id, item.title)}
                  className="w-[38px] h-[38px] rounded-xl bg-bg-secondary hover:bg-rose-500/10 text-text-muted hover:text-rose-600 dark:hover:text-rose-400 border border-border-color flex items-center justify-center transition-colors active:scale-95"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs">
          <div className="bg-bg-card border border-border-color rounded-xl sm:rounded-2xl max-w-xl w-full p-4 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto text-text-primary">
            <h3 className="text-base sm:text-lg font-bold text-text-primary">
              {editingItem ? 'Edit Project' : 'Add New Portfolio Project'}
            </h3>

            <form onSubmit={handleSaveItem} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Project Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Luxury Brand Rebrand & Social Campaign"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Category</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Graphic Design, Video Editing"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Client Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Unicivix Global"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Image Thumbnail URL</label>
                  <input
                    type="text"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Short Description</label>
                  <textarea
                    rows={3}
                    placeholder="Explain the project scope and key results..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-bg-secondary border border-border-color rounded-xl p-3 text-sm text-text-primary focus:border-rose-500 focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Tools / Software (comma separated)</label>
                  <input
                    type="text"
                    placeholder="Photoshop, Premiere Pro, Figma"
                    value={toolsStr}
                    onChange={(e) => setToolsStr(e.target.value)}
                    className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">External Link / Behance</label>
                  <input
                    type="text"
                    placeholder="https://behance.net/..."
                    value={externalLink}
                    onChange={(e) => setExternalLink(e.target.value)}
                    className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="featuredCheck"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded bg-bg-secondary border-border-color focus:ring-rose-500"
                />
                <label htmlFor="featuredCheck" className="text-xs font-semibold text-text-primary cursor-pointer">
                  Feature prominently on homepage
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-color">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold bg-bg-secondary hover:bg-bg-card-hover text-text-primary border border-border-color active:scale-98"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[42px] px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs active:scale-98"
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
