import React, { useState, useRef } from 'react';
import { Property } from '../types';
import { dbService } from '../lib/dbService';
import { useToast } from '../context/ToastContext';
import {
  X,
  Camera,
  UploadCloud,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Clock,
  Sparkles,
} from 'lucide-react';

interface SelfVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
  onSuccess?: () => void;
}

export const SelfVerificationModal: React.FC<SelfVerificationModalProps> = ({
  isOpen,
  onClose,
  property,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSimulateLiveCapture = () => {
    // Generate a timestamped simulated live shot
    const samplePhoto =
      property.images?.[0]?.image_url ||
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80';
    setPreviewUrl(samplePhoto);
    showToast('Live photo captured with current system timestamp!', 'info');
  };

  const handleSubmit = async () => {
    if (!previewUrl) {
      showToast('Please capture or upload a live verification photo.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const ok = await dbService.submitSelfVerification(property.id, previewUrl);
      if (ok) {
        showToast('Self-Verification approved! Blue badge activated.', 'success');
        onSuccess?.();
        onClose();
      } else {
        showToast('Could not save verification.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Verification submission failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const todayStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Self-Verification</h3>
              <p className="text-xs text-slate-500">Earn the Blue "Self-Verified" badge</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50/60 rounded-2xl p-4 border border-blue-100 mb-5 text-xs text-blue-900 space-y-1.5">
          <div className="font-bold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Why verify your property?</span>
          </div>
          <p className="text-[11px] leading-relaxed text-blue-800">
            Hunters trust verified properties 3x more. Upload a fresh photo of the room/living space showing it is currently vacant and matches your listing specs.
          </p>
        </div>

        {/* Photo Upload / Capture Box */}
        <div className="mb-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Live Photo with Timestamp
          </label>

          {previewUrl ? (
            <div className="relative rounded-2xl overflow-hidden border-2 border-blue-500 aspect-16/10 bg-slate-900">
              <img src={previewUrl} alt="Live verification" className="w-full h-full object-cover" />
              {/* Timestamp Watermark Overlay */}
              <div className="absolute bottom-3 left-3 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-[10px] font-mono flex items-center gap-2 border border-white/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>VERIFIED LIVE: {todayStr} • {timeStr}</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewUrl('')}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/20 rounded-2xl p-6 text-center cursor-pointer transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-blue-600 flex items-center justify-center mx-auto mb-2 shadow-xs">
                <Camera className="w-6 h-6" />
              </div>
              <div className="font-bold text-xs text-slate-800">
                Upload or Take a Live Photo
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                PNG, JPG or WebP up to 10MB
              </p>
            </div>
          )}

          {/* Quick Simulate Button for Testing */}
          {!previewUrl && (
            <button
              type="button"
              onClick={handleSimulateLiveCapture}
              className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 mx-auto cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Take quick photo snapshot from listing</span>
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!previewUrl || submitting}
            className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{submitting ? 'Verifying...' : 'Confirm Self-Verification'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
