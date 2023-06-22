import Express from "express";
import { config } from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { initSocketIO } from "./utils/socket.io";
import applicationRouter from "./routers/application";
import apiRouter from "./routers/api";
import { train } from "./utils/nlp";

config();
train();

const PORT = process.env.PORT || 3000;

const app = Express();

const server = http.createServer(app);
const io = new Server(server);

const connection = initSocketIO(io);

app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  }
);

app.use("/api", apiRouter);
app.use(applicationRouter);

if (process.env.NODE_ENV === "development") {
  console.info("Development mode.");
  app.post("/esbuild-rebuilt", () => {
    connection.emit("esbuild-rebuilt");
  });
}

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
