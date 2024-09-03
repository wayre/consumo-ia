import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { MeasureModel } from "@models/MeasureModel";
import { prisma } from "@lib/prisma";
import { handleError } from "@utils/utils";

const confirmMeasureSchema = z.object({
  measure_uuid: z.string(),
  confirmed_value: z.number(),
});

type confirmMeasureSchema = z.infer<typeof confirmMeasureSchema>;

export async function confirmMeasure(app: FastifyInstance) {
  app.patch(
    "/confirm",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        /** check if values are coming correctly */
        const result = confirmMeasureSchema.safeParse(request.body);
        if (!result.success) {
          console.log(result.error);
          throw new Error(
            JSON.stringify({
              code: "INVALID_DATA_ZOD",
              path: "",
              message: result.error,
            })
          );
        }

        const measureModel = new MeasureModel();
        const { measure_uuid, confirmed_value } = confirmMeasureSchema.parse(
          request.body
        );

        //check if measure already exists in the database
        const measureObj = await measureModel.getMeasure(measure_uuid);
        if (!measureObj) {
          throw new Error(
            JSON.stringify({
              status: 404,
              code: "MEASURE_NOT_FOUND",
              path: "",
              message: "Leitura do mês já realizada",
            })
          );
        } else {
          if (measureObj.confirmed)
            throw new Error(
              JSON.stringify({
                status: 409,
                code: "CONFIRMATION_DUPLICATE",
                path: "",
                message: "Leitura do mês já realizada",
              })
            );
        }

        // Confirm measure code
        measureModel.confirmMeasure(measure_uuid, confirmed_value);

        return reply.status(200).send({
          success: true,
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
          case "INVALID_DATA_ZOD":
            message = {
              status: 400,
              code: "INVALID_DATA",
              message: "Dados fornecidos inválidos",
            };
            break;

          case "MEASURE_NOT_FOUND":
            message = {
              status: 404,
              code: "MEASURE_NOT_FOUND",
              message: "Leitura não encontrada",
            };
            break;

          case "CONFIRMATION_DUPLICATE":
            message = {
              status: 409,
              code: "CONFIRMATION_DUPLICATE",
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
    }
  );
}
