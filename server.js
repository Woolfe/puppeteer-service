"use strict";

const puppeteer = require("puppeteer");
const app = require("express")();
const cors = require("cors");
app.use(cors());
let page;
const init = async () => {
  page = await (await puppeteer.launch({
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"'
    ],
    ignoreHTTPSErrors: true
  })).newPage();
};
// Init the page
init();
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.get("/screenshot", async ({ query }, res) => {
  const isLandscape = query.isLandscape === "true";
  const isMobile = query.isMobile === "true";
  await page.setViewport({
    width: Number(isLandscape ? query.x : query.y),
    height: Number(isLandscape ? query.y : query.x),
    isMobile,
    isLandscape
  });
  await page.goto(query.url);
  const base64str = await page.screenshot({ encoding: "base64" });
  res.send(base64str);
});

app.get("/code", async ({ query }, res) => {
  const { code, url } = query;
  await page.goto(url);
  const result = await page.evaluate(code);
  res.send(result);
});

app.listen(process.env.PORT || 5000);
