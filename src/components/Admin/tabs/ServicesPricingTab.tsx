import React, { useState } from 'react';
import { useSiteConfig } from '../../../context/SiteConfigContext';
import { ServiceItem, PricingTierItem } from '../../../types/cms';
import { PageHeader } from '../layout/PageHeader';
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
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Services & Pricing Tiers"
        description="Configure client service offerings, feature breakdowns, and package pricing."
        actions={
          <button
            onClick={handleSaveDraft}
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
      <div className="flex overflow-x-auto no-scrollbar items-center gap-1.5 sm:gap-2 p-1.5 bg-bg-card border border-border-color rounded-xl sm:rounded-2xl">
        <button
          onClick={() => setActiveSubTab('services')}
          className={`flex-shrink-0 whitespace-nowrap min-h-[38px] flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all active:scale-98 ${
            activeSubTab === 'services'
              ? 'bg-accent-primary text-white shadow-xs'
              : 'text-text-muted hover:text-text-primary hover:bg-bg-secondary'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Creative Services ({services.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('pricing')}
          className={`flex-shrink-0 whitespace-nowrap min-h-[38px] flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all active:scale-98 ${
            activeSubTab === 'pricing'
              ? 'bg-accent-primary text-white shadow-xs'
              : 'text-text-muted hover:text-text-primary hover:bg-bg-secondary'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Pricing Packages ({pricing.length})</span>
        </button>
      </div>

      {/* SERVICES SUB-TAB */}
      {activeSubTab === 'services' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-text-primary">Active Service Offerings</h3>
            <button
              onClick={handleOpenAddService}
              className="min-h-[38px] px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-semibold bg-accent-primary hover:bg-accent-secondary text-white shadow-xs flex items-center gap-1.5 active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Add Service</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
            {services.map((s) => (
              <div
                key={s.id}
                className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-bg-card border border-border-color hover:border-accent-primary/30 transition-all flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm sm:text-base font-bold text-text-primary">{s.title}</h4>
                    {s.priceStartingAt && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-accent-primary/10 text-accent-primary border border-accent-primary/20 flex-shrink-0">
                        {s.priceStartingAt}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted mt-1.5">{s.description}</p>

                  {s.features && (
                    <ul className="mt-3 space-y-1">
                      {s.features.map((f, idx) => (
                        <li key={idx} className="text-xs text-text-secondary flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-accent-primary flex-shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-border-color flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => handleOpenEditService(s)}
                    className="w-[38px] h-[38px] rounded-xl bg-bg-secondary hover:bg-bg-card-hover text-text-muted hover:text-text-primary border border-border-color flex items-center justify-center transition-colors active:scale-95"
                    title="Edit Service"
                    aria-label="Edit Service"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteService(s.id)}
                    className="w-[38px] h-[38px] rounded-xl bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary border border-accent-primary/20 flex items-center justify-center transition-colors active:scale-95"
                    title="Delete Service"
                    aria-label="Delete Service"
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
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-text-primary">Pricing & Retainer Packages</h3>
            <button
              onClick={handleOpenAddPricing}
              className="min-h-[38px] px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-semibold bg-accent-primary hover:bg-accent-secondary text-white shadow-xs flex items-center gap-1.5 active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Add Package</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
            {pricing.map((p) => (
              <div
                key={p.id}
                className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl border transition-all flex flex-col justify-between relative shadow-xs ${
                  p.isPopular
                    ? 'bg-bg-card border-accent-primary ring-1 ring-accent-primary/30'
                    : 'bg-bg-card border-border-color hover:border-accent-primary/30'
                }`}
              >
                <div>
                  {p.isPopular && (
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-accent-primary text-white mb-2.5 shadow-xs">
                      MOST POPULAR
                    </span>
                  )}
                  <h4 className="text-base sm:text-lg font-bold text-text-primary">{p.name}</h4>
                  <div className="mt-1.5 flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-black text-text-primary">{p.price}</span>
                    <span className="text-xs text-text-muted">{p.period}</span>
                  </div>
                  <p className="text-xs text-text-muted mt-1.5">{p.description}</p>

                  <ul className="mt-3.5 space-y-1.5 border-t border-border-color pt-3">
                    {(p.features || []).map((f, idx) => (
                      <li key={idx} className="text-xs text-text-secondary flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-accent-primary flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 pt-3 border-t border-border-color flex items-center justify-between">
                  <span className="text-xs text-text-muted font-medium">{p.ctaText || 'Get Started'}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditPricing(p)}
                      className="w-[38px] h-[38px] rounded-xl bg-bg-secondary hover:bg-bg-card-hover text-text-muted hover:text-text-primary border border-border-color flex items-center justify-center transition-colors active:scale-95"
                      title="Edit Package"
                      aria-label="Edit Package"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePricing(p.id)}
                      className="w-[38px] h-[38px] rounded-xl bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary border border-accent-primary/20 flex items-center justify-center transition-colors active:scale-95"
                      title="Delete Package"
                      aria-label="Delete Package"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs">
          <div className="bg-bg-card border border-border-color rounded-xl sm:rounded-2xl max-w-md w-full p-4 sm:p-6 space-y-3.5 shadow-2xl text-text-primary max-h-[92vh] overflow-y-auto">
            <h3 className="text-base sm:text-lg font-bold text-text-primary">
              {currentServiceId ? 'Edit Service' : 'Add Creative Service'}
            </h3>

            <form onSubmit={handleSaveService} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Service Title</label>
                <input
                  type="text"
                  required
                  value={serviceTitle}
                  onChange={(e) => setServiceTitle(e.target.value)}
                  className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Starting Price Tag</label>
                <input
                  type="text"
                  placeholder="e.g. $499+ / project"
                  value={servicePrice}
                  onChange={(e) => setServicePrice(e.target.value)}
                  className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Description</label>
                <textarea
                  rows={3}
                  value={serviceDesc}
                  onChange={(e) => setServiceDesc(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-color rounded-xl p-3 text-sm text-text-primary focus:border-accent-primary focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Key Deliverables (comma separated)</label>
                <input
                  type="text"
                  value={serviceFeatures}
                  onChange={(e) => setServiceFeatures(e.target.value)}
                  className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border-color">
                <button
                  type="button"
                  onClick={() => setIsEditingService(false)}
                  className="min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold bg-bg-secondary hover:bg-bg-card-hover text-text-primary border border-border-color transition-colors active:scale-98"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[42px] px-5 py-2 rounded-xl text-xs font-semibold bg-accent-primary hover:bg-accent-secondary text-white shadow-xs transition-all active:scale-98"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs">
          <div className="bg-bg-card border border-border-color rounded-xl sm:rounded-2xl max-w-md w-full p-4 sm:p-6 space-y-3.5 shadow-2xl text-text-primary max-h-[92vh] overflow-y-auto">
            <h3 className="text-base sm:text-lg font-bold text-text-primary">
              {currentPricingId ? 'Edit Package' : 'Add Pricing Package'}
            </h3>

            <form onSubmit={handleSavePricing} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Package Name</label>
                  <input
                    type="text"
                    required
                    value={tierName}
                    onChange={(e) => setTierName(e.target.value)}
                    className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Price</label>
                  <input
                    type="text"
                    required
                    value={tierPrice}
                    onChange={(e) => setTierPrice(e.target.value)}
                    className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Billing Period</label>
                  <input
                    type="text"
                    value={tierPeriod}
                    onChange={(e) => setTierPeriod(e.target.value)}
                    className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Short Summary</label>
                <input
                  type="text"
                  value={tierDesc}
                  onChange={(e) => setTierDesc(e.target.value)}
                  className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Included Features (comma separated)</label>
                <textarea
                  rows={3}
                  value={tierFeatures}
                  onChange={(e) => setTierFeatures(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-color rounded-xl p-3 text-xs text-text-primary focus:border-accent-primary focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="popularCheck"
                  checked={tierIsPopular}
                  onChange={(e) => setTierIsPopular(e.target.checked)}
                  className="w-4 h-4 text-accent-primary rounded bg-bg-secondary border-border-color focus:ring-accent-primary"
                />
                <label htmlFor="popularCheck" className="text-xs font-semibold text-text-primary cursor-pointer">
                  Mark as &quot;Most Popular&quot; Tier
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border-color">
                <button
                  type="button"
                  onClick={() => setIsEditingPricing(false)}
                  className="min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold bg-bg-secondary hover:bg-bg-card-hover text-text-primary border border-border-color transition-colors active:scale-98"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[42px] px-5 py-2 rounded-xl text-xs font-semibold bg-accent-primary hover:bg-accent-secondary text-white shadow-xs transition-all active:scale-98"
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
