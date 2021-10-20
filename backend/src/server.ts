import { serverHttp } from "./app";

serverHttp.listen(3333, () => {
  console.log("Server Started on port 3333!!!");
});
