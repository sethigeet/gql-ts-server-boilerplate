export const MIN_LEN = 3;

export const getMinLenMessage = (fieldName: string): string =>
  `${
    fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
  } must be at least ${MIN_LEN} characters long!`;
