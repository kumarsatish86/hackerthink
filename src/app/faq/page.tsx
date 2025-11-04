'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const faqs = [
  {
    question: 'What is HackerThink?',
    answer: 'HackerThink is a comprehensive platform for learning Linux and IT skills with hands-on labs, tutorials, and community support.'
  },
  {
    question: 'Is HackerThink free to use?',
    answer: 'Many resources are free, but we also offer premium courses and labs for advanced learning and certification.'
  },
  {
    question: 'How do I join the community?',
    answer: 'You can join our LinkedIn group or participate in our forums and events. See the Community link in the footer.'
  },
  {
    question: 'Can I contribute content?',
    answer: 'Absolutely! We welcome contributions from Linux professionals and enthusiasts. Contact us to get started.'
  },
  {
    question: 'Do you provide certificates?',
    answer: 'Yes, you can earn certificates by completing certain courses and lab exercises.'
  },
  {
    question: 'How do I get support?',
    answer: 'You can reach out via our contact page or join our community for peer support.'
  },
];

const toc = [
  { label: 'General', index: 0 },
  { label: 'Pricing', index: 1 },
  { label: 'Community', index: 2 },
  { label: 'Contributions', index: 3 },
  { label: 'Certificates', index: 4 },
  { label: 'Support', index: 5 },
];

export default function FAQPage() {
  const [active, setActive] = useState(0);

  return (
    <div className="bg-gradient-to-b from-indigo-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col md:flex-row gap-12">
        {/* Floating Table of Contents */}
        <aside className="md:w-1/4 mb-8 md:mb-0 sticky top-28 self-start z-10">
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-8 md:mb-0"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">FAQ Topics</h2>
            <ul className="space-y-2">
              {toc.map((item, idx) => (
                <li key={item.label}>
                  <button
                    className={`w-full text-left px-2 py-1 rounded transition-colors duration-200 ${active === item.index ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'text-gray-700 hover:bg-indigo-50'}`}
                    onClick={() => setActive(item.index)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </aside>

        {/* FAQ Content */}
        <section className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-12 text-center"
          >
            <h1 className="text-4xl font-extrabold mb-4 text-indigo-700">Frequently Asked Questions</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Have questions? We have answers. Click a topic or browse below.
            </p>
          </motion.div>

          <div className="space-y-8">
            {faqs.map((faq, idx) => (
              <motion.div
                key={faq.question}
                id={`faq-${idx}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: active === idx ? 1 : 0.7, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`bg-white rounded-xl shadow-lg p-8 transition-all duration-300 ${active === idx ? 'ring-2 ring-indigo-400' : ''}`}
              >
                <button
                  className="w-full text-left text-2xl font-bold text-indigo-700 mb-2 focus:outline-none"
                  onClick={() => setActive(idx)}
                >
                  {faq.question}
                </button>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-gray-700 text-lg"
                >
                  {faq.answer}
                </motion.p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
} 