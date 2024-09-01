import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "@lib/prisma";
import path from "path";
import { isBase64Image, getFileType } from "@utils/utils";

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

    //check if values are coming correctly
    if (!result.success) {
      console.log(result.error);
      return reply.status(400).send({
        error_code: result.error.issues[0].code,
        error_description: result.error.issues[0].message,
      });
    }

    const { image, customer_code, measure_datetime, measure_type } =
      createMeasureSchema.parse(request.body);
    console.log("isBase64?", isBase64Image(image));

    /**
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
       */

    const measure_value = 12312541;
    const imageUrl = `${Date.now()}.${getFileType(image)}`;

    try {
      const measure = await prisma.measure.create({
        data: {
          image_url: imageUrl,
          customer_code,
          measure_datetime,
          measure_type,
          measure_value,
        },
        select: {
          image_url: true,
          measure_value: true,
          measure_uuid: true,
        },
      });

      return reply.status(200).send({
        image_url: measure.image_url,
        measure_value: measure.measure_value,
        measure_uuid: measure.measure_uuid,
      });

      // Return the created measure data
    } catch (error) {
      console.error(`Erro ${new Date(Date.now())}`, error);

      //
      return reply.status(400).send({
        error_code: error,
        error_description: error,
      });
    }
  });
}
