/**
 * Sanitizes filenames, removes accents, spaces, and invalid characters.
 * @param str string to sanitize
 * @returns
 */
export function sanitizeFilename(str: string): string {
  // Remove accents
  const withoutAccents = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Swap spaces for underline
  const withUnderscores = withoutAccents.replace(/\s+/g, "_");

  // Remove invalid characters for file names
  const sanitized = withUnderscores.replace(/[^a-zA-Z0-9._-]/g, "");

  return sanitized;
}

/**
 * Validates Base64 image strings using regex and Base64 decoding.
 * @param str string representing a Base64 image
 * @returns boolean
 */
export function isBase64Image(str: string): boolean {
  if (typeof str !== "string") {
    return false;
  }

  // Checks if the string has the correct prefix for a Base64 image
  const regex = /^data:image\/(png|jpeg|jpg|gif);base64,/;
  if (!regex.test(str)) {
    return false;
  }

  // Removes the prefix from the string
  const base64String = str.replace(regex, "");

  // Checks if the remaining string is a valid Base64
  try {
    return btoa(atob(base64String)) === base64String;
  } catch {
    return false;
  }
}

/**
 * Extract the file type of a Base64 image with regex.
 * @param str string representing a Base64 image
 * @returns string representing the file type of the Base64 image
 */
export function getFileType(str: string): string {
  const regex = /^data:image\/(png|jpeg|jpg|gif);base64,/;
  const match = str.match(regex);

  if (match) {
    return match[1];
  }

  return false;
}
