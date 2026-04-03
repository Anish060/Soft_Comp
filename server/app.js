import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import axios from 'axios';
import cors from 'cors';
import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        text: pdfText,
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
// LaTeX Render Route
// --------------------
// --------------------
// LaTeX Render Route (Cloud Fallback)
// --------------------
app.post('/render-tex', async (req, res) => {
  const { latex } = req.body;
  
  if (!latex) {
    return res.status(400).json({ error: 'No LaTeX content provided' });
  }

  try {
    console.log("Compiling LaTeX via Cloud API...");
    
    // Use latexonline.cc API (GET method preferred for simple usage)
    const encoded = encodeURIComponent(latex);
    
    // Auto-detect compiler requirement
    const compiler = latex.includes('{fontspec}') ? 'xelatex' : 'pdflatex';
    const url = `http://latexonline.cc/compile?text=${encoded}&force=true&command=${compiler}`;
    
    console.log(`Compiling with ${compiler} via Cloud API...`);

    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'arraybuffer',
      timeout: 30000 // 30s timeout
    });

    res.contentType('application/pdf');
    res.send(response.data);

  } catch (error) {
    console.error('Cloud Render error:', error.message);
    res.status(500).json({ 
      error: 'Rendering failed', 
      details: 'Could not compile LaTeX via cloud service. Please check your syntax or try again.'
    });
  }
});

// --------------------
// AI LaTeX Generator Route
// --------------------
app.post('/generate-latex-from-text', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided' });

  try {
    const systemPrompt = `You are an expert LaTeX typesetter. Your goal is to reverse-engineer the likely LaTeX code that generated the provided text.
    
    STEP 1: ANALYZE THE DOCUMENT TYPE
    - Is it a **Lab Report / Title Page**? (Look for "Experiment", "Department", "University", "Subject").
    - Is it a **Resume/CV**? (Look for "Experience", "Education", "Skills").
    - Is it a **Legal/Formal Letter**?
    
    STEP 2: GENERATE CORRESPONDING LATEX
    - **IF LAB REPORT/TITLE PAGE**: 
      - Create a custom title page environment. 
      - Use \\centering for the main info.
      - Use \\large, \\Large, \\Huge for hierarchy.
      - Put the university/organization name at the top.
      - Put the title in the middle.
      - Put authors/details at the bottom.
      - Do NOT just use \\maketitle if the layout is complex; manually format the title page content.
    
    - **IF RESUME**:
      - Use a clean, professional layout.
      - Use \\section*{} for main headers.
      - Use \\textbf{} for roles/companies.
    
    - GENERAL RULES:
    - Use the 'article' class.
    - Use \\usepackage{geometry} to set reasonable margins (e.g., 1in).
    - Return ONLY the valid LaTeX code. 
    - Do NOT include markdown blocks (\`\`\`).
    - Escape special characters (&, %, $) appropriately.
    - IMPORTANT: Avoid using the 'fontspec' package unless absolutely necessary. Prefer standard fonts like 'lmodern', 'helvet', or 'times' that work with pdflatex.`;

    const ollamaResponse = await axios.post(
      'http://127.0.0.1:11434/api/generate',
      {
        model: 'qwen3:8b', 
        system: systemPrompt,
        prompt: `Here is the raw text extracted from a PDF. Reconstruct the LaTeX code to match its likely visual layout as closely as possible:\n\n${text}`,
        stream: false
      },
      { timeout: 120000 }
    );

    let latexCode = ollamaResponse.data.response;
    
    // Clean up if model added markdown
    latexCode = latexCode.replace(/```latex/g, '').replace(/```/g, '').trim();

    res.json({ latex: latexCode });

  } catch (error) {
    console.error('LaTeX Generation Error:', error.message);
    res.status(500).json({ error: 'Failed to generate LaTeX' });
  }
});

// --------------------
// Server
// --------------------
const PORT = 8000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});

