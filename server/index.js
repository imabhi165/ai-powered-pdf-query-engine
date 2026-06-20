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

  //todo: going to split text into chunks
  // split the text into chunks of 500 characters each
  /* This is not optimized as it may not handle large files efficiently coz it reads the entire file into memory before processing*/
  /*
  const chunks = [];
  for (let i = 0; i <= text.length; i += 500) {
    chunks.push(text.slice(i, i + 500));
  }
  */

  //Alternative method:optimized
  const chunks = text.split("\n\n");
  res.json({
    totalChunks: chunks.length,
    chunks,
  }); // send the text back to the client
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
