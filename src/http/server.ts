import fastify from "fastify";
import { createMeasure } from "@routes/create-measure";

const app = fastify();

app.register(createMeasure);

app
  .listen({ port: 3000 })
  .then(() => console.log("Server listening on port http://localhost:3000"));
