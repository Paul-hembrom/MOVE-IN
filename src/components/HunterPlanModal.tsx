import React from 'react';
import { HunterPlanTier, HunterSubscription } from '../types';
import {
  X,
  Check,
  Sparkles,
  Zap,
  Crown,
  Headphones,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface HunterPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSubscription?: HunterSubscription | null;
  onSelectPlan: (plan: { tier: HunterPlanTier; name: string; price: number; contacts: number }) => void;
}

export const HunterPlanModal: React.FC<HunterPlanModalProps> = ({
  isOpen,
  onClose,
  currentSubscription,
  onSelectPlan,
}) => {
  if (!isOpen) return null;

  const currentTier = currentSubscription?.plan_tier || 'free';
  const remaining = currentSubscription
    ? Math.max(0, currentSubscription.contacts_limit - currentSubscription.contacts_used)
    : 2;

  const PLANS: Array<{
    tier: HunterPlanTier;
    name: string;
    price: number;
    duration: string;
    contacts: number;
    badge?: string;
    popular?: boolean;
    features: string[];
    icon: any;
  }> = [
    {
      tier: 'free',
      name: 'Free Starter',
      price: 0,
      duration: 'Lifetime',
      contacts: 2,
      features: [
        '2 Owner phone unlocks',
        'In-app chat with landlords',
        'Standard search & map',
        'Direct landlord messaging',
      ],
      icon: Zap,
    },
    {
      tier: 'basic',
      name: 'Basic Hunter',
      price: 199,
      duration: '60 Days',
      contacts: 10,
      features: [
        '10 Owner phone unlocks',
        'In-app chat with landlords',
        'Valid for 60 full days',
        'Save Rs 800 vs single unlock',
      ],
      icon: Sparkles,
    },
    {
      tier: 'premium',
      name: 'Premium Seeker',
      price: 499,
      duration: '60 Days',
      contacts: 25,
      popular: true,
      badge: 'Best Value',
      features: [
        '25 Owner phone unlocks',
        'Priority tenant inquiries',
        'In-app chat + WhatsApp reveals',
        'Priority dispute support',
        'Valid for 60 full days',
      ],
      icon: Crown,
    },
    {
      tier: 'assisted',
      name: 'Assisted Search',
      price: 999,
      duration: '60 Days',
      contacts: 999999,
      badge: 'VIP White Glove',
      features: [
        'Unlimited Owner unlocks',
        'Dedicated WhatsApp concierge',
        'Curated shortlist sent daily',
        'Negotiation assistance',
        'VIP priority access to new listings',
      ],
      icon: Headphones,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-6 relative max-h-[90vh] overflow-y-auto animate-scale-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">
            <Crown className="w-3.5 h-3.5" />
            <span>Housing.com Style Tenant Memberships</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Unlock Landlord Contacts with Zero Brokerage
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Choose a plan to contact verified flat and room owners directly across Kathmandu, Lalitpur, and Pokhara.
          </p>

          {/* Current Status banner */}
          <div className="mt-4 p-3 rounded-2xl bg-slate-100/80 border border-slate-200/90 inline-flex items-center gap-3 text-xs">
            <span className="font-semibold text-slate-700">
              Current Plan: <strong className="text-slate-900 capitalize">{currentTier}</strong>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span className="font-semibold text-emerald-700">
              <strong>{remaining}</strong> Contact(s) Remaining
            </span>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = currentTier === plan.tier;

            return (
              <div
                key={plan.tier}
                className={`rounded-3xl p-5 flex flex-col justify-between transition-all relative border-2 ${
                  plan.popular
                    ? 'border-emerald-500 bg-emerald-50/20 shadow-lg ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white shadow-xs'
                }`}
              >
                {plan.badge && (
                  <span
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      plan.popular
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                        : 'bg-amber-400 text-slate-950 font-extrabold'
                    }`}
                  >
                    {plan.badge}
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                        plan.popular
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    {isCurrent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900">{plan.name}</h3>
                  <div className="mt-2 mb-4">
                    <span className="text-2xl font-black text-slate-900">
                      {plan.price === 0 ? 'Free' : `रू ${plan.price}`}
                    </span>
                    <span className="text-xs text-slate-500 ml-1">/ {plan.duration}</span>
                  </div>

                  <div className="text-xs font-bold text-emerald-700 mb-4 pb-3 border-b border-slate-100">
                    {plan.contacts > 1000 ? 'Unlimited Contacts' : `${plan.contacts} Landlord Contacts`}
                  </div>

                  <ul className="space-y-2 text-xs text-slate-600 mb-6">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-tight">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => {
                    if (plan.tier === 'free') {
                      onClose();
                    } else {
                      onSelectPlan({
                        tier: plan.tier,
                        name: plan.name,
                        price: plan.price,
                        contacts: plan.contacts,
                      });
                    }
                  }}
                  disabled={isCurrent}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isCurrent
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-700/20 cursor-pointer'
                      : 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer'
                  }`}
                >
                  <span>{isCurrent ? 'Current Plan' : plan.price === 0 ? 'Use Free Plan' : 'Select Plan'}</span>
                  {!isCurrent && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Guarantee */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>100% Direct owner contact details • Verified with real telephone numbers</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Instant activation via eSewa & Khalti</span>
          </div>
        </div>
      </div>
    </div>
  );
};
