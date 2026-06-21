const express = require("express");
const multer = require("multer");
const pdfParser = require("pdf-parse");
const fs = require("fs");
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const app = express();
const upload = multer({ dest: "uploads/" }); // configure multer to store uploaded files in the "uploads" directory

// Initialize the Gemini API client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("Server is Running fine");
});

app.post("/upload", upload.single("file"), async (req, res) => {
  console.log(req.file); // log the file metadata to the console

  //creating an embedding to represent the pdf text
  // this will be used to find the most relevant chunk for the user's question
  async function createEmbedding(text) {
    const response = await ai.models.embedContent({
      model: "gemini-embedding-2",
      content: text,
    });
    return response.embeddings[0].values;
  }

  // 1. Guard clause: Check if a file was actually uploaded
  if (!req.file) {
    return res
      .status(400)
      .send("No file uploaded or incorrect field name used.");
  }

  try {
    // 2. Read and parse the PDF file
    const dataBuffer = fs.readFileSync(req.file.path); // read the file as a buffer
    const pdfData = await pdfParser(dataBuffer); // parse the pdf data
    const text = pdfData.text; // extract the text from the pdf

    const chunks = text.split("\n");
    //this is hard coded for testing
    // const question = "what is the clients";
    // dynamically get the question from the request body
    const question = req.body.question;
    console.log("question:", question);
    const matchedChunks = chunks.find((chunk) =>
      chunk.toLowerCase().includes("clients"),
    ); // find the chunk that matches the question
    // 3. Send the matched chunk to the Gemini model
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Answer the question using the context: ${matchedChunks} and Question is: ${question}`,
    });
    console.log(matchedChunks);
    // res.send(response.text);
    res.json({
      matchedChunks,
      response: response.text,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error processing file");
  } finally {
    // 4. Cleanup: Always delete the temporary file from the uploads folder
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err)
          console.error(
            `Failed to delete temporary file: ${req.file.path}`,
            err,
          );
      });
    }
  }
});

/* Optional Optimized Chunking Feature (Saved for later implementation):
  If you ever have PDFs larger than the Gemini context limit, you can uncomment this
  logic to break the text up safely without overloading server memory.

  const chunks = [];
  for (let i = 0; i <= text.length; i += 500) {
    chunks.push(text.slice(i, i + 500));
  }
*/

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
