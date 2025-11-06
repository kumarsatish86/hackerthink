'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { generateHoneypotFieldName } from '@/lib/honeypot';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { FaUser, FaEnvelope, FaTag, FaFileAlt, FaComment, FaPaperPlane, FaSpinner } from 'react-icons/fa';

// Form validation schema
const contactFormSchema = z.object({
  senderName: z.string().min(2, 'Name must be at least 2 characters').max(255, 'Name is too long'),
  senderEmail: z.string().email('Invalid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(500, 'Subject is too long'),
  messageContent: z.string().min(10, 'Message must be at least 10 characters').max(10000, 'Message is too long'),
  inquiryType: z.string().min(1, 'Please select an inquiry type'),
});

type ContactFormData = z.infer<typeof contactFormSchema> & {
  honeypot?: string;
};

interface ContactFormProps {
  inquiryTypes?: Array<{ id: number; type_name: string; is_active: boolean }>;
}

export default function ContactForm({ inquiryTypes = [] }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [honeypotFieldName] = useState(() => generateHoneypotFieldName());
  const [spamProtectionType, setSpamProtectionType] = useState<'honeypot' | 'recaptcha'>('honeypot');
  const [recaptchaSiteKey, setRecaptchaSiteKey] = useState<string>('');
  
  // Initialize reCAPTCHA hook - must be called unconditionally at top level
  // Provider is always available (wrapped in providers.tsx), so this is safe
  const recaptchaHook = useGoogleReCaptcha();
  const executeRecaptcha = recaptchaHook?.executeRecaptcha;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  // Fetch inquiry types and spam protection settings
  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch('/api/contact/settings');
        if (response.ok) {
          const data = await response.json();
          setSpamProtectionType(data.spamProtectionType || 'honeypot');
          setRecaptchaSiteKey(data.recaptchaSiteKey || '');
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    }
    fetchSettings();
  }, []);

  // Only use reCAPTCHA if it's enabled and site key is available
  const shouldUseRecaptcha = spamProtectionType === 'recaptcha' && recaptchaSiteKey && executeRecaptcha;

  const onSubmit = async (data: ContactFormData) => {
    if (isSubmitting) return;

    // Honeypot check
    if (data.honeypot && data.honeypot.trim().length > 0) {
      // Bot detected, silently fail
      toast.success('Thank you for your message!');
      reset();
      return;
    }

    setIsSubmitting(true);

    try {
      let recaptchaToken = '';
      
      // Get reCAPTCHA token if using reCAPTCHA
      if (shouldUseRecaptcha && executeRecaptcha) {
        try {
          recaptchaToken = await executeRecaptcha('contact_form');
          if (!recaptchaToken) {
            toast.error('Please verify you are not a robot');
            setIsSubmitting(false);
            return;
          }
        } catch (error) {
          console.error('reCAPTCHA error:', error);
          toast.error('Please verify you are not a robot');
          setIsSubmitting(false);
          return;
        }
      } else if (shouldUseRecaptcha && !executeRecaptcha) {
        // reCAPTCHA is enabled but provider is not available
        console.warn('reCAPTCHA provider not available, falling back to honeypot');
        // Continue with honeypot protection
      }

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          recaptchaToken: recaptchaToken || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit form');
      }

      toast.success('Thank you for contacting us! We will get back to you soon.');
      reset();
    } catch (error: any) {
      console.error('Form submission error:', error);
      toast.error(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Honeypot field - hidden from users */}
      <input
        type="text"
        name={honeypotFieldName}
        tabIndex={-1}
        autoComplete="off"
        style={{
          position: 'absolute',
          left: '-9999px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
        {...register('honeypot' as any)}
      />

      {/* Name */}
      <div className="group">
        <label htmlFor="senderName" className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <FaUser className="w-4 h-4 text-gray-500" />
          Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FaUser className="w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors duration-200" />
          </div>
          <input
            id="senderName"
            type="text"
            {...register('senderName')}
            className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl bg-gray-50/50 focus:bg-white transition-all duration-200 ${
              errors.senderName 
                ? 'border-red-500 focus:ring-4 focus:ring-red-500/20 focus:border-red-500' 
                : 'border-gray-200 focus:ring-4 focus:ring-red-500/20 focus:border-red-500 hover:border-gray-300'
            } placeholder:text-gray-400 text-gray-900 font-medium`}
            placeholder="Your full name"
          />
        </div>
        {errors.senderName && (
          <p className="mt-2 text-sm text-red-600 font-medium flex items-center gap-1 animate-shake">
            <span>⚠</span> {errors.senderName.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="group">
        <label htmlFor="senderEmail" className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <FaEnvelope className="w-4 h-4 text-gray-500" />
          Email <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FaEnvelope className="w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors duration-200" />
          </div>
          <input
            id="senderEmail"
            type="email"
            {...register('senderEmail')}
            className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl bg-gray-50/50 focus:bg-white transition-all duration-200 ${
              errors.senderEmail 
                ? 'border-red-500 focus:ring-4 focus:ring-red-500/20 focus:border-red-500' 
                : 'border-gray-200 focus:ring-4 focus:ring-red-500/20 focus:border-red-500 hover:border-gray-300'
            } placeholder:text-gray-400 text-gray-900 font-medium`}
            placeholder="your.email@example.com"
          />
        </div>
        {errors.senderEmail && (
          <p className="mt-2 text-sm text-red-600 font-medium flex items-center gap-1 animate-shake">
            <span>⚠</span> {errors.senderEmail.message}
          </p>
        )}
      </div>

      {/* Inquiry Type */}
      <div className="group">
        <label htmlFor="inquiryType" className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <FaTag className="w-4 h-4 text-gray-500" />
          Inquiry Type <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FaTag className="w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors duration-200" />
          </div>
          <select
            id="inquiryType"
            {...register('inquiryType')}
            className={`w-full pl-12 pr-10 py-4 border-2 rounded-xl bg-gray-50/50 focus:bg-white transition-all duration-200 appearance-none cursor-pointer ${
              errors.inquiryType 
                ? 'border-red-500 focus:ring-4 focus:ring-red-500/20 focus:border-red-500' 
                : 'border-gray-200 focus:ring-4 focus:ring-red-500/20 focus:border-red-500 hover:border-gray-300'
            } text-gray-900 font-medium`}
          >
            <option value="">Select an inquiry type</option>
            {inquiryTypes
              .filter((type) => type.is_active)
              .map((type) => (
                <option key={type.id} value={type.type_name}>
                  {type.type_name}
                </option>
              ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {errors.inquiryType && (
          <p className="mt-2 text-sm text-red-600 font-medium flex items-center gap-1 animate-shake">
            <span>⚠</span> {errors.inquiryType.message}
          </p>
        )}
      </div>

      {/* Subject */}
      <div className="group">
        <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <FaFileAlt className="w-4 h-4 text-gray-500" />
          Subject <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FaFileAlt className="w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors duration-200" />
          </div>
          <input
            id="subject"
            type="text"
            {...register('subject')}
            className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl bg-gray-50/50 focus:bg-white transition-all duration-200 ${
              errors.subject 
                ? 'border-red-500 focus:ring-4 focus:ring-red-500/20 focus:border-red-500' 
                : 'border-gray-200 focus:ring-4 focus:ring-red-500/20 focus:border-red-500 hover:border-gray-300'
            } placeholder:text-gray-400 text-gray-900 font-medium`}
            placeholder="Brief subject line"
          />
        </div>
        {errors.subject && (
          <p className="mt-2 text-sm text-red-600 font-medium flex items-center gap-1 animate-shake">
            <span>⚠</span> {errors.subject.message}
          </p>
        )}
      </div>

      {/* Message */}
      <div className="group">
        <label htmlFor="messageContent" className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <FaComment className="w-4 h-4 text-gray-500" />
          Message <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute top-4 left-4 pointer-events-none">
            <FaComment className="w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors duration-200" />
          </div>
          <textarea
            id="messageContent"
            rows={8}
            {...register('messageContent')}
            className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl bg-gray-50/50 focus:bg-white transition-all duration-200 resize-none ${
              errors.messageContent 
                ? 'border-red-500 focus:ring-4 focus:ring-red-500/20 focus:border-red-500' 
                : 'border-gray-200 focus:ring-4 focus:ring-red-500/20 focus:border-red-500 hover:border-gray-300'
            } placeholder:text-gray-400 text-gray-900 font-medium`}
            placeholder="Please provide details about your inquiry..."
          />
        </div>
        {errors.messageContent && (
          <p className="mt-2 text-sm text-red-600 font-medium flex items-center gap-1 animate-shake">
            <span>⚠</span> {errors.messageContent.message}
          </p>
        )}
      </div>

      {/* Privacy Notice */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50/50 border border-gray-200">
        <p className="text-sm text-gray-600 leading-relaxed">
          By submitting this form, you agree to our{' '}
          <a href="/privacy-policy" className="text-red-600 hover:text-red-700 font-semibold underline underline-offset-2 transition-colors duration-200">
            Privacy Policy
          </a>
          . We will only use your email to respond to your inquiry.
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="group relative w-full bg-gradient-to-r from-red-600 via-red-600 to-red-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 focus:outline-none focus:ring-4 focus:ring-red-500/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
        <span className="relative flex items-center justify-center gap-3">
          {isSubmitting ? (
            <>
              <FaSpinner className="w-5 h-5 animate-spin" />
              <span>Sending Message...</span>
            </>
          ) : (
            <>
              <FaPaperPlane className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
              <span>Send Message</span>
            </>
          )}
        </span>
      </button>
    </form>
  );
}
