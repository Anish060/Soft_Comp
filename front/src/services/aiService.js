import axios from 'axios';
import useResumeStore from '../store/useResumeStore';

const API_BASE = 'http://localhost:8000';

export const useAIService = () => {
  const { setAnalyzing, setAnalysis, file } = useResumeStore();

  const analyzeResume = async (fileOverride, forceMock = false) => {
    const targetFile = fileOverride || file;
    if (!targetFile && !forceMock) return;

    setAnalyzing(true);
    if (forceMock) {
       // Artificial delay for realism
       await new Promise(r => setTimeout(r, 1500));
       const mockData = {
          roles: [
            { title: "Senior Frontend Engineer", match: "Exceptional" },
            { title: "AI/ML Integrator", match: "Strong" }
          ],
          skill_gaps: [
            { skill: "TypeScript Generics", importance: "High", reason: "Required for type-safe component libraries" },
            { skill: "Vite Optimization", importance: "Medium", reason: "Important for enterprise scale micro-frontends" }
          ],
          line_suggestions: [
            { 
              original: "Worked on a React app", 
              rewrite: "Architected a scalable React system reducing bundle size by 30%", 
              reason: "Focuses on measurable impact and architectural ownership" 
            }
          ],
          soft_skills: [
            { skill: "Technical Leadership", evidence: "Guided 3 junior devs in migration", impact: "Exceptional" }
          ],
          biases: [
            { word: "expert", suggestion: "proficient", type: "Clarity" }
          ],
          heatmap: [
            { section: "Experience", weight: 0.98 },
            { section: "Projects", weight: 0.85 },
            { section: "Skills", weight: 0.92 }
          ]
       };
       setAnalysis(mockData);
       setAnalyzing(false);
       return;
    }

    try {
      const formData = new FormData();
      formData.append('pdfFile', targetFile);



      const response = await axios.post(`${API_BASE}/analyze-pdf`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setAnalysis(response.data.analysis);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      // Fallback/Mock data for demo if AI is unavailable
      setAnalysis({
        roles: [
          { title: "Senior Frontend Engineer", match: "Strong" },
          { title: "Full Stack Developer", match: "Needs Polish" }
        ],
        skill_gaps: [
          { skill: "Next.js 14", importance: "High", reason: "Standard for modern React apps" },
          { skill: "Tailwind CSS", importance: "Medium", reason: "Highly requested in job descriptions" }
        ],
        line_suggestions: [
          { 
            original: "Built a website for a client", 
            rewrite: "Developed and deployed a high-traffic e-commerce platform using React", 
            reason: "More specific and highlights key technologies" 
          }
        ],
        soft_skills: [
          { skill: "Problem Solving", evidence: "Optimized load times by 40%", impact: "Exceptional" }
        ],
        biases: [
          { word: "expert", suggestion: "proficient", type: "Generic" }
        ],
        heatmap: [
          { section: "Experience", weight: 0.95 },
          { section: "Projects", weight: 0.8 },
          { section: "Education", weight: 0.3 }
        ]
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const generateCoverLetter = async (tone) => {
    // Implementation for cover letter
  };

  return { analyzeResume, generateCoverLetter };
};
