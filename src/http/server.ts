import fastify from "fastify";
import { createMeasure } from "@routes/create-measure";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import path from "path";

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

app
  .listen({ port: 3000 })
  .then(() => console.log("Server listening on port http://localhost:3000"));
