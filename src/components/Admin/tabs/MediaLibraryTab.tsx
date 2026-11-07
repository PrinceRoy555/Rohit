import React, { useState, useEffect } from 'react';
import { MediaItem } from '../../../types/cms';
import { PageHeader } from '../layout/PageHeader';
import {
  fetchMediaItems,
  uploadMediaItem,
  deleteMediaItem
} from '../../../services/cmsApi';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Upload,
  Search,
  Filter
} from 'lucide-react';

export const MediaLibraryTab: React.FC = () => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Form
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('portfolio');
  const [tagsStr, setTagsStr] = useState('');

  const loadMedia = async () => {
    setLoading(true);
    const res = await fetchMediaItems();
    if (res.success && res.media) {
      setItems(res.media);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;

    const res = await uploadMediaItem({
      name: name.trim(),
      url: url.trim(),
      category: category.trim(),
    });

    if (res.success && res.item) {
      setItems((prev) => [res.item!, ...prev]);
      setIsAddModalOpen(false);
      setName('');
      setUrl('');
      setTagsStr('');
    }
  };

  const handleDelete = async (id: string, mediaName: string) => {
    if (!window.confirm(`Delete media asset "${mediaName}"?`)) return;
    const res = await deleteMediaItem(id);
    if (res.success) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleCopyUrl = (item: MediaItem) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="Media Assets & Image Library"
        description="Store and organize high-resolution images, brand vectors, logos, and video thumbnails."
        actions={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="h-9 px-3.5 rounded-lg text-xs font-semibold bg-accent-primary hover:bg-accent-secondary text-white flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer select-none"
          >
            <Plus className="w-4 h-4" />
            <span>Add Media Asset</span>
          </button>
        }
      />

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search media files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-h-[42px] bg-bg-card border border-border-color rounded-xl pl-9 pr-3.5 py-2 text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none"
          />
        </div>

        <div className="flex overflow-x-auto no-scrollbar gap-1.5 sm:gap-2 pb-0.5 sm:pb-0">
          {['all', 'branding', 'portfolio', 'marketing'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`flex-shrink-0 whitespace-nowrap min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all active:scale-98 ${
                filterCategory === cat
                  ? 'bg-accent-primary text-white shadow-xs'
                  : 'bg-bg-card text-text-secondary hover:text-text-primary border border-border-color hover:bg-bg-secondary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-8 sm:p-12 text-center text-text-muted text-xs sm:text-sm">Loading media assets...</div>
      ) : filtered.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-bg-card border border-border-color rounded-xl sm:rounded-2xl">
          <ImageIcon className="w-8 sm:w-10 h-8 sm:h-10 text-text-muted mx-auto mb-2 sm:mb-3 opacity-60" />
          <h4 className="text-sm sm:text-base font-bold text-text-primary">No media items found</h4>
          <p className="text-xs text-text-muted mt-1">Add your first image URL to store it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filtered.map((item) => {
            const isCopied = copiedId === item.id;
            return (
              <div
                key={item.id}
                className="bg-bg-card border border-border-color hover:border-accent-primary/40 rounded-xl sm:rounded-2xl overflow-hidden transition-all flex flex-col justify-between group shadow-xs"
              >
                <div className="relative h-36 sm:h-40 w-full bg-black/10 dark:bg-black/60 overflow-hidden">
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/75 backdrop-blur-md text-white border border-white/20 capitalize">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="p-3">
                  <h4 className="text-xs font-bold text-text-primary truncate" title={item.name}>
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-text-muted truncate mt-0.5 font-mono">
                    {item.url}
                  </p>
                </div>

                <div className="p-3 pt-0 flex items-center justify-between gap-1.5 border-t border-border-color">
                  <button
                    onClick={() => handleCopyUrl(item)}
                    className={`flex-1 min-h-[38px] py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all active:scale-98 ${
                      isCopied
                        ? 'bg-emerald-500 text-black'
                        : 'bg-bg-secondary hover:bg-bg-card-hover text-text-secondary hover:text-text-primary border border-border-color'
                    }`}
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Copied' : 'Copy URL'}</span>
                  </button>

                  <button
                    onClick={() => handleDelete(item.id, item.name)}
                    className="min-w-[38px] min-h-[38px] p-1.5 rounded-xl bg-bg-secondary hover:bg-accent-primary/10 text-text-muted hover:text-accent-primary dark:hover:text-accent-primary border border-border-color flex items-center justify-center active:scale-95"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Add Media */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs">
          <div className="bg-bg-card border border-border-color rounded-xl sm:rounded-2xl max-w-md w-full p-4 sm:p-6 space-y-3.5 sm:space-y-4 shadow-xl max-h-[92vh] overflow-y-auto text-text-primary">
            <h3 className="text-base sm:text-lg font-bold text-text-primary">Add Media Asset</h3>

            <form onSubmit={handleAddMedia} className="space-y-3.5 sm:space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Asset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Agency Hero Header Dark"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Image URL</label>
                <input
                  type="text"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                >
                  <option value="portfolio">Portfolio</option>
                  <option value="branding">Branding</option>
                  <option value="marketing">Marketing</option>
                  <option value="social">Social Media</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. 4k, mockup, dark-theme"
                  value={tagsStr}
                  onChange={(e) => setTagsStr(e.target.value)}
                  className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border-color">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold bg-bg-secondary hover:bg-bg-card-hover text-text-primary border border-border-color active:scale-98"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[42px] px-5 py-2 rounded-xl text-xs font-semibold bg-accent-primary hover:bg-accent-secondary text-white shadow-xs active:scale-98"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
