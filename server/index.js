const express = require("express");
const multer = require("multer");
const pdfParser = require("pdf-parse");
const fs = require("fs");

const app = express();
const upload = multer({ dest: "uploads/" }); // configure multer to store uploaded files in the "uploads" directory

app.get("/", (req, res) => {
  res.send("Server is Running fine");
});

app.post("/upload", upload.single("file"), async (req, res) => {
  console.log(req.file); // log the file to the console
  const dataBuffer = fs.readFileSync(req.file.path); // read the file as a buffer
  const pdfData = await pdfParser(dataBuffer); // parse the pdf data
  const text = pdfData.text; // extract the text from the pdf
  res.send(text); // send the text back to the client
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
