"use strict";

const puppeteer = require("puppeteer");
const app = require("express")();

let page;
const init = async () => (page = await (await puppeteer.launch()).newPage());

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
