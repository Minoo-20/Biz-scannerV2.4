import React, { useState } from 'react';
import { X, Copy, Check, MessageSquareText, Phone, Mail, Sparkles, Send, GlobeX } from 'lucide-react';
import { Business } from '../types';

interface PitchModalProps {
  business: Business | null;
  onClose: () => void;
}

export const PitchModal: React.FC<PitchModalProps> = ({ business, onClose }) => {
  if (!business) return null;

  const [activeTab, setActiveTab] = useState<'phone' | 'email' | 'sms'>('phone');
  const [copied, setCopied] = useState(false);

  // Generate Cold Call Script
  const phoneScript = `Hi! Is this the manager or owner at ${business.name}?

My name is [Your Name]. I was searching for top-rated ${business.categoryLabel.toLowerCase()} services around ${business.city}, and I noticed you have over ${business.reviewCount} stellar reviews with a ${business.rating} ⭐ rating on Google!

However, when customers click to visit your website from Google Maps, there's no website listed! Right now, over 60% of people looking for a ${business.categoryLabel.toLowerCase()} in ${business.city} leave and go to competitors if they can't view a website.

We build modern, fast-loading websites for local businesses starting at $${business.estWebsiteValue.toLocaleString()}. I'd love to send over a free custom design preview for ${business.name}. 

What's the best email address to send that over to?`;

  // Generate Email Proposal
  const emailScript = `Subject: Quick question about ${business.name}'s Google presence in ${business.city}

Hi ${business.name} Team,

I came across your business while scanning high-rated local services in ${business.city}. First off, congratulations on maintaining a strong ${business.rating} ⭐ rating with ${business.reviewCount} customer reviews!

While reviewing your Google Maps listing, I noticed that you currently don't have an official website linked. 

Here is what's happening right now:
• Potential high-ticket clients are searching for ${business.categoryLabel.toLowerCase()} services near ${business.address}.
• Because you lack an official mobile website, they are clicking on competitors who do.
• You are likely missing out on 15–30 new inquiries every month.

We specialize in designing high-converting, mobile-ready websites tailored for ${business.categoryLabel.toLowerCase()} businesses. We can launch a complete modern website for ${business.name} in under 5 days.

Would you be open to seeing a free custom homepage preview this week?

Best regards,

[Your Name]
Web Design & Lead Generation
Coordinates verified: ${business.lat.toFixed(5)}, ${business.lng.toFixed(5)}`;

  // Generate SMS / WhatsApp text
  const smsScript = `Hi ${business.name}! Loved seeing your ${business.rating}⭐ reviews on Google Maps in ${business.city}. I noticed you don't have a website listed on your profile yet—you're likely losing ~30% of searchers to competitors. We build high-converting sites for local businesses. Mind if I send you a free website mockup preview for ${business.name}? - [Your Name]`;

  const currentScript = activeTab === 'phone' ? phoneScript : activeTab === 'email' ? emailScript : smsScript;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative space-y-4">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Website Pitch Script Generator
            </h3>
            <p className="text-xs text-slate-400">
              Tailored outreach script for <span className="text-emerald-400 font-semibold">{business.name}</span>
            </p>
          </div>
        </div>

        {/* Target Summary Box */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
          <div>
            <p className="text-[10px] text-slate-500">Target Category</p>
            <p className="font-semibold text-slate-200">{business.categoryLabel}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500">Google Rating</p>
            <p className="font-semibold text-amber-400">{business.rating} ⭐ ({business.reviewCount} revs)</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500">Est. Website Deal</p>
            <p className="font-semibold text-emerald-400 font-mono">${business.estWebsiteValue.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500">Phone</p>
            <p className="font-semibold text-slate-300 font-mono">{business.phone}</p>
          </div>
        </div>

        {/* Script Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-1">
          <button
            onClick={() => setActiveTab('phone')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'phone'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            Cold Call Script
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'email'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            Email Proposal
          </button>
          <button
            onClick={() => setActiveTab('sms')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'sms'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquareText className="w-3.5 h-3.5" />
            SMS / DM Pitch
          </button>
        </div>

        {/* Script Content Area */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
          {currentScript}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-slate-500">
            Coordinates: <span className="text-emerald-400 font-mono font-bold">{business.lat.toFixed(5)}, {business.lng.toFixed(5)}</span>
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Script Copied!' : 'Copy Script to Clipboard'}
          </button>
        </div>

      </div>

    </div>
  );
};
