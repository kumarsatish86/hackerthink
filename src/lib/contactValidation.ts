import DOMPurify from 'isomorphic-dompurify';

// Sanitize string input to prevent XSS
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Remove HTML tags and sanitize
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  }).trim();
}

// Validate email format
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

// Sanitize email to prevent header injection
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }
  
  // Remove newlines, carriage returns, and other control characters
  return email.replace(/[\r\n\t]/g, '').trim();
}

// Validate contact form data
export interface ContactFormData {
  senderName: string;
  senderEmail: string;
  subject: string;
  messageContent: string;
  inquiryType: string;
  honeypot?: string;
  recaptchaToken?: string;
}

export function validateContactForm(data: Partial<ContactFormData>): {
  isValid: boolean;
  errors: string[];
  sanitized: ContactFormData | null;
} {
  const errors: string[] = [];
  
  // Validate sender name
  if (!data.senderName || typeof data.senderName !== 'string') {
    errors.push('Name is required');
  } else if (data.senderName.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  } else if (data.senderName.trim().length > 255) {
    errors.push('Name must be less than 255 characters');
  }
  
  // Validate email
  if (!data.senderEmail || typeof data.senderEmail !== 'string') {
    errors.push('Email is required');
  } else if (!validateEmail(data.senderEmail)) {
    errors.push('Invalid email format');
  }
  
  // Validate subject
  if (!data.subject || typeof data.subject !== 'string') {
    errors.push('Subject is required');
  } else if (data.subject.trim().length < 3) {
    errors.push('Subject must be at least 3 characters');
  } else if (data.subject.trim().length > 500) {
    errors.push('Subject must be less than 500 characters');
  }
  
  // Validate message
  if (!data.messageContent || typeof data.messageContent !== 'string') {
    errors.push('Message is required');
  } else if (data.messageContent.trim().length < 10) {
    errors.push('Message must be at least 10 characters');
  } else if (data.messageContent.trim().length > 10000) {
    errors.push('Message must be less than 10,000 characters');
  }
  
  // Validate inquiry type
  if (!data.inquiryType || typeof data.inquiryType !== 'string') {
    errors.push('Inquiry type is required');
  }
  
  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
      sanitized: null,
    };
  }
  
  // Sanitize all inputs
  const sanitized: ContactFormData = {
    senderName: sanitizeInput(data.senderName!),
    senderEmail: sanitizeEmail(data.senderEmail!),
    subject: sanitizeInput(data.subject!),
    messageContent: sanitizeInput(data.messageContent!),
    inquiryType: sanitizeInput(data.inquiryType!),
    honeypot: data.honeypot,
    recaptchaToken: data.recaptchaToken,
  };
  
  return {
    isValid: true,
    errors: [],
    sanitized,
  };
}
