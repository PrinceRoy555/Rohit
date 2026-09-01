import React, { useState } from 'react';
import { useSiteConfig } from '../../../context/SiteConfigContext';
import { ServiceItem, PricingTierItem } from '../../../types/cms';
import {
  Wrench,
  CreditCard,
  Plus,
  Trash2,
  Edit2,
  Save,
  Check,
  Star,
  CheckCircle2
} from 'lucide-react';

export const ServicesPricingTab: React.FC = () => {
  const { draftConfig, updateDraft, saveDraft, isSaving } = useSiteConfig();
  const [activeSubTab, setActiveSubTab] = useState<'services' | 'pricing'>('services');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Editing Service State
  const [isEditingService, setIsEditingService] = useState(false);
  const [currentServiceId, setCurrentServiceId] = useState<string | null>(null);
  const [serviceTitle, setServiceTitle] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');
  const [serviceIcon, setServiceIcon] = useState('Palette');
  const [servicePrice, setServicePrice] = useState('$499+');
  const [serviceFeatures, setServiceFeatures] = useState('');

  // Editing Pricing Tier State
  const [isEditingPricing, setIsEditingPricing] = useState(false);
  const [currentPricingId, setCurrentPricingId] = useState<string | null>(null);
  const [tierName, setTierName] = useState('');
  const [tierPrice, setTierPrice] = useState('$999');
  const [tierPeriod, setTierPeriod] = useState('/project');
  const [tierDesc, setTierDesc] = useState('');
  const [tierFeatures, setTierFeatures] = useState('');
  const [tierIsPopular, setTierIsPopular] = useState(false);
  const [tierCtaText, setTierCtaText] = useState('Get Started');

  const services = draftConfig.services || [];
  const pricing = draftConfig.pricing || [];

  const handleOpenAddService = () => {
    setCurrentServiceId(null);
    setServiceTitle('');
    setServiceDesc('');
    setServiceIcon('Palette');
    setServicePrice('Custom Quote');
    setServiceFeatures('Creative Concept, 3 Revisions, Source Files');
    setIsEditingService(true);
  };

  const handleOpenEditService = (s: ServiceItem) => {
    setCurrentServiceId(s.id);
    setServiceTitle(s.title);
    setServiceDesc(s.description);
    setServiceIcon(s.icon || 'Palette');
    setServicePrice(s.priceStartingAt || '');
    setServiceFeatures(s.features ? s.features.join(', ') : '');
    setIsEditingService(true);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceTitle.trim()) return;

    const featArr = serviceFeatures.split(',').map((f) => f.trim()).filter(Boolean);

    const item: ServiceItem = {
      id: currentServiceId || `srv-${Date.now()}`,
      title: serviceTitle.trim(),
      description: serviceDesc.trim(),
      icon: serviceIcon.trim(),
      priceStartingAt: servicePrice.trim(),
      features: featArr
    };

    if (currentServiceId) {
      updateDraft((prev) => ({
        ...prev,
        services: (prev.services || []).map((s) => (s.id === currentServiceId ? item : s))
      }));
    } else {
      updateDraft((prev) => ({
        ...prev,
        services: [...(prev.services || []), item]
      }));
    }

    setIsEditingService(false);
    setCurrentServiceId(null);
  };

  const handleDeleteService = (id: string) => {
    if (!window.confirm('Delete this service?')) return;
    updateDraft((prev) => ({
      ...prev,
      services: (prev.services || []).filter((s) => s.id !== id)
    }));
  };

  // Pricing Handlers
  const handleOpenAddPricing = () => {
    setCurrentPricingId(null);
    setTierName('');
    setTierPrice('$499');
    setTierPeriod('/project');
    setTierDesc('');
    setTierFeatures('Feature 1, Feature 2, Feature 3');
    setTierIsPopular(false);
    setTierCtaText('Choose Plan');
    setIsEditingPricing(true);
  };

  const handleOpenEditPricing = (p: PricingTierItem) => {
    setCurrentPricingId(p.id);
    setTierName(p.name);
    setTierPrice(p.price);
    setTierPeriod(p.period || '/project');
    setTierDesc(p.description);
    setTierFeatures(p.features ? p.features.join(', ') : '');
    setTierIsPopular(Boolean(p.isPopular));
    setTierCtaText(p.ctaText || 'Get Started');
    setIsEditingPricing(true);
  };

  const handleSavePricing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tierName.trim()) return;

    const featArr = tierFeatures.split(',').map((f) => f.trim()).filter(Boolean);

    const item: PricingTierItem = {
      id: currentPricingId || `prc-${Date.now()}`,
      name: tierName.trim(),
      price: tierPrice.trim(),
      period: tierPeriod.trim(),
      description: tierDesc.trim(),
      features: featArr,
      isPopular: tierIsPopular,
      ctaText: tierCtaText.trim()
    };

    if (currentPricingId) {
      updateDraft((prev) => ({
        ...prev,
        pricing: (prev.pricing || []).map((p) => (p.id === currentPricingId ? item : p))
      }));
    } else {
      updateDraft((prev) => ({
        ...prev,
        pricing: [...(prev.pricing || []), item]
      }));
    }

    setIsEditingPricing(false);
    setCurrentPricingId(null);
  };

  const handleDeletePricing = (id: string) => {
    if (!window.confirm('Delete this pricing tier?')) return;
    updateDraft((prev) => ({
      ...prev,
      pricing: (prev.pricing || []).filter((p) => p.id !== id)
    }));
  };

  const handleSaveDraft = async () => {
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
            <Wrench className="w-6 h-6 text-amber-500" />
            <span>Services & Pricing Tiers</span>
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Configure client service offerings, feature breakdowns, and package pricing.
          </p>
        </div>

        <button
          onClick={handleSaveDraft}
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
          onClick={() => setActiveSubTab('services')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeSubTab === 'services'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Creative Services ({services.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('pricing')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeSubTab === 'pricing'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Pricing Packages ({pricing.length})</span>
        </button>
      </div>

      {/* SERVICES SUB-TAB */}
      {activeSubTab === 'services' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Active Service Offerings</h3>
            <button
              onClick={handleOpenAddService}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Service</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((s) => (
              <div
                key={s.id}
                className="p-5 rounded-2xl bg-neutral-900/80 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-white">{s.title}</h4>
                    {s.priceStartingAt && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {s.priceStartingAt}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 mt-2">{s.description}</p>

                  {s.features && (
                    <ul className="mt-3 space-y-1">
                      {s.features.map((f, idx) => (
                        <li key={idx} className="text-xs text-neutral-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEditService(s)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteService(s.id)}
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

      {/* PRICING SUB-TAB */}
      {activeSubTab === 'pricing' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Pricing & Retainer Packages</h3>
            <button
              onClick={handleOpenAddPricing}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Package</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pricing.map((p) => (
              <div
                key={p.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between relative ${
                  p.isPopular
                    ? 'bg-neutral-900 border-amber-500/60 ring-1 ring-amber-500/40 shadow-xl'
                    : 'bg-neutral-900/80 border-white/10'
                }`}
              >
                <div>
                  {p.isPopular && (
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-black mb-3">
                      MOST POPULAR
                    </span>
                  )}
                  <h4 className="text-lg font-bold text-white">{p.name}</h4>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white">{p.price}</span>
                    <span className="text-xs text-neutral-400">{p.period}</span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-2">{p.description}</p>

                  <ul className="mt-4 space-y-1.5 border-t border-white/5 pt-3">
                    {(p.features || []).map((f, idx) => (
                      <li key={idx} className="text-xs text-neutral-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-neutral-400 font-medium">{p.ctaText || 'Get Started'}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditPricing(p)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePricing(p.id)}
                      className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: Service Edit */}
      {isEditingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-white/15 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">
              {currentServiceId ? 'Edit Service' : 'Add Creative Service'}
            </h3>

            <form onSubmit={handleSaveService} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Service Title</label>
                <input
                  type="text"
                  required
                  value={serviceTitle}
                  onChange={(e) => setServiceTitle(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Starting Price Tag</label>
                <input
                  type="text"
                  placeholder="e.g. $499+ / project"
                  value={servicePrice}
                  onChange={(e) => setServicePrice(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={serviceDesc}
                  onChange={(e) => setServiceDesc(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Key Deliverables (comma separated)</label>
                <input
                  type="text"
                  value={serviceFeatures}
                  onChange={(e) => setServiceFeatures(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingService(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/30"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Pricing Edit */}
      {isEditingPricing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-white/15 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">
              {currentPricingId ? 'Edit Package' : 'Add Pricing Package'}
            </h3>

            <form onSubmit={handleSavePricing} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Package Name</label>
                  <input
                    type="text"
                    required
                    value={tierName}
                    onChange={(e) => setTierName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Price</label>
                  <input
                    type="text"
                    required
                    value={tierPrice}
                    onChange={(e) => setTierPrice(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Billing Period</label>
                  <input
                    type="text"
                    value={tierPeriod}
                    onChange={(e) => setTierPeriod(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Short Summary</label>
                <input
                  type="text"
                  value={tierDesc}
                  onChange={(e) => setTierDesc(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Included Features (comma separated)</label>
                <textarea
                  rows={3}
                  value={tierFeatures}
                  onChange={(e) => setTierFeatures(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="popularCheck"
                  checked={tierIsPopular}
                  onChange={(e) => setTierIsPopular(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded bg-black/40 border-white/20 focus:ring-amber-500"
                />
                <label htmlFor="popularCheck" className="text-xs font-semibold text-white cursor-pointer">
                  Mark as "Most Popular" Tier
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingPricing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/30"
                >
                  Save Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
