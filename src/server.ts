import fastify from "fastify";
import cors from "@fastify/cors";
import path from "path";

import { createMeasure } from "@routes/create-measure";
import { confirmMeasure } from "@routes/confirm-measure";
import { getMeasures } from "@routes/get-measures";
import fastifyStatic from "@fastify/static";

const app = fastify();

app.register(cors, {
  origin: "*",
  methods: ["GET", "POST", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

app.register(fastifyStatic, {
  root: path.join(__dirname, "public"), // Caminho para a pasta public
  prefix: "/public/", // Prefixo para acessar os arquivos
});

app.register(createMeasure);
app.register(confirmMeasure);
app.register(getMeasures);

app
  .listen({ port: 3000 })
  .then(() => console.log("Server listening on port http://localhost:3000"));
