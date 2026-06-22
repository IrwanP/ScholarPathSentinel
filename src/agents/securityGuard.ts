import { StudentProfile } from "../types";

/**
 * Sanitizes input text by masking emails and phone numbers,
 * and replacing common prompt-injection phrases with placeholders.
 */
export function sanitizeText(value: string): string {
  if (!value) return value;
  
  // 1. Mask Emails
  // Matches typical emails like standard@domain.com
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  let sanitized = value.replace(emailRegex, "[EMAIL_MASKED]");

  // 2. Mask Phone Numbers
  // Matches phone numbers with 7+ digits and optional formatting (+, -, spaces, parens)
  // Avoiding matching short numbers, GPA, years
  const phoneRegex = /\+?\b\d{1,4}[-.\s]?\(?\d{1,3}\)?[-.\s]?(?:\d[-.\s]?){6,10}\d\b/g;
  sanitized = sanitized.replace(phoneRegex, "[PHONE_MASKED]");

  // 3. Remove Common Prompt Injection Phrases
  const injectionPhrases = [
    /ignore[\s-_]*previous[\s-_]*instructions/gi,
    /ignore[\s-_]*the[\s-_]*above[\s-_]*instructions/gi,
    /system[\s-_]*override/gi,
    /you[\s-_]*are[\s-_]*now[\s-_]*a/gi,
    /new[\s-_]*instructions/gi,
    /forget[\s-_]*what[\s-_]*I[\s-_]*said/gi,
    /forget[\s-_]*all[\s-_]*previous[\s-_]*instructions/gi,
    /bypass[\s-_]*safety[\s-_]*filters/gi,
    /bypass[\s-_]*security/gi,
    /acting[\s-_]*as[\s-_]*a/gi,
    /jailbreak/gi,
    /dan[\s-_]*mode/gi,
    /do[\s-_]*anything[\s-_]*now/gi,
  ];

  for (const phraseRegex of injectionPhrases) {
    sanitized = sanitized.replace(phraseRegex, "[PROMPT_INJECTION_REMOVED]");
  }

  return sanitized;
}

/**
 * Evaluates the student profile for safety risks,
 * sanitizes any PII or injection phrases found,
 * and generates a trace log for transparency.
 */
export function securityGuardAgent(profile: StudentProfile) {
  const issues: string[] = [];
  let piiDetected = false;
  let injectionDetected = false;

  // Clone profile to prevent mutation of the original
  const sanitizedProfile: StudentProfile = {
    ...profile,
    targetCountries: [...profile.targetCountries],
    fields: [...profile.fields],
  };

  // Helper to check and sanitize string attributes
  const checkAndSanitize = (field: keyof StudentProfile, fieldName: string) => {
    const originalValue = profile[field];
    if (typeof originalValue === "string") {
      const sanitized = sanitizeText(originalValue);
      if (sanitized !== originalValue) {
        (sanitizedProfile as any)[field] = sanitized;
        
        if (sanitized.includes("[EMAIL_MASKED]")) {
          issues.push(`Masked email inside profile ${fieldName}.`);
          piiDetected = true;
        }
        if (sanitized.includes("[PHONE_MASKED]")) {
          issues.push(`Masked phone number inside profile ${fieldName}.`);
          piiDetected = true;
        }
        if (sanitized.includes("[PROMPT_INJECTION_REMOVED]")) {
          issues.push(`Removed prompt injection phrase inside profile ${fieldName}.`);
          injectionDetected = true;
        }
      }
    }
  };

  // Sanitize main string fields in StudentProfile
  checkAndSanitize("name", "Name");
  checkAndSanitize("origin", "Origin");
  checkAndSanitize("englishScore", "English Score");
  checkAndSanitize("preferredIntakeYear", "Preferred Intake Year");

  // Sanitize array fields
  sanitizedProfile.targetCountries = profile.targetCountries.map((c, idx) => {
    const sanitized = sanitizeText(c);
    if (sanitized !== c) {
      if (sanitized.includes("[EMAIL_MASKED]")) {
        issues.push(`Masked email in Target Countries index ${idx}.`);
        piiDetected = true;
      }
      if (sanitized.includes("[PHONE_MASKED]")) {
        issues.push(`Masked phone number in Target Countries index ${idx}.`);
        piiDetected = true;
      }
      if (sanitized.includes("[PROMPT_INJECTION_REMOVED]")) {
        issues.push(`Removed prompt injection phrase in Target Countries index ${idx}.`);
        injectionDetected = true;
      }
    }
    return sanitized;
  });

  sanitizedProfile.fields = profile.fields.map((f, idx) => {
    const sanitized = sanitizeText(f);
    if (sanitized !== f) {
      if (sanitized.includes("[EMAIL_MASKED]")) {
        issues.push(`Masked email in Fields index ${idx}.`);
        piiDetected = true;
      }
      if (sanitized.includes("[PHONE_MASKED]")) {
        issues.push(`Masked phone number in Fields index ${idx}.`);
        piiDetected = true;
      }
      if (sanitized.includes("[PROMPT_INJECTION_REMOVED]")) {
        issues.push(`Removed prompt injection phrase in Fields index ${idx}.`);
        injectionDetected = true;
      }
    }
    return sanitized;
  });

  const passed = issues.length === 0;

  const trace = {
    agentName: "Security Guard Agent",
    status: passed ? ("success" as const) : ("warning" as const),
    message: passed 
      ? "Profile passed all security checks successfully." 
      : `Security checks completed with warnings. Issues found: ${issues.length}.`,
    timestamp: new Date().toISOString(),
    details: {
      piiDetected,
      injectionDetected,
      issuesFound: issues,
      originalProfile: {
        name: profile.name,
        origin: profile.origin,
        targetCountries: profile.targetCountries,
        fields: profile.fields,
      },
      sanitizedProfile: {
        name: sanitizedProfile.name,
        origin: sanitizedProfile.origin,
        targetCountries: sanitizedProfile.targetCountries,
        fields: sanitizedProfile.fields,
      }
    }
  };

  return {
    sanitizedProfile,
    passed,
    issues,
    trace,
  };
}
