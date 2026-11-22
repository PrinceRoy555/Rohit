import React, { useState, useEffect } from 'react';
import { CrmFreelancer, CrmFreelancerStatus } from '../../../../types/crm';
import { findDuplicateFreelancer, saveStoredFreelancer, saveFreelancerWithCloud, normalizePhoneNumber } from '../../../../services/crmStorageService';
import {
  X,
  User,
  Phone,
  Mail,
  Briefcase,
  Globe,
  Tag,
  AlertTriangle,
  Sparkles,
  CheckCircle,
  CreditCard,
  DollarSign,
  Star,
  FileText
} from 'lucide-react';

interface AddFreelancerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFreelancerSaved: (freelancer: CrmFreelancer) => void;
  onSelectExistingFreelancer?: (freelancer: CrmFreelancer) => void;
  initialFreelancer?: CrmFreelancer | null;
  defaultToWhatsApp?: boolean;
}

const COMMON_SKILLS = [
  'Premiere Pro',
  'After Effects',
  'DaVinci Resolve',
  'Color Grading',
  'Cinema 4D',
  'Blender',
  '3D Motion',
  'Figma',
  'UI/UX Design',
  'Webflow',
  'Graphic Design',
  'Brand Guidelines',
  'Sound Design',
  'YouTube Reels'
];

