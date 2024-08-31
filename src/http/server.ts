import fastify from "fastify";

const app = fastify();

app.get("/", (req, reply) => {
  reply.send({ hello: "world" });
});

app
  .listen({ port: 3000 })
  .then(() => console.log("Server listening on port http://localhost:3000"));
