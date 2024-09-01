import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "@lib/prisma";

const createMeasureSchema = z.object({
  image: z.string(), //.base64(),
  customer_code: z.string(),
  measure_datetime: z.string().datetime(),
  measure_type: z.enum(["WATER", "GAS"]),
});

type createMeasureSchema = z.infer<typeof createMeasureSchema>;

export async function createMeasure(app: FastifyInstance) {
  app.post("/upload", async (request, reply) => {
    const result = createMeasureSchema.safeParse(request.body);

    //check if values are coming correctly
    if (!result.success) {
      return reply.status(400).send({
        error_code: result.error.issues[0].code,
        error_description: result.error.issues[0].message,
      });
    }

    //here you need to check if this already exists
    //a reading for this type in the current month
    //implement here

    //check if measure datetime is in the correct format
    //implement here

    //check if measure datetime is in the correct month
    //implement here

    //check if image is a valid base64 encoded string
    //implement here

    //check if image is a valid image file
    //implement here

    const { image, customer_code, measure_datetime, measure_type } =
      createMeasureSchema.parse(request.body);

    const measure_value = 12312541;

    try {
      await prisma.measure.create({
        data: {
          image_url: image,
          customer_code,
          measure_datetime,
          measure_type,
          measure_value,
        },
      });

      // Return the created measure data
      return reply.status(200).send({
        image_url: "string",
        measure_value: "integer",
        measure_uuid: "string",
      });
    } catch (error) {
      console.error(error);

      //
      return reply.status(400).send({
        error_code: error,
        error_description: error,
      });
    }
  });
}
