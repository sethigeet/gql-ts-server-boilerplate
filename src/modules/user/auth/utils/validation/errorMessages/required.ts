export const getRequiredMessage = (fieldName: string): string =>
  `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required!`;
