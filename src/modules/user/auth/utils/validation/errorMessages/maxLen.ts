export const MAX_LEN = 20;

export const getMaxLenMessage = (fieldName: string): string =>
  `${
    fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
  } cannot be longer than ${MAX_LEN} characters!`;
