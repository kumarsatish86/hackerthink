// Generate a random honeypot field name
export function generateHoneypotFieldName(): string {
  const randomString = Math.random().toString(36).substring(2, 15);
  return `website_${randomString}`;
}

// Validate honeypot field (should be empty for real users)
export function validateHoneypot(honeypotValue: string | undefined | null): boolean {
  // If honeypot field is filled, it's likely a bot
  if (honeypotValue && honeypotValue.trim().length > 0) {
    return false; // Bot detected
  }
  return true; // Likely a real user
}
