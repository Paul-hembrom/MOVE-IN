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
  Sparkles,
  ArrowRight,
  Upload,
  MessageCircle,
  Image as ImageIcon,
  AlertCircle,
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
  const [note, setNote] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);

  if (!isOpen) return null;

  const merchantPhone = '9767697274';
  const merchantName = 'Move-In';
  const whatsappUrl = `https://wa.me/9779767697274?text=${encodeURIComponent(
    `Hi Move-In, I just paid Rs ${amount} for ${title}. My account email is ${user?.email || 'N/A'}. Transaction ID: ${txnRef || '[Pending]'}`
  )}`;

  const handleCopyPhone = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(merchantPhone);
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 2000);
      showToast('Number 9767697274 copied to clipboard', 'info');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file (PNG, JPG, JPEG).', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('Image size should be less than 10MB.', 'error');
      return;
    }

    setScreenshotFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitPayment = async () => {
    if (!user) {
      showToast('Please log in to proceed with payment.', 'error');
      return;
    }

    if (!txnRef.trim()) {
      showToast('Transaction ID / reference code is required.', 'error');
      return;
    }

    if (!screenshotFile && !screenshotPreview) {
      showToast('Payment screenshot is required as proof of transfer.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const generatedRef = txnRef.trim();

      // Submit payment with screenshot file/data
      await dbService.createPayment({
        user_id: user.id,
        property_id: propertyId,
        amount,
        purpose,
        method,
        transaction_ref: generatedRef,
        note: note.trim() || undefined,
        metadata: {
          ...metadata,
          plan_title: title,
        },
      }, screenshotFile || screenshotPreview);

      showToast(
        'Payment submitted. We will verify shortly and activate your plan.',
        'success'
      );

      onSuccess?.();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Payment submission failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 relative my-6 max-h-[92vh] overflow-y-auto animate-scale-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-4 pr-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Digital Payment Verification</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>

        {/* Amount Hero */}
        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 mb-4 text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Total Payable Amount
          </span>
          <div className="text-3xl font-extrabold text-emerald-700 tracking-tight mt-0.5">
            रू {amount.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Payment Method Switcher (eSewa vs Khalti) */}
        <div className="mb-4">
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

        {/* QR & Transfer Details Card */}
        <div
          className={`p-4 rounded-3xl border text-center mb-4 ${
            method === 'esewa'
              ? 'bg-emerald-950 text-white border-emerald-800'
              : 'bg-purple-950 text-white border-purple-800'
          }`}
        >
          <div className="bg-white p-3 rounded-2xl inline-block shadow-lg mb-2">
            <svg
              className="w-36 h-36 mx-auto"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="100" height="100" fill="white" />
              <rect x="8" y="8" width="24" height="24" fill={method === 'esewa' ? '#059669' : '#7c3aed'} rx="4" />
              <rect x="12" y="12" width="16" height="16" fill="white" rx="2" />
              <rect x="16" y="16" width="8" height="8" fill={method === 'esewa' ? '#059669' : '#7c3aed'} rx="1" />

              <rect x="68" y="8" width="24" height="24" fill={method === 'esewa' ? '#059669' : '#7c3aed'} rx="4" />
              <rect x="72" y="12" width="16" height="16" fill="white" rx="2" />
              <rect x="76" y="16" width="8" height="8" fill={method === 'esewa' ? '#059669' : '#7c3aed'} rx="1" />

              <rect x="8" y="68" width="24" height="24" fill={method === 'esewa' ? '#059669' : '#7c3aed'} rx="4" />
              <rect x="12" y="72" width="16" height="16" fill="white" rx="2" />
              <rect x="16" y="76" width="8" height="8" fill={method === 'esewa' ? '#059669' : '#7c3aed'} rx="1" />

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
          
          {/* Clickable Phone Number (opens WhatsApp) */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-1.5">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-bold text-sm bg-white/15 hover:bg-white/25 px-3 py-1 rounded-xl transition-all underline decoration-dotted"
              title="Click to chat on WhatsApp"
            >
              <span>{merchantPhone}</span>
            </a>

            <button
              type="button"
              onClick={handleCopyPhone}
              className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title="Copy Merchant Number"
            >
              {copiedNumber ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-3 py-1 rounded-xl transition-colors shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-xs text-slate-600 space-y-1 mb-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
          <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <QrCode className="w-3.5 h-3.5 text-emerald-600" />
            Payment Instructions:
          </div>
          <p className="text-[11px]">
            1. Transfer exact <strong>रू {amount.toLocaleString('en-IN')}</strong> to <strong>9767697274</strong> via {method === 'esewa' ? 'eSewa' : 'Khalti'}.
          </p>
          <p className="text-[11px]">
            2. Or tap the number / <strong>Chat on WhatsApp</strong> to pay or send proof directly.
          </p>
          <p className="text-[11px]">
            3. Enter your Transaction Reference ID and <strong>upload screenshot proof</strong> below.
          </p>
        </div>

        {/* Transaction Reference & Screenshot Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmitPayment();
          }}
          className="space-y-3.5"
        >
          {/* Transaction Ref */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Transaction ID / Reference Code <span className="text-rose-500">*</span>
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

          {/* Screenshot Upload (REQUIRED) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Payment Screenshot / Receipt <span className="text-rose-500">*</span>
            </label>
            <div className="mt-1">
              {screenshotPreview ? (
                <div className="relative rounded-2xl border-2 border-emerald-300 p-2 bg-emerald-50/30 flex items-center gap-3">
                  <img
                    src={screenshotPreview}
                    alt="Payment receipt preview"
                    className="w-16 h-16 object-cover rounded-xl border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {screenshotFile?.name || 'receipt_screenshot.png'}
                    </p>
                    <p className="text-[10px] text-emerald-700 font-medium">
                      Screenshot attached successfully
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setScreenshotFile(null);
                      setScreenshotPreview('');
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-full"
                    title="Remove screenshot"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50 hover:bg-emerald-50/20">
                  <Upload className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs font-bold text-slate-800">
                    Upload Payment Screenshot (Required)
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    PNG, JPG, or screenshot from your wallet app (max 10MB)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Optional Note
            </label>
            <input
              type="text"
              placeholder="e.g. Sender eSewa name, urgent verification..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Verification Warning Note */}
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              All submissions are verified by administrators. Plans and features will be activated immediately once verification completes.
            </span>
          </div>

          {/* Submit Button */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3 px-4 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                method === 'esewa'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-700/20'
                  : 'bg-purple-600 hover:bg-purple-700 shadow-purple-700/20'
              } ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <span>{submitting ? 'Uploading Proof...' : 'Submit Payment for Verification'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
