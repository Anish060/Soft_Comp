import { create } from 'zustand';

const useResumeStore = create((set) => ({
  file: null,
  fileName: '',
  pdfText: '',
  isAnalyzing: false,
  analysis: null, // Structured analysis from AI
  versions: [],
  activeVersionIndex: 0,
  heatmapVisible: false,
  currentPage: 1,
  pdfDocument: null,
  pageText: '',
  
  // Actions
  setFile: (file) => set({ file, fileName: file.name }),
  setPdfText: (text) => set({ pdfText: text }),
  setAnalyzing: (status) => set({ isAnalyzing: status }),
  setAnalysis: (data) => set({ analysis: data }),
  toggleHeatmap: () => set((state) => ({ heatmapVisible: !state.heatmapVisible })), // Corrected state access
  setPage: (page) => set({ currentPage: page }),
  setPdfDocument: (doc) => set({ pdfDocument: doc }),
  setPageText: (text) => set({ pageText: text }),
  
  addVersion: (version) => set((state) => ({ 
    versions: [...state.versions, version],
    activeVersionIndex: state.versions.length 
  })),
  
  reset: () => set({ 
    file: null, 
    fileName: '', 
    pdfText: '', 
    analysis: null, 
    isAnalyzing: false 
  }),
}));

export default useResumeStore;
