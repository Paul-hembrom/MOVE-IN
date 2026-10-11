import React from 'react';
import { ShieldCheck, Award, CheckCircle2 } from 'lucide-react';

interface VerificationBadgeProps {
  isPlatformVerified?: boolean;
  isSelfVerified?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  isPlatformVerified,
  isSelfVerified,
  size = 'md',
  showLabel = true,
  className = '',
}) => {
  if (!isPlatformVerified && !isSelfVerified) return null;

  // Platform Verified (Gold Badge)
  if (isPlatformVerified) {
    const isSm = size === 'sm';
    return (
      <span
        className={`inline-flex items-center gap-1 font-black rounded-full tracking-wide shadow-xs bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 ring-1 ring-amber-500/50 ${
          isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        } ${className}`}
        title="SajiloKotha Verified: Inspected and authenticated by platform administrators"
      >
        <Award className={`${isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-slate-950 fill-slate-950`} />
        {showLabel && <span>Verified</span>}
      </span>
    );
  }

  // Self-Verified (Blue Badge)
  if (isSelfVerified) {
    const isSm = size === 'sm';
    return (
      <span
        className={`inline-flex items-center gap-1 font-bold rounded-full tracking-wide shadow-xs bg-gradient-to-r from-blue-500 to-cyan-600 text-white ring-1 ring-blue-400/40 ${
          isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        } ${className}`}
        title="Self-Verified: Owner has uploaded a timestamped live photo of the property"
      >
        <ShieldCheck className={`${isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'}`} />
        {showLabel && <span>Self-Verified</span>}
      </span>
    );
  }

  return null;
};
