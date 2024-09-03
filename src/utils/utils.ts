import * as fs from "fs";
import * as path from "path";

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
 * @param str string representing a Base64 imagefalse;
 * @returns boolean
 */
export function isBase64Image(str: string | undefined): boolean {
  if (!str) return false;

  // Checks if the string has the correct prefix for a Base64 image
  const regex = /^data:image\/(png|jpeg|jpg|gif);base64,/;
  if (!regex.test(str)) {
    return false;
    //throw new Error("Invalid Base64 string. It seems to be not a Base64 image");
  }

  // Removes the prefix from the string
  const base64String = str.replace(regex, "");

  // Checks if the remaining string is a valid Base64
  try {
    return btoa(atob(base64String)) === base64String;
  } catch {
    throw new Error(
      JSON.stringify([
        {
          code: "INVALID_DATA",
          path: "image",
          message: "Invalid Base64 string. It seems to be a corrupted image.",
        },
      ])
    );
    // // console.log("Invalid Base64 string. It seems to be a corrupted image");
    // return false;
  }
}

/**
 * Extract the file type of a Base64 image with regex.
 * @param str string representing a Base64 image
 * @returns string representing the file type of the Base64 image
 */
export function getFileType(str: string | undefined): string | false {
  if (!str) return false;
  const regex = /^data:image\/(png|jpeg|jpg|gif);base64,/;
  const match = str.match(regex);

  if (match) {
    return match[1];
  }

  throw new Error(
    "Invalid Base64 string. It seems to be a corrupted image or not a Base64 image"
  );
  return false;
}

export const createFileNameBase64 = (fileBase64: string): string => {
  const extension = getFileType(fileBase64.slice(0, 30));
  return `${Date.now()}.${extension}`;
};

/**
 * Function to save a Base64-encoded file to the './public/images' folder
 * and return the nameFile saved or false on failure.
 * @param base64String string representing the Base64-encoded image
 * @returns string | false on success return fileNameSaved or error message on failure
 */
export function saveImageBase64ToFile(base64String: string): string | false {
  // Regular expression to extract the file type (png, jpeg, etc.)
  const regex = /^data:image\/(png|jpeg|jpg|gif);base64,/;
  const match = base64String.match(regex);

  if (!match) {
    throw new Error("Invalid Base64 string.");
    return false;
  }

  // Extract the file type and remove the Base64 prefix from the string
  const base64Data = base64String.replace(regex, "");

  const finalFileName = createFileNameBase64(base64String);

  // Define the full path to save the file
  const filePath = path.join(
    __dirname,
    "..",
    "..",
    "public",
    "images",
    finalFileName
  );

  // Ensure the directory exists
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  // Decode the Base64 data and save the file
  try {
    fs.writeFileSync(filePath, base64Data, "base64");
    return finalFileName;
  } catch (err) {
    throw new Error("Error saving the file:");
    return false;
  }
}

export function getImageBase64(
  base64String: string | undefined
): string | undefined {
  if (!base64String) return undefined;

  // Regular expression to extract the file type (png, jpeg, etc.)
  const regex = /^data:image\/(png|jpeg|jpg|gif);base64,/;
  const match = base64String.match(regex);

  if (!match) {
    throw new Error(
      JSON.stringify([
        {
          code: "INVALID_DATA",
          path: "",
          message: "Error when picking up the content of the image",
        },
      ])
    );
  }

  // Extract the file type and remove the Base64 prefix from the string
  const base64Data = base64String.replace(regex, "");

  return base64Data;
}

/**
 * Parses a string to an object if it is a valid JSON string.
 * Performs recursive parsing if necessary.
 *
 * @param input - The string to be parsed.
 * @returns The parsed object if input is a valid JSON, or the original input if not.
 */
export function handleError(input: string): any {
  try {
    // Parse the string once
    let parsed = JSON.parse(input);

    // Function to recursively handle nested objects
    function recursiveParse(obj: any): any {
      if (typeof obj === "string") {
        try {
          // Attempt to parse nested strings
          const nestedParsed = JSON.parse(obj);
          return recursiveParse(nestedParsed);
        } catch {
          // Return the string if it cannot be parsed
          return obj;
        }
      } else if (Array.isArray(obj)) {
        return obj.map((item) => recursiveParse(item));
      } else if (typeof obj === "object" && obj !== null) {
        const result: any = {};
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            result[key] = recursiveParse(obj[key]);
          }
        }
        return result;
      }
      return obj;
    }

    // Return the recursively parsed object
    return recursiveParse(parsed);
  } catch {
    // Return the original input if parsing fails
    return input;
  }
}
export function isValidUUID(uuid: string): boolean {
  // Regular expression for UUID v4
  const uuidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return uuidRegex.test(uuid);
}
