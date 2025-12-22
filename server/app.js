import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import axios from 'axios';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

console.log('pdfParse type:', typeof pdfParse); // MUST be "function"

// Multer — memory storage (best practice)
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
}).single('pdfFile');

app.post('/analyze-pdf', (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        error: 'Upload error',
        details: err.message
      });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file uploaded' });
      }

      // Parse PDF from buffer
      const pdfData = await pdfParse(req.file.buffer);
      const pdfText = pdfData.text;

      // Call Ollama (localhost)
      const response = await axios.post(
        'http://127.0.0.1:11434/api/generate',
        {
          model: 'deepseek-r1:8b',
          prompt: `Analyze this resume. Resume text is between ---\n${pdfText}\n---`,
          stream: false
        }
      );

      res.json({
        success: true,
        ollamaResponse: response.data
      });

    } catch (error) {
      console.error('Processing error:', error);
      res.status(500).json({
        error: 'Error processing PDF',
        details: error.message
      });
    }
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
