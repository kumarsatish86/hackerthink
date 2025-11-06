// Verify reCAPTCHA token
export async function verifyRecaptcha(token: string): Promise<{ success: boolean; score?: number; error?: string }> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  
  if (!secretKey) {
    console.warn('RECAPTCHA_SECRET_KEY not set, skipping verification');
    return { success: true }; // Allow if not configured
  }
  
  if (!token) {
    return { success: false, error: 'reCAPTCHA token is missing' };
  }
  
  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });
    
    const data = await response.json();
    
    if (data.success) {
      // For reCAPTCHA v3, check score (0.0 to 1.0, higher is better)
      const score = data.score || 0.5;
      const threshold = 0.5; // Adjust threshold as needed
      
      if (score >= threshold) {
        return { success: true, score };
      } else {
        return { success: false, error: `reCAPTCHA score too low: ${score}` };
      }
    } else {
      return { success: false, error: data['error-codes']?.join(', ') || 'reCAPTCHA verification failed' };
    }
  } catch (error: any) {
    console.error('Error verifying reCAPTCHA:', error);
    return { success: false, error: error.message || 'Failed to verify reCAPTCHA' };
  }
}

// Get spam protection type from settings
export async function getSpamProtectionType(): Promise<'honeypot' | 'recaptcha'> {
  try {
    const { query } = await import('./db');
    const result = await query(
      "SELECT setting_value FROM contact_settings WHERE setting_key = 'spam_protection_type'"
    );
    
    const protectionType = result.rows.length > 0 
      ? (result.rows[0].setting_value || 'honeypot')
      : 'honeypot';
    
    return protectionType === 'recaptcha' ? 'recaptcha' : 'honeypot';
  } catch (error) {
    console.error('Error getting spam protection type:', error);
    return 'honeypot'; // Default to honeypot
  }
}
