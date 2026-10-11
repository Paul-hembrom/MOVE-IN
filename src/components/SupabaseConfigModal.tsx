import React, { useState } from 'react';
import {
  getSupabaseConfig,
  saveCustomSupabaseConfig,
  isSupabaseConfigured,
  getSupabaseClient,
} from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import { dbService } from '../lib/dbService';
import { Database, X, CheckCircle, AlertTriangle, RefreshCw, Copy, Check, Code } from 'lucide-react';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChanged?: () => void;
}

const SQL_SCHEMA = `-- Move-In Monetization & Platform Tables:
ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS views integer DEFAULT 0;

CREATE TABLE IF NOT EXISTS payments (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id text REFERENCES properties(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  purpose text NOT NULL, -- 'contact_unlock', 'boost_listing', 'owner_subscription', 'success_fee'
  method text NOT NULL, -- 'esewa', 'khalti'
  transaction_ref text NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
  created_at timestamptz DEFAULT now(),
  verified_at timestamptz,
  metadata jsonb
);

CREATE TABLE IF NOT EXISTS contact_unlocks (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id text NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  payment_id text REFERENCES payments(id),
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_name text NOT NULL,
  price numeric NOT NULL,
  payment_id text REFERENCES payments(id),
  status text NOT NULL DEFAULT 'active',
  starts_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);`;

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigChanged,
}) => {
  const currentConfig = getSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: 'success' | 'error' | null;
    message: string;
  }>({ status: null, message: '' });
  const [showSql, setShowSql] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult({ status: null, message: '' });

    if (!url.trim() || !anonKey.trim()) {
      // Clear custom config to use local mode
      saveCustomSupabaseConfig('', '');
      setTestResult({
        status: 'success',
        message: 'Switched to offline local storage mode.',
      });
      showToast('Switched to local storage database', 'info');
      setTesting(false);
      onConfigChanged?.();
      return;
    }

    try {
      saveCustomSupabaseConfig(url.trim(), anonKey.trim());
      const client = getSupabaseClient();
      if (!client) {
        throw new Error('Invalid URL or Key format.');
      }

      // Test query on properties table
      const { data, error } = await client.from('properties').select('id').limit(1);

      if (error) {
        setTestResult({
          status: 'error',
          message: `Connected to Supabase, but query error on 'properties': ${error.message}. Make sure RLS policies allow SELECT or you have created tables.`,
        });
        showToast('Supabase connected with table warnings', 'error');
      } else {
        setTestResult({
          status: 'success',
          message: `Successfully connected to Supabase! Found ${data ? data.length : 0} initial record(s).`,
        });
        showToast('Connected to Supabase successfully!', 'success');
      }
      onConfigChanged?.();
    } catch (err: any) {
      setTestResult({
        status: 'error',
        message: err.message || 'Failed to connect to Supabase.',
      });
      showToast('Supabase connection failed', 'error');
    } finally {
      setTesting(false);
    }
  };

  const handleResetDemoData = () => {
    dbService.resetDemoData();
    showToast('Reset sample listings and profiles in local storage!', 'success');
    onConfigChanged?.();
    onClose();
  };

  const isConfigured = isSupabaseConfigured();

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Supabase Configuration</h3>
              <p className="text-xs text-slate-500">Live Database & Storage Settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current status pill */}
        <div className="my-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="text-sm font-semibold text-slate-800">
              {isConfigured ? 'Live Supabase Active' : 'Offline / Demo Mode Active'}
            </span>
          </div>
          <span className="text-xs text-slate-500">
            {isConfigured ? 'Direct API queries' : 'Local persistent storage'}
          </span>
        </div>

        <form onSubmit={handleTestAndSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              SUPABASE_URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              SUPABASE_ANON_KEY
            </label>
            <input
              type="password"
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          {testResult.message && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                testResult.status === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {testResult.status === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              disabled={testing}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              {testing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                'Save & Verify Connection'
              )}
            </button>

            <button
              type="button"
              onClick={handleResetDemoData}
              className="w-full py-2 px-4 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium rounded-xl transition-colors"
            >
              Reset Sample Kathmandu/Pokhara Demo Listings
            </button>

            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSql(!showSql)}
                className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-emerald-700 py-1"
              >
                <span className="flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-emerald-600" />
                  SQL Schema for Supabase Tables
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {showSql ? 'Hide' : 'View SQL'}
                </span>
              </button>

              {showSql && (
                <div className="mt-2 p-3 bg-slate-900 rounded-xl text-slate-200 text-[11px] relative font-mono overflow-x-auto max-h-48 scrollbar-thin">
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(SQL_SCHEMA);
                        setCopiedSql(true);
                        setTimeout(() => setCopiedSql(false), 2000);
                        showToast('SQL schema copied to clipboard!', 'success');
                      }
                    }}
                    className="absolute top-2 right-2 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-white flex items-center gap-1"
                  >
                    {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSql ? 'Copied' : 'Copy SQL'}</span>
                  </button>
                  <pre>{SQL_SCHEMA}</pre>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
