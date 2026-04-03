import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2, Flame } from 'lucide-react';
import useResumeStore from '../../store/useResumeStore';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PDFViewer = () => {
  const { file, analysis, heatmapVisible, toggleHeatmap, currentPage, setPage, setPdfDocument, setPageText, pdfDocument } = useResumeStore();
  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState(1.0);

  function onDocumentLoadSuccess(pdf) {
    setNumPages(pdf.numPages);
    setPdfDocument(pdf);
  }

  useEffect(() => {
    const extractPageText = async () => {
      if (!pdfDocument || !currentPage) return;
      try {
        const page = await pdfDocument.getPage(currentPage);
        const textContent = await page.getTextContent();
        const text = textContent.items.map(item => item.str).join(' ');
        console.log(`Extracted text for page ${currentPage}:`, text.slice(0, 50) + "...");
        setPageText(text);
      } catch (error) {
        console.error("Error extracting page text:", error);
      }
    };

    extractPageText();
  }, [pdfDocument, currentPage, setPageText]);

  return (
    <div className="flex flex-col items-center gap-6 relative">
      {/* Controls Overlay */}
      <div className="sticky top-4 z-20 flex items-center gap-4 bg-white/90 backdrop-blur-xl px-6 py-3 rounded-[24px] shadow-2xl shadow-slate-200/50 border border-white">
        <div className="flex items-center gap-2 border-r border-slate-100 pr-4">
          <button 
            onClick={() => setPage(Math.max(currentPage - 1, 1))}
            disabled={currentPage <= 1}
            className="p-1.5 hover:bg-slate-100 rounded-xl disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-xs font-black text-slate-800 tracking-tighter min-w-[60px] text-center">
            PAGE {currentPage} OF {numPages || '--'}
          </span>
          <button 
            onClick={() => setPage(Math.min(currentPage + 1, numPages))}
            disabled={currentPage >= numPages}
            className="p-1.5 hover:bg-slate-100 rounded-xl disabled:opacity-30 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex items-center gap-1 border-r border-slate-100 pr-4">
          <button onClick={() => setScale(s => Math.max(s - 0.1, 0.5))} className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors">
            <ZoomOut size={18} />
          </button>
          <span className="text-[10px] font-black text-slate-400 w-10 text-center">{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(s => Math.min(s + 0.1, 2.0))} className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors">
            <ZoomIn size={18} />
          </button>
        </div>

        <button 
          onClick={toggleHeatmap}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
            heatmapVisible 
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Flame size={14} className={heatmapVisible ? 'animate-pulse' : ''} />
          HEATMAP {heatmapVisible ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* PDF Document Container */}
      <div className="relative bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] rounded-sm overflow-hidden border border-slate-100">
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex flex-col items-center justify-center h-[800px] w-[600px] bg-white">
              <Loader2 className="animate-spin text-blue-600 mb-4" size={40} strokeWidth={3} />
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Hydrating Preview...</p>
            </div>
          }
        >
          <Page 
            pageNumber={currentPage} 
            scale={scale} 
            renderAnnotationLayer={true}
            renderTextLayer={true}
          />
          
          {/* Heatmap Overlay Layer */}
          <AnimatePresence>
            {heatmapVisible && analysis?.heatmap && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none z-10"
              >
                {/* Simulated Heatmap Blobs - In a real app, we'd map coordinates from the text layer */}
                <div className="absolute top-[10%] left-[5%] w-[40%] h-[15%] bg-orange-500/20 blur-2xl rounded-full" />
                <div className="absolute top-[30%] left-[10%] w-[30%] h-[10%] bg-red-500/20 blur-xl rounded-full" />
                <div className="absolute top-[50%] left-[5%] w-[50%] h-[12%] bg-orange-400/15 blur-2xl rounded-full" />
                <div className="absolute top-[70%] left-[15%] w-[20%] h-[8%] bg-yellow-400/10 blur-xl rounded-full" />
              </motion.div>
            )}
          </AnimatePresence>
        </Document>
      </div>
    </div>
  );
};

export default PDFViewer;
