// src/utils/user-identity.ts
// Centralized user identity management

export const getUserIdentifier = (): string => {
  if (typeof window === 'undefined') return '';
  
  let identifier = localStorage.getItem('user_identifier');
  
  if (!identifier) {
    identifier = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('user_identifier', identifier);
  }
  
  return identifier;
};

export const clearUserIdentifier = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user_identifier');
  }
};