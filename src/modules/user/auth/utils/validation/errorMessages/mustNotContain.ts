export const getMustNotContainMessage = (
  fieldName: string,
  symbol: string
): string =>
  `${
    fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
  } must not contain "${symbol}" symbol`;
