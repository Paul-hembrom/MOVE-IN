import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { dbService } from '../lib/dbService';
import { PaymentMethod, PaymentPurpose } from '../types';
import {
  X,
  QrCode,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  amount: number;
  purpose: PaymentPurpose;
  propertyId?: string;
  metadata?: Record<string, any>;
  onSuccess?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  amount,
  purpose,
  propertyId,
  metadata,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [method, setMethod] = useState<PaymentMethod>('esewa');
  const [txnRef, setTxnRef] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);

  if (!isOpen) return null;

  const merchantPhone = '9841234567';
  const merchantName = 'Move-In Technologies Pvt. Ltd.';

  const handleCopyPhone = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(merchantPhone);
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 2000);
      showToast('Merchant phone number copied to clipboard', 'info');
    }
  };

  const handleSubmitPayment = async (autoVerify = false) => {
    if (!user) {
      showToast('Please log in to proceed with payment.', 'error');
      return;
    }

    if (!txnRef.trim() && !autoVerify) {
      showToast('Please enter your transaction reference / code.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const generatedRef = txnRef.trim() || `${method.toUpperCase()}-DEMO-${Date.now().toString().slice(-6)}`;

      const payRecord = await dbService.createPayment({
        user_id: user.id,
        property_id: propertyId,
        amount,
        purpose,
        method,
        transaction_ref: generatedRef,
        metadata,
      });

      if (autoVerify) {
        // Immediate verification for easy testing
        await dbService.verifyPayment(payRecord.id);
        showToast('Payment verified successfully! Feature activated.', 'success');
      } else {
        showToast(
          'Payment submitted! Admin will verify your transaction shortly.',
          'info'
        );
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Payment submission failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative my-6 animate-scale-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-5 pr-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Digital Payment</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>

        {/* Amount Hero */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 mb-5 text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Total Payable Amount
          </span>
          <div className="text-3xl font-extrabold text-emerald-700 tracking-tight mt-0.5">
            रू {amount.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Payment Method Switcher (eSewa vs Khalti) */}
        <div className="mb-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Select Payment Wallet
          </label>
          <div className="grid grid-cols-2 gap-3">
            {/* eSewa Option */}
            <button
              type="button"
              onClick={() => setMethod('esewa')}
              className={`p-3 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                method === 'esewa'
                  ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center">
                  e
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-900 block">eSewa</span>
                  <span className="text-[10px] text-slate-400">Mobile Wallet</span>
                </div>
              </div>
              {method === 'esewa' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            </button>

            {/* Khalti Option */}
            <button
              type="button"
              onClick={() => setMethod('khalti')}
              className={`p-3 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                method === 'khalti'
                  ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-600/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center">
                  K
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-900 block">Khalti</span>
                  <span className="text-[10px] text-slate-400">Digital Wallet</span>
                </div>
              </div>
              {method === 'khalti' && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
            </button>
          </div>
        </div>

        {/* QR Code Container */}
        <div
          className={`p-4 rounded-3xl border text-center mb-5 ${
            method === 'esewa'
              ? 'bg-emerald-950 text-white border-emerald-800'
              : 'bg-purple-950 text-white border-purple-800'
          }`}
        >
          <div className="bg-white p-3 rounded-2xl inline-block shadow-lg mb-3">
            {/* Crisp simulated SVG QR with merchant visual */}
            <svg
              className="w-40 h-40 mx-auto"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer boundary */}
              <rect width="100" height="100" fill="white" />
              {/* Top-Left Finder */}
              <rect x="8" y="8" width="24" height="24" fill={method === 'esewa' ? '#059669' : '#7c3aed'} rx="4" />
              <rect x="12" y="12" width="16" height="16" fill="white" rx="2" />
              <rect x="16" y="16" width="8" height="8" fill={method === 'esewa' ? '#059669' : '#7c3aed'} rx="1" />

              {/* Top-Right Finder */}
              <rect x="68" y="8" width="24" height="24" fill={method === 'esewa' ? '#059669' : '#7c3aed'} rx="4" />
              <rect x="72" y="12" width="16" height="16" fill="white" rx="2" />
              <rect x="76" y="16" width="8" height="8" fill={method === 'esewa' ? '#059669' : '#7c3aed'} rx="1" />

              {/* Bottom-Left Finder */}
              <rect x="8" y="68" width="24" height="24" fill={method === 'esewa' ? '#059669' : '#7c3aed'} rx="4" />
              <rect x="12" y="72" width="16" height="16" fill="white" rx="2" />
              <rect x="16" y="76" width="8" height="8" fill={method === 'esewa' ? '#059669' : '#7c3aed'} rx="1" />

              {/* QR Matrix Dots */}
              <rect x="36" y="10" width="6" height="6" fill="#0f172a" rx="1" />
              <rect x="46" y="10" width="6" height="6" fill="#0f172a" rx="1" />
              <rect x="56" y="10" width="6" height="6" fill="#0f172a" rx="1" />
              <rect x="36" y="20" width="6" height="6" fill="#0f172a" rx="1" />
              <rect x="46" y="26" width="6" height="6" fill="#0f172a" rx="1" />

              <rect x="10" y="36" width="6" height="6" fill="#0f172a" rx="1" />
              <rect x="22" y="44" width="6" height="6" fill="#0f172a" rx="1" />
              <rect x="36" y="36" width="28" height="28" fill={method === 'esewa' ? '#047857' : '#6d28d9'} rx="6" />
              <rect x="44" y="44" width="12" height="12" fill="white" rx="2" />

              <rect x="68" y="36" width="6" height="6" fill="#0f172a" rx="1" />
              <rect x="78" y="44" width="6" height="6" fill="#0f172a" rx="1" />
              <rect x="86" y="52" width="6" height="6" fill="#0f172a" rx="1" />

              <rect x="36" y="68" width="6" height="6" fill="#0f172a" rx="1" />
              <rect x="48" y="76" width="6" height="6" fill="#0f172a" rx="1" />
              <rect x="58" y="68" width="6" height="6" fill="#0f172a" rx="1" />
              <rect x="68" y="76" width="6" height="6" fill="#0f172a" rx="1" />
              <rect x="78" y="68" width="6" height="6" fill="#0f172a" rx="1" />
              <rect x="86" y="82" width="6" height="6" fill="#0f172a" rx="1" />
            </svg>
          </div>

          <div className="text-xs font-semibold">{merchantName}</div>
          <div className="flex items-center justify-center gap-2 mt-1 text-[11px] opacity-90">
            <span>{method === 'esewa' ? 'eSewa ID' : 'Khalti ID'}: {merchantPhone}</span>
            <button
              onClick={handleCopyPhone}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              title="Copy Merchant Number"
            >
              {copiedNumber ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* 3 Step Instruction */}
        <div className="text-xs text-slate-600 space-y-1.5 mb-5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
          <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <QrCode className="w-3.5 h-3.5 text-emerald-600" />
            Instructions:
          </div>
          <p className="text-[11px]">1. Open your <strong>{method === 'esewa' ? 'eSewa' : 'Khalti'}</strong> mobile app.</p>
          <p className="text-[11px]">2. Scan QR code or transfer exact <strong>रू {amount}</strong> to <strong>{merchantPhone}</strong>.</p>
          <p className="text-[11px]">3. Copy the Transaction ID / Ref code from your app and submit below.</p>
        </div>

        {/* Transaction Reference Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmitPayment(false);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Transaction ID / Reference Code *
            </label>
            <input
              type="text"
              required
              placeholder={method === 'esewa' ? 'e.g. 7X892100A or ESEWA-...' : 'e.g. KH-882190 or 99120...'}
              value={txnRef}
              onChange={(e) => setTxnRef(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
            />
          </div>

          <div className="space-y-2 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3 px-4 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                method === 'esewa'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-700/20'
                  : 'bg-purple-600 hover:bg-purple-700 shadow-purple-700/20'
              }`}
            >
              <span>{submitting ? 'Submitting...' : 'Submit Payment for Verification'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Test Option */}
            <button
              type="button"
              onClick={() => handleSubmitPayment(true)}
              className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>⚡ Test Instant Verification (Demo Mode)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
