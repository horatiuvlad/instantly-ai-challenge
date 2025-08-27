export const validateEmail = (email: string): boolean => {
  if (!email || email.trim() === '') {
    return true; // Empty email is valid for optional fields
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const validateEmailField = (
  emails: string
): { isValid: boolean; invalidEmails: string[] } => {
  if (!emails || emails.trim() === '') {
    return { isValid: true, invalidEmails: [] };
  }

  // Split by comma and validate each email
  const emailList = emails.split(',').map((email) => email.trim());
  const invalidEmails = emailList.filter(
    (email) => email && !validateEmail(email)
  );

  return {
    isValid: invalidEmails.length === 0,
    invalidEmails,
  };
};