export const AddFreelancerModal: React.FC<AddFreelancerModalProps> = ({
  isOpen,
  onClose,
  onFreelancerSaved,
  onSelectExistingFreelancer,
  initialFreelancer,
  defaultToWhatsApp = false
}) => {
  const isEditing = Boolean(initialFreelancer);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [status, setStatus] = useState<CrmFreelancerStatus>('available');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['Video Editing']);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [hourlyRate, setHourlyRate] = useState<number | ''>('');
  const [fixedRateDefault, setFixedRateDefault] = useState<number | ''>('');
  const [agreedAmount, setAgreedAmount] = useState<number | ''>('');
  const [paidAmount, setPaidAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [notes, setNotes] = useState('');

  // UI & Validation State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState<{
    isDuplicate: boolean;
    matchedFreelancer?: CrmFreelancer;
    reason?: string;
  }>({ isDuplicate: false });

  // Sync state when opening modal or editing
  useEffect(() => {
    if (initialFreelancer) {
      setName(initialFreelancer.name || '');
      setPhone(initialFreelancer.phone || '');
      setEmail(initialFreelancer.email || '');
      setWhatsapp(initialFreelancer.whatsapp || initialFreelancer.phone || '');
      setSpecialty(initialFreelancer.specialty || '');
      setPortfolioUrl(initialFreelancer.portfolioUrl || '');
      setStatus(initialFreelancer.status || 'available');
      setSelectedSkills(initialFreelancer.skills || ['Video Editing']);
      setHourlyRate(initialFreelancer.hourlyRate ?? '');
      setFixedRateDefault(initialFreelancer.fixedRateDefault ?? '');
      setAgreedAmount(initialFreelancer.agreedAmount ?? '');
      setPaidAmount(initialFreelancer.paidAmount ?? '');
      setPaymentMethod(initialFreelancer.paymentMethod || '');
      setRating(initialFreelancer.rating || 5);
      setNotes(initialFreelancer.notes || '');
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setWhatsapp('');
      setSpecialty('');
      setPortfolioUrl('');
      setStatus('available');
      setSelectedSkills(['Video Editing']);
      setHourlyRate('');
      setFixedRateDefault('');
      setAgreedAmount('');
      setPaidAmount('');
      setPaymentMethod('');
      setRating(5);
      setNotes('');
    }
    setErrors({});
    setDuplicateInfo({ isDuplicate: false });
  }, [initialFreelancer, isOpen]);

  // Real-time Duplicate Detection
  useEffect(() => {
    if (!isOpen) return;

    if (!phone && !email) {
      setDuplicateInfo({ isDuplicate: false });
      return;
    }

    const check = findDuplicateFreelancer(phone, email, initialFreelancer?.id);
    setDuplicateInfo(check);
  }, [phone, email, initialFreelancer?.id, isOpen]);

  if (!isOpen) return null;

  const handleToggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddCustomSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customSkillInput.trim()) {
      e.preventDefault();
      const val = customSkillInput.trim();
      if (!selectedSkills.includes(val)) {
        setSelectedSkills([...selectedSkills, val]);
      }
      setCustomSkillInput('');
    }
  };

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!name.trim()) {
      errs.name = 'Full name is required.';
    }

    const cleanPhone = normalizePhoneNumber(phone);
    if (!phone.trim()) {
      errs.phone = 'Phone number is required for WhatsApp communication.';
    } else if (cleanPhone.length < 10) {
      errs.phone = 'Please provide a valid 10-digit Indian phone number.';
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please provide a valid email address.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const cleanPhone = normalizePhoneNumber(phone);
      const cleanWhatsApp = whatsapp.trim() ? normalizePhoneNumber(whatsapp) : cleanPhone;

      const agreedVal = agreedAmount === '' ? 0 : Number(agreedAmount);
      const paidVal = paidAmount === '' ? 0 : Number(paidAmount);
      const balanceVal = Math.max(0, agreedVal - paidVal);

      const result = await saveFreelancerWithCloud({
        id: initialFreelancer?.id,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        whatsapp: cleanWhatsApp,
        specialty: specialty.trim() || 'Creative Specialist',
        skills: selectedSkills.length > 0 ? selectedSkills : ['Creative Design'],
        portfolioUrl: portfolioUrl.trim() || undefined,
        status,
        rating,
        hourlyRate: hourlyRate === '' ? 0 : Number(hourlyRate),
        fixedRateDefault: fixedRateDefault === '' ? 0 : Number(fixedRateDefault),
        agreedAmount: agreedVal,
        paidAmount: paidVal,
        pendingBalance: balanceVal,
        paymentStatus: balanceVal === 0 && paidVal > 0 ? 'paid' : paidVal > 0 ? 'partial' : 'pending',
        paymentMethod: paymentMethod.trim() || undefined,
        notes: notes.trim() || undefined
      });

      if (!result.success) {
        setErrors({ form: result.error || 'Failed to save freelancer. Please check permissions and connection.' });
        setIsSubmitting(false);
        return;
      }

      onFreelancerSaved(result.freelancer);
      onClose();
    } catch (err) {
      console.error('Error saving freelancer record:', err);
      setErrors({ form: 'Failed to save freelancer. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {isEditing ? 'Edit Freelancer Profile' : 'Add Freelancer (Admin Only)'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEditing
                  ? 'Update freelancer skills, rates, availability and payout balance.'
                  : 'Subcontractor record. Freelancers do not receive CRM login credentials.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-5 flex-1">
          {/* General Form Error */}
          {errors.form && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Duplicate Freelancer Warning Banner */}
          {duplicateInfo.isDuplicate && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-800 dark:text-amber-300 animate-pulse">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider">Duplicate Freelancer Detected</h4>
                  <p className="text-xs mt-0.5">{duplicateInfo.reason}</p>
                </div>
              </div>
              {duplicateInfo.matchedFreelancer && onSelectExistingFreelancer && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectExistingFreelancer(duplicateInfo.matchedFreelancer!);
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition-colors shrink-0 shadow-sm"
                >
                  View Existing
                </button>
              )}
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Basic & Contact Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sameer Khan"
                    className={`w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border ${
                      errors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                    } rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                </div>
                {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
              </div>

              {/* Specialty */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Specialty / Role
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="e.g. Senior Video Editor & Colorist"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Phone (WhatsApp primary) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Phone Number (WhatsApp) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className={`w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border ${
                      errors.phone ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                    } rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                </div>
                {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
              </div>

              {/* Email (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sameer.edits@gmail.com"
                    className={`w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border ${
                      errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                    } rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                </div>
                {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>}
              </div>

              {/* Portfolio URL */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Portfolio / Showreel URL
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://behance.net/username or https://dribbble.com/..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Availability & Rating */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Availability & Rating
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Availability Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Availability Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CrmFreelancerStatus)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="available">Available for New Projects</option>
                  <option value="busy">Busy / Currently Assigned</option>
                  <option value="inactive">Inactive / On Leave</option>
                </select>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Performance Rating (1 - 5)
                </label>
                <div className="flex items-center gap-2 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-1 transition-transform hover:scale-110 ${
                        rating >= star ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'
                      }`}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-2">
                    {rating} / 5 Stars
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Skills and Specializations */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Skills & Specializations
              </label>
              <span className="text-[11px] text-slate-400">Select or press Enter to add</span>
            </div>

            {/* Quick Skill Tags */}
            <div className="flex flex-wrap gap-1.5">
              {COMMON_SKILLS.map((skill) => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleToggleSkill(skill)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>

            {/* Custom Skill Input */}
            <div className="relative">
              <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={customSkillInput}
                onChange={(e) => setCustomSkillInput(e.target.value)}
                onKeyDown={handleAddCustomSkill}
                placeholder="Type custom skill and press Enter..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Currently Active Skills */}
            {selectedSkills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedSkills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-medium border border-indigo-500/20"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => handleToggleSkill(s)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Rates & Payment Tracking */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Rates & Payment Tracking (₹)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Hourly Rate */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Hourly Rate (₹)
                </label>
                <div className="relative">
                  <span className="text-xs text-slate-400 font-bold absolute left-3 top-1/2 -translate-y-1/2">₹</span>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="1200"
                    min="0"
                    className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Default Fixed Rate */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Default Fixed Project Rate (₹)
                </label>
                <div className="relative">
                  <span className="text-xs text-slate-400 font-bold absolute left-3 top-1/2 -translate-y-1/2">₹</span>
                  <input
                    type="number"
                    value={fixedRateDefault}
                    onChange={(e) => setFixedRateDefault(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="15000"
                    min="0"
                    className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Agreed Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Agreed Project Value (₹)
                </label>
                <div className="relative">
                  <span className="text-xs text-slate-400 font-bold absolute left-3 top-1/2 -translate-y-1/2">₹</span>
                  <input
                    type="number"
                    value={agreedAmount}
                    onChange={(e) => setAgreedAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="38000"
                    min="0"
                    className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Paid Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Amount Paid So Far (₹)
                </label>
                <div className="relative">
                  <span className="text-xs text-slate-400 font-bold absolute left-3 top-1/2 -translate-y-1/2">₹</span>
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="24000"
                    min="0"
                    className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Calculated Pending Balance Display */}
              <div className="sm:col-span-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Computed Pending Balance:</span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    ₹{Math.max(0, (Number(agreedAmount) || 0) - (Number(paidAmount) || 0)).toLocaleString('en-IN')}
                  </h4>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                  Math.max(0, (Number(agreedAmount) || 0) - (Number(paidAmount) || 0)) === 0 && (Number(paidAmount) || 0) > 0
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                    : (Number(paidAmount) || 0) > 0
                    ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                    : 'bg-slate-500/10 text-slate-600 border-slate-500/20'
                }`}>
                  {Math.max(0, (Number(agreedAmount) || 0) - (Number(paidAmount) || 0)) === 0 && (Number(paidAmount) || 0) > 0
                    ? 'Fully Paid'
                    : (Number(paidAmount) || 0) > 0
                    ? 'Partial Payment'
                    : 'Payment Pending'}
                </span>
              </div>

              {/* Payment Method / Instructions */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Payment Method / UPI Handle <span className="text-slate-400 font-normal">(No sensitive banking data required)</span>
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    placeholder="e.g. UPI: sameerkhan@oksbi or IMPS Bank Transfer"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Admin Notes */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Admin Notes & Work History
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Internal notes regarding quality, responsiveness, turnaround speed..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>Admin-only record. No login created.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? 'Save Changes' : 'Create Freelancer Record'}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
