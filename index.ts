import { httpServer } from "./src/http_server";
import { createWSServer } from "./src/ws";

const HTTP_PORT = 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

const WS_PORT = 3000;
createWSServer(WS_PORT);
