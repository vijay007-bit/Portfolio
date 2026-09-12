const path = require("path");
const dotenv = require("dotenv");
const { createApp } = require("./app");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

const port = Number.parseInt(process.env.PORT || "3000", 10);
const app = createApp();

app.listen(port, () => {
  // Keep startup output explicit for local development.
  // eslint-disable-next-line no-console
  console.log(`Portfolio website running at http://localhost:${port}`);
});
