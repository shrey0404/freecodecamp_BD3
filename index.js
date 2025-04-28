require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const dns = require("dns");
const urlParser = require("url");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

// --> ADD THESE TWO MIDDLEWARES
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

let urls = [];
app.post("/api/shorturl", (req, res) => {
  const originalUrl = req.body.url;
  console.log("Original URL:", originalUrl); // Always good to console.log

  if (!originalUrl) {
    return res.json({ error: "invalid url" });
  }

  const hostname = urlParser.parse(originalUrl).hostname;

  dns.lookup(hostname, (err, address) => {
    if (err || !address) {
      return res.json({ error: "invalid url" });
    } else {
      const shortUrl = urls.length + 1;
      urls.push({ original_url: originalUrl, short_url: shortUrl });
      res.json({ original_url: originalUrl, short_url: shortUrl });
    }
  });
});

app.get("/api/shorturl/:short_url", (req, res) => {
  const shortUrl = parseInt(req.params.short_url);
  const urlEntry = urls.find((u) => u.short_url === shortUrl);

  if (urlEntry) {
    res.redirect(urlEntry.original_url);
  } else {
    res.json({ error: "No short URL found for the given input" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
