import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "@lib/prisma";
import {
  isBase64Image,
  saveImageBase64ToFile,
  getImageBase64,
  handleError,
} from "@utils/utils";
import { MeasureModel } from "@models/MeasureModel";

const createMeasureSchema = z.object({
  image: z.string(), //.base64(),
  customer_code: z.string(),
  measure_datetime: z.string().datetime(),
  measure_type: z.enum(["WATER", "GAS"]),
});

type createMeasureSchema = z.infer<typeof createMeasureSchema>;

export async function createMeasure(app: FastifyInstance) {
  app.post("/upload", async (request: FastifyRequest, reply: FastifyReply) => {
    const result = createMeasureSchema.safeParse(request.body);

    try {
      /** check if values are coming correctly */
      const isBase64 = isBase64Image(result.data?.image);
      if (!result.success)
        throw new Error(
          JSON.stringify({
            code: "INVALID_DATA",
            path: "image",
            message: `${result.error.message}`,
          })
        );
      if (!isBase64) {
        throw new Error(
          JSON.stringify({
            code: "INVALID_DATA",
            path: "image",
            message:
              "Invalid Base64 string data. It seems to be not a Base64 image.",
          })
        );
      }

      const { image, customer_code, measure_datetime, measure_type } =
        createMeasureSchema.parse(request.body);

      const measureModel = new MeasureModel();

      /** check if a record was made this month */
      const existsRegisterCurrentMonth =
        await measureModel.checkMeasureForCurrentMonth(
          new Date(measure_datetime),
          measure_type
        );

      if (existsRegisterCurrentMonth) {
        throw new Error(
          JSON.stringify({
            code: "DOUBLE_REPORT",
            path: "",
            message: "Leitura do mês já realizada",
          })
        );
      }

      /** Access the LLM and take the text of the image */
      const fileContentBase64 = getImageBase64(image);
      const numberfromImage =
        await measureModel.getNumberFromImage(fileContentBase64);

      if (numberfromImage === null) {
        throw new Error(
          JSON.stringify({
            code: "INVALID_OCR_DATA",
            path: "measure_value inválido",
            message: "Ocr da Imagem inválida. Tente novamente.",
          })
        );
      }

      const measure_value = numberfromImage;
      const fileName = saveImageBase64ToFile(image);
      const imageUrl = `/public/images/${fileName}`;

      /** Cria um novo registro e retorna apenas os campos selecionados */
      const newMeasure = await measureModel.createMeasure({
        image_url: imageUrl,
        customer_code,
        measure_datetime,
        measure_type,
        measure_value,
      });

      return reply.status(200).send({
        image_url: newMeasure.image_url,
        measure_value: newMeasure.measure_value,
        measure_uuid: newMeasure.measure_uuid,
      });

      // eslint-disable-next-line
    } catch (error: any) {
      const handle = handleError(error.message);

      type ErrorMessage = {
        code?: string;
        message?: string;
        status?: number;
      };
      const msgDetails = handle.message[0].path
        ? `${handle.message[0].path.join(", ")} ${handle.message[0].message}`
        : `${handle.message}`;

      let message: ErrorMessage = {};
      switch (handle.code) {
        case "INVALID_DATA":
          message = {
            status: 400,
            code: "INVALID_DATA",
            message: `Dados fornecidos inválidos. ${msgDetails}`,
          };
          break;

        case "DOUBLE_REPORT":
          message = {
            status: 409,
            code: "DOUBLE_REPORT",
            message: "Leitura do mês já realizada",
          };
          break;

        default:
          message = {
            status: 400,
            code: "INVALID_DATA",
            message: msgDetails,
          };
      }

      reply.status(message.status || 400).send({
        error_code: message.code,
        error_description: message.message,
      });
    } finally {
      await prisma.$disconnect();
    }
  });
}
