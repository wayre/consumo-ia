import { prisma } from "@lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { isValidUUID } from "@/utils/utils";

export class MeasureModel {
  private apiKey: string;
  private geminiUrl: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY is not defined");
      process.exit(1); // Exit the process with an error code
    }
    this.apiKey = apiKey;
    this.geminiUrl =
      "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent";
  }

  /**
   * Checks if there are any measures for a specific month and type.
   *
   * @param measureDatetime - The date to check for the month and year.
   * @param measureType - The type of measure to filter by.
   * @returns True if there is at least one measure in the specified month and year with the given type, false otherwise.
   */
  async checkMeasureForCurrentMonth(
    measureDatetime: Date,
    measureType: string
  ): Promise<boolean> {
    // Extract year and month from the provided date
    const year = measureDatetime.getFullYear();
    const month = measureDatetime.getMonth();

    // Calculate the start and end dates of the month
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

    try {
      // Fetch the first measure that matches the criteria
      const measure = await prisma.measure.findFirst({
        where: {
          measure_datetime: {
            gte: startOfMonth, // Greater than or equal to the start of the month
            lte: endOfMonth, // Less than or equal to the end of the month
          },
          measure_type: measureType, // Filter by the measure type
        },
      });

      // Return true if a measure was found, otherwise false
      return measure !== null;
    } catch (error) {
      console.error("Error checking measure for current month:", error);
      throw new Error("An error occurred while checking measures.");
    }
  }

  /**
   * Fetches measure record by UUID.
   * @param measureUuid string - UUID of the measurement record
   * @returns object Measure | null - Measure record or null if not found
   */
  async getMeasure(measureUuid: string): Promise<Measure | null> {
    try {
      if (!isValidUUID(measureUuid)) {
        throw new Error(
          JSON.stringify({
            code: "INVALID_DATA_ZOD",
            path: "",
            message:
              "Invalid measure UUID format. It should be a valid UUID v4.",
          })
        );
      }

      // Busca o registro pelo measure_uuid
      const measure = await prisma.measure.findUnique({
        where: {
          measure_uuid: measureUuid,
        },
      });

      // Retorna o objeto measure ou null se não for encontrado
      return measure;
    } catch (error) {
      console.error("Error retrieving measure:", error);
      throw error;
    }
  }

  async getMeasuresByUser(customerCode: string): Promise<Measure[] | null> {
    try {
      // Busca o registro pelo measure_uuid
      const measures = await prisma.measure.findMany({
        where: {
          customer_code: customerCode,
        },
      });

      // Retorna o objeto measure ou null se não for encontrado
      return measures;
    } catch (error) {
      console.error("Error retrieving measures:", error);
      throw error;
    }
  }
  /**
   * Sets measure.confirmed to true.
   * @param measureUuid string - UUID of the measurement record
   * @param confirmedValue number - New confirmed value
   */
  async confirmMeasure(
    measureUuid: string,
    confirmedValue: number
  ): Promise<void> {
    try {
      // Atualiza o campo "confirmed" para true onde o measure_uuid corresponde
      await prisma.measure.update({
        where: {
          measure_uuid: measureUuid,
        },
        data: {
          confirmed: true,
          measure_value: confirmedValue,
        },
      });

      console.log(`Measure with UUID ${measureUuid} has been confirmed.`);
    } catch (error) {
      console.error("Error confirming measure:", error);
      throw error;
    }
  }

  /**
   * Check if the registration has been confirmed
   * @param measureUuid string - UUID of the measurement record
   * @returns true if the measure is confirmed, false otherwise
   */
  async isMeasureConfirmed(measureUuid: string): Promise<boolean> {
    try {
      // Busca o registro pelo measure_uuid e retorna apenas o campo "confirmed"
      const measure = await prisma.measure.findFirst({
        where: {
          measure_uuid: measureUuid,
        },
        select: {
          confirmed: true,
        },
      });

      // Se o registro não for encontrado, ou se confirmed for false ou null, retorna false
      if (!measure || !measure.confirmed) {
        return false;
      }

      // Retorna true se o campo confirmed for true
      return true;
    } catch (error) {
      console.error("Error checking if measure is confirmed:", error);
      throw error;
    }
  }

  // Função para criar um novo registro na tabela Measure e retornar campos específicos
  async createMeasure(data: {
    image_url: string;
    customer_code: string;
    measure_datetime: string;
    measure_type: string;
    measure_value: number;
  }) {
    const measure = await prisma.measure.create({
      data: {
        image_url: data.image_url,
        customer_code: data.customer_code,
        measure_datetime: data.measure_datetime,
        measure_type: data.measure_type,
        measure_value: data.measure_value,
      },
      select: {
        image_url: true,
        measure_value: true,
        measure_uuid: true,
      },
    });

    return measure;
  }

  async updateMeasure(data: { measure_uuid: string; measure_value: number }) {
    const measure = await prisma.measure.update({
      where: {
        measure_uuid: data.measure_uuid,
      },
      data: {
        measure_value: data.measure_value,
      },
      select: {
        measure_uuid: true,
        measure_value: true,
      },
    });

    return measure;
  }

  // Function to send an image to Google Gemini and return the detected number
  async getNumberFromImage(
    imageBase64: string | undefined
  ): Promise<number | null> {
    if (!imageBase64) return null;

    try {
      const genAI = new GoogleGenerativeAI(this.apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      if (!model) {
        throw new Error("Failed to initialize the Generative AI model");
      }

      const prompt = "Extract the number from this utility bill image.";
      const image = {
        inlineData: {
          data: imageBase64,
          mimeType: "image/jpg",
        },
      };

      const result = await model.generateContent([prompt, image]);

      const numberOCR = this.extractNumberFromText(result.response.text());
      return numberOCR;
    } catch (error) {
      console.error("Error in getNumberFromImage:", error);
      return null;
    }
  }

  // Helper function to extract the number from the returned text
  private extractNumberFromText(text: string): number | null {
    const match = text.match(/\d+(\.\d+)?/); // Regex to extract numbers, including decimals
    return match ? parseFloat(match[0]) : null;
  }
}
