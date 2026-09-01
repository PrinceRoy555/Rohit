import React, { useState, useEffect } from 'react';
import { MediaItem } from '../../../types/cms';
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
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <ImageIcon className="w-6 h-6 text-rose-500" />
            <span>Media Assets & Image Library</span>
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Store and organize high-resolution images, brand vectors, logos, and video thumbnails.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Media Asset</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search media files by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-900/80 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white focus:border-rose-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {['all', 'branding', 'portfolio', 'marketing'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                filterCategory === cat
                  ? 'bg-rose-600 text-white'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-12 text-center text-neutral-400 text-sm">Loading media assets...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-neutral-900/40 border border-white/10 rounded-2xl">
          <ImageIcon className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white">No media items found</h4>
          <p className="text-xs text-neutral-400 mt-1">Add your first image URL to store it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item) => {
            const isCopied = copiedId === item.id;
            return (
              <div
                key={item.id}
                className="bg-neutral-900/80 border border-white/10 hover:border-white/20 rounded-2xl overflow-hidden transition-all flex flex-col justify-between group"
              >
                <div className="relative h-36 w-full bg-black/60 overflow-hidden">
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/70 backdrop-blur-md text-white border border-white/20 capitalize">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="p-3">
                  <h4 className="text-xs font-bold text-white truncate" title={item.name}>
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-neutral-500 truncate mt-0.5 font-mono">
                    {item.url}
                  </p>
                </div>

                <div className="p-3 pt-0 flex items-center justify-between gap-1.5 border-t border-white/5">
                  <button
                    onClick={() => handleCopyUrl(item)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                      isCopied
                        ? 'bg-emerald-500 text-black'
                        : 'bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white'
                    }`}
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Copied' : 'Copy URL'}</span>
                  </button>

                  <button
                    onClick={() => handleDelete(item.id, item.name)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-white/15 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Add Media Asset</h3>

            <form onSubmit={handleAddMedia} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Asset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Agency Hero Header Dark"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Image URL</label>
                <input
                  type="text"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
                >
                  <option value="portfolio">Portfolio</option>
                  <option value="branding">Branding</option>
                  <option value="marketing">Marketing</option>
                  <option value="social">Social Media</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. 4k, mockup, dark-theme"
                  value={tagsStr}
                  onChange={(e) => setTagsStr(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30"
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
