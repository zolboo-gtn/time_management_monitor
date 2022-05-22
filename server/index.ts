import { createRequestHandler } from "@remix-run/express";
import compression from "compression";
import express from "express";
import fs from "fs";
import { createServer } from "http";
import morgan from "morgan";
import path from "path";
import { Server } from "socket.io";

const MODE = process.env.NODE_ENV;
const BUILD_DIR = path.join(process.cwd(), "server/build");

if (!fs.existsSync(BUILD_DIR)) {
  console.warn(
    "Build directory doesn't exist, please run `npm run dev` or `npm run build` before starting the server."
  );
}

const purgeRequireCache = () => {
  for (const key in require.cache) {
    if (key.startsWith(BUILD_DIR)) {
      delete require.cache[key];
    }
  }
};

const app = express();
app.use(compression());
app.use(express.static("public", { maxAge: "1h" }));
app.use(express.static("public/build", { immutable: true, maxAge: "1y" }));
app.use(morgan("tiny"));
app.all(
  "*",
  MODE === "production"
    ? createRequestHandler({ build: require("./build") })
    : (req, res, next) => {
        purgeRequireCache();
        const build = require("./build");
        return createRequestHandler({ build, mode: MODE })(req, res, next);
      }
);

const httpServer = createServer(app);

const io = new Server(httpServer);
io.on("connection", (socket) => {
  console.log(socket.id, "connected");

  socket.emit("confirmation", "connected!");
  socket.on("event", (data) => {
    console.log(socket.id, data);
    socket.emit("event", "pong");
  });
});

const port = process.env.PORT || 3000;
httpServer.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
