import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Clock } from 'lucide-react';

export default function DebugEmails() {
  const { debugEmails } = useNotifications();
  const [selectedMail, setSelectedMail] = useState(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* LEFT: Email catalog list */}
      <section className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>✉️</span> Debug Email Log
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Captures virtual SMTP emails emitted by the Node server in real time. Submit complaints or change statuses to watch dispatches occur.
          </p>
        </div>

        <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
          {debugEmails.length === 0 ? (
            <div className="p-8 text-center text-slate-450 dark:text-slate-500 text-xs italic">
              No emails sent yet. Submit a complaint, assign staff, or complete a repair to trigger notifications!
            </div>
          ) : (
            debugEmails.map(mail => (
              <button
                key={mail.id}
                onClick={() => setSelectedMail(mail)}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
                  selectedMail?.id === mail.id 
                    ? 'border-indigo-500 bg-indigo-50/10 dark:bg-indigo-950/10 shadow-md' 
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 bg-slate-50/30 dark:bg-slate-950/20'
                }`}
              >
                <div className="flex justify-between items-center mb-1 text-[8px] font-bold text-slate-400 uppercase">
                  <span>ID: {mail.id}</span>
                  <span className="flex items-center gap-1"><Clock size={8} /> {new Date(mail.sentAt).toLocaleTimeString()}</span>
                </div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-150 truncate mb-1">{mail.subject}</h4>
                <p className="text-[10px] text-slate-500 truncate font-semibold">To: {mail.to}</p>
              </button>
            ))
          )}
        </div>
      </section>

      {/* RIGHT: HTML Email Content Inspector */}
      <section className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm h-[560px] overflow-y-auto">
        {selectedMail ? (
          <div className="space-y-6">
            <div className="border-b border-slate-150 dark:border-slate-800 pb-4">
              <span className="text-[9px] font-bold bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded text-indigo-650 dark:text-indigo-400">
                EMAIL METADATA
              </span>
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 mt-2">
                Subject: {selectedMail.subject}
              </h3>
              <div className="text-xs text-slate-500 mt-2 space-y-0.5 font-semibold">
                <p><span className="font-bold text-slate-450">Recipient:</span> {selectedMail.to}</p>
                <p><span className="font-bold text-slate-450">Sent Time:</span> {new Date(selectedMail.sentAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-150 dark:border-slate-850 overflow-x-auto">
              <div 
                dangerouslySetInnerHTML={{ __html: selectedMail.html || selectedMail.text }}
                className="prose dark:prose-invert max-w-none text-xs"
              />
            </div>
          </div>
        ) : (
          <div className="py-24 text-center text-slate-400">
            <span className="text-4xl">📧</span>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-350 mt-3">Select an email log</p>
            <p className="text-xs text-slate-500 mt-1">Select a logged item from the inbox directory to inspect parsed HTML outputs.</p>
          </div>
        )}
      </section>

    </div>
  );
}
