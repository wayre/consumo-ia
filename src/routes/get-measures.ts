import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { MeasureModel } from "@models/MeasureModel";
import { handleError } from "@/utils/utils";

export async function getMeasures(app: FastifyInstance) {
  app.get(
    "/:customerCode/list",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { customerCode } = request.params;

        const measureModel = new MeasureModel();
        const measures = await measureModel.getMeasuresByUser(customerCode);

        return reply.status(200).send(measures);
      } catch (error) {
        const handle = handleError(error.message);
        console.log(handle);

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
          default:
            message = {
              status: 400,
              code: "INVALID_DATA",
              message: msgDetails,
            };
        }
      }
    }
  );
}
