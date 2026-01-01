import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import useResumeStore from '../../store/useResumeStore';
import { useAIService } from '../../services/aiService';
import { motion } from 'framer-motion';

const ResumeUpload = () => {
  const { setFile, file, reset } = useResumeStore();
  const { analyzeResume } = useAIService();
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit.');
        return;
      }
      
      setError(null);
      handleUpload(selectedFile);
    } else {
      setError('Only PDF files are supported.');
    }
  }, [setFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  });

  const handleUpload = (selectedFile) => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setFile(selectedFile);
          // Automatically trigger analysis after upload
          setTimeout(() => {
            analyzeResume(selectedFile);
          }, 500);

          return 100;
        }
        return prev + 10;
      });
    }, 40);
  };

  if (file) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-bottom-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
            <File size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">{file.name}</p>
            <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB • Ready for analysis</p>
          </div>
        </div>
        <button 
          onClick={reset}
          className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <div 
        {...getRootProps()} 
        className={`relative group cursor-pointer transition-all duration-300 border-2 border-dashed rounded-[32px] p-12 text-center overflow-hidden
          ${isDragActive ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/50'}
          ${error ? 'border-red-300 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'shadow-2xl shadow-slate-200/50'}
        `}
      >
        <input {...getInputProps()} />
        
        {progress > 0 && progress < 100 ? (
          <div className="flex flex-col items-center py-4">
             <div className="relative w-20 h-20 mb-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100" />
                  <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6" fill="transparent" 
                    strokeDasharray={226.2} 
                    strokeDashoffset={226.2 - (226.2 * progress) / 100}
                    className="text-blue-600 transition-all duration-300 stroke-round" 
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-sm font-black text-blue-600">
                  {progress}%
                </div>
             </div>
             <p className="text-slate-600 font-bold">Injecting Assets...</p>
             <p className="text-xs text-slate-400 mt-1">Building high-fidelity preview</p>
          </div>
        ) : (
          <>
            <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[30%] flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-2xl shadow-blue-100">
              <Upload size={36} strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">Drop resume here</h3>
            <p className="text-slate-400 font-medium mb-8">Support PDF files up to 5MB</p>
            <button className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 group-hover:translate-y-[-2px]">
              Browse Documents
            </button>
          </>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold border border-red-100 uppercase tracking-wider"
          >
            <AlertCircle size={14} />
            {error}
          </motion.div>
        )}
      </div>
      
      <div className="mt-12 flex items-center justify-center gap-10 opacity-30 grayscale hover:opacity-60 transition-opacity">
         <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 tracking-widest">
            <CheckCircle2 size={14} /> AES-256 SECURE
         </div>
         <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 tracking-widest">
            <CheckCircle2 size={14} /> PRIVACY FIRST
         </div>
         <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 tracking-widest">
            <CheckCircle2 size={14} /> RECRUITER TRUSTED
         </div>
      </div>
    </div>
  );
};

export default ResumeUpload;
