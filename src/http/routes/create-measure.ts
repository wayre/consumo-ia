import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "@lib/prisma";
import { isBase64Image, saveImageBase64ToFile } from "@utils/utils";

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
      //check if values are coming correctly
      const isBase64 = isBase64Image(result.data?.image);
      if (!result.success) throw new Error(result.error.message);
      if (!isBase64)
        throw new Error(
          "Invalid Base64 string data. \
      It seems to be not a Base64 image."
        );

      const { image, customer_code, measure_datetime, measure_type } =
        createMeasureSchema.parse(request.body);

      // await Prisma.measure

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

      const fileName = saveImageBase64ToFile(image);
      const imageUrl = `/public/images/${fileName}`;

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

      // eslint-disable-next-line
    } catch (error: any) {
      let message;
      try {
        const errorMessage = error.message
          ? JSON.parse(error.message).pop()
          : error;
        const path = errorMessage.path;
        message = `Error creating measure: ${path} - ${errorMessage.message}`;
      } catch {
        console.log(">>>", error);
        message = error.message;
      }

      return reply.status(400).send({
        error_code: "INVALID_DATA",
        error_description: message,
      });
    }
  });
}
