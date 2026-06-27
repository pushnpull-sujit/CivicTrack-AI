import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function FAQHelp() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: "How does the AI verification diagnostic work?",
      answer: "When you upload a photo and describe a problem, our backend AI models scan the visual content and text keywords. It automatically classifies the correct infrastructure category (e.g. pothole, broken streetlight), estimates severity based on risk indicators, checks for duplicate complaints within a 100-meter radius, and calculates task dispatch priority."
    },
    {
      question: "What categories of issues can I report?",
      answer: "You can report potholes, broken streetlights, road damages, water leakage leaks, illegal garbage dump sites, sewer overflows, park/playground maintenance concerns, and other miscellaneous infrastructure anomalies."
    },
    {
      question: "How is report priority calculated?",
      answer: "Priority is determined dynamically based on the category of the issue and the severity grade. High severity issues (such as water leaks or dangerous potholes) are immediately set to 'Critical' or 'High' priority and dispatched with SMS/email notifications to municipal staff specialists."
    },
    {
      question: "Are my reports public?",
      answer: "Yes, reports are displayed anonymously on the Public Reports map feed. This allows your neighbors to track the issue and prevents multiple people from submitting duplicate complaints for the same pothole or broken streetlight."
    },
    {
      question: "How can I track the progress of my report?",
      answer: "You can track your reports live on the 'My Issues' tab. You will see when the ticket is 'Verified', transitioned to 'In Progress' (meaning staff has arrived at the location), and marked 'Completed' (which includes a photo of the completed repair and invoice costs)."
    }
  ];

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <div className="rounded-[28px] border border-white bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#0f172a]/70 backdrop-blur-xl">
        <div className="border-b border-slate-100 pb-5 dark:border-slate-800 flex items-center gap-3">
          <div className="h-10 w-10 grid place-items-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300">
            <HelpCircle size={22} />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">FAQ & Help Desk</h2>
            <p className="text-sm text-slate-500 dark:text-white/60">Find answers on how the CivicTrack AI platform automates smart infrastructure verification.</p>
          </div>
        </div>

        <div className="mt-8 space-y-4 max-w-3xl">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
                className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/20 dark:border-slate-850 dark:bg-slate-900/10 transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="flex w-full items-center justify-between p-5 text-left font-bold text-sm text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-900/30 transition"
                >
                  <span>{faq.question}</span>
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-50 dark:border-slate-850 mt-1">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
