import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import axios from 'axios';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

console.log('pdfParse type:', typeof pdfParse); // should be "function"

// --------------------
// Multer config
// --------------------
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
    fileSize: 5 * 1024 * 1024 // 5 MB
  }
}).single('pdfFile');

// --------------------
// Route
// --------------------
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
        return res.status(400).json({
          error: 'No PDF file uploaded'
        });
      }

      // Parse PDF
      const pdfData = await pdfParse(req.file.buffer);
      // Clean text: remove non-printable characters and extra whitespace
      const pdfText = pdfData.text.replace(/[^\x20-\x7E\n]/g, '').replace(/\s+/g, ' ').trim();

      console.log(` Extracted ${pdfText.length} characters from PDF.`);

      if (pdfText.length < 50) {
        return res.status(400).json({
          error: 'Resume text too short',
          details: 'The PDF content seems insufficient for analysis.'
        });
      }

      // Call Ollama with a structured prompt
      const systemPrompt = `You are a Senior Recruiter AI. Analyze the resume text and return a VALID JSON object.
      CRITICAL: You must return ALL the following keys as arrays, even if empty.
      DO NOT include numeric scores. Use qualitative terms: "Strong", "Needs Polish", "Missing Clarity", "Exceptional".
      
      JSON Structure:
      {
        "roles": [{"title": "string", "match": "string"}],
        "skill_gaps": [{"skill": "string", "importance": "string", "reason": "string"}],
        "line_suggestions": [{"original": "string", "rewrite": "string", "reason": "string"}],
        "soft_skills": [{"skill": "string", "evidence": "string", "impact": "string"}],
        "biases": [{"word": "string", "suggestion": "string", "type": "string"}],
        "heatmap": [{"section": "string", "weight": number}]
      }`;

      const ollamaResponse = await axios.post(
        'http://127.0.0.1:11434/api/generate',
        {
          model: 'qwen3:8b',
          system: systemPrompt,
          prompt: `Analyze this resume content: \n\n${pdfText}`,
          stream: false,
          format: 'json'
        },
        {
          timeout: 120000 
        }
      );

      let analysisData = {};
      try {
        // Handle case where Ollama might return double-wrapped JSON or strings
        const rawResponse = ollamaResponse.data.response;
        analysisData = typeof rawResponse === 'string' ? JSON.parse(rawResponse) : rawResponse;
      } catch (e) {
        console.error('Failed to parse JSON from Ollama:', ollamaResponse.data.response);
        analysisData = { 
          raw: ollamaResponse.data.response,
          error: "Analysis failed to format properly. Check raw output."
        };
      }

      res.json({
        success: true,
        analysis: analysisData
      });


    } catch (error) {
      console.error('Processing error:', error.message);
      res.status(500).json({
        error: 'Error processing PDF',
        details: error.message
      });
    }
  });
});

// --------------------
// Cover Letter Route
// --------------------
app.post('/generate-cover-letter', async (req, res) => {
  const { resumeText, tone = 'Formal' } = req.body;

  try {
    const response = await axios.post(
      'http://127.0.0.1:11434/api/generate',
      {
        model: 'qwen3:8b',
        prompt: `Generate a ${tone} cover letter based on this resume: \n\n${resumeText}`,
        stream: false
      }
    );

    res.json({
      success: true,
      coverLetter: response.data.response
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate cover letter' });
  }
});

// --------------------
// Server
// --------------------
const PORT = 8000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});

