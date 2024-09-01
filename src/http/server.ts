import fastify from "fastify";
import { createMeasure } from "@routes/create-measure";
import cors from "@fastify/cors";

const app = fastify();

app.register(cors, {
  origin: "*",
  methods: ["GET", "POST", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
app.register(createMeasure);

app
  .listen({ port: 3000 })
  .then(() => console.log("Server listening on port http://localhost:3000"));
