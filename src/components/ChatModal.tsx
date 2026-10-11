import React, { useState, useEffect, useRef } from 'react';
import { Conversation, ChatMessage, Property, Profile } from '../types';
import { dbService } from '../lib/dbService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  X,
  Send,
  MessageSquare,
  Building2,
  CheckCheck,
  ShieldCheck,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Link } from '../context/RouterContext';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId?: string;
  property?: Property;
  recipient?: Profile;
}

const QUICK_REPLIES = [
  'Namaste! Is this property still available?',
  'Can I visit tomorrow afternoon for an inspection?',
  'What is the security deposit and notice period?',
  'Is 24/7 drinking water supply guaranteed?',
  'Is car/bike parking included in the rent?',
];

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  conversationId,
  property,
  recipient,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeConvId, setActiveConvId] = useState<string | null>(conversationId || null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize or find conversation
  useEffect(() => {
    if (!isOpen || !user) return;

    const initChat = async () => {
      setLoading(true);
      try {
        if (conversationId) {
          setActiveConvId(conversationId);
          const msgs = await dbService.getMessages(conversationId);
          setMessages(msgs);
        } else if (property && recipient) {
          // If hunter starting chat with owner
          const conv = await dbService.getOrCreateConversation(
            property.id,
            user.id,
            recipient.id
          );
          setActiveConvId(conv.id);
          const msgs = await dbService.getMessages(conv.id);
          setMessages(msgs);
        }
      } catch (err) {
        console.error(err);
        showToast('Failed to load chat messages', 'error');
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [isOpen, conversationId, property, recipient, user]);

  // Subscribe to real-time incoming messages
  useEffect(() => {
    if (!activeConvId) return;

    const unsubscribe = dbService.subscribeToMessages(activeConvId, (newMsg) => {
      setMessages((prev) => {
        // avoid duplicate message
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    });

    return () => {
      unsubscribe();
    };
  }, [activeConvId]);

  // Auto-scroll to bottom on messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !activeConvId || !user) return;

    setSending(true);
    try {
      const newMsg = await dbService.sendMessage(
        activeConvId,
        user.id,
        user.role,
        text
      );
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      setInputText('');
    } catch (err) {
      console.error(err);
      showToast('Error sending message', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const targetName = recipient?.full_name || 'Property Contact';
  const targetRole = recipient?.role === 'owner' ? 'Property Owner' : 'Verified Hunter';
  const propTitle = property?.title || 'Listing Discussion';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full h-[88vh] max-h-[680px] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-scale-up">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-extrabold text-sm shrink-0 shadow-md">
              {recipient?.avatar_url ? (
                <img
                  src={recipient.avatar_url}
                  alt={targetName}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                targetName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm text-white truncate">{targetName}</h3>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {targetRole}
                </span>
              </div>
              {property && (
                <div className="text-[11px] text-slate-300 truncate flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="truncate">{property.title}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {property && (
              <Link
                href={`/property/${property.id}`}
                className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                title="View Property Page"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Property Mini Banner */}
        {property && (
          <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-700">
              रू {property.price.toLocaleString('en-IN')}
              {property.listing_type === 'rent' ? '/mo' : ''}
            </span>
            <span className="text-slate-500 text-[11px] truncate max-w-[200px]">
              📍 {property.address}, {property.city}
            </span>
          </div>
        )}

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-400 text-xs">
              <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mr-2" />
              Loading real-time chat...
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-700 text-sm">Direct Messaging Started</h4>
              <p className="text-xs text-slate-500 max-w-xs">
                Inquire about availability, room visits, utility charges, or lease terms.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === user?.id;
              const timeStr = new Date(msg.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-fade-in`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-2xs leading-relaxed ${
                      isMe
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                    <div
                      className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${
                        isMe ? 'text-emerald-100' : 'text-slate-400'
                      }`}
                    >
                      <span>{timeStr}</span>
                      {isMe && <CheckCheck className="w-3 h-3 text-emerald-200" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3 pt-2 bg-white border-t border-slate-100 overflow-x-auto flex gap-1.5 scrollbar-thin">
          {QUICK_REPLIES.map((reply, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(reply)}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 text-[11px] whitespace-nowrap font-medium transition-colors border border-slate-200"
            >
              {reply}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 text-xs sm:text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || sending}
            className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl transition-all shadow-md shadow-emerald-700/20 cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
