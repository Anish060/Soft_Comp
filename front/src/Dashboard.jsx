import React from 'react';
import MainLayout from './components/layout/MainLayout';
import PDFViewer from './components/resume/PDFViewer';
import AIPanel from './components/insights/AIPanel';
import ResumeUpload from './components/resume/ResumeUpload';
import useResumeStore from './store/useResumeStore';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const { file } = useResumeStore();

  return (
    <MainLayout
      leftPane={
        <div className="h-full flex flex-col pt-8">
          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex-1 flex items-center justify-center -mt-12"
              >
                <ResumeUpload />
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1"
              >
                 {/* Mini Overlay Header if file is present */}
                 <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-slate-800">Resume Preview</h1>
                      <p className="text-sm text-slate-500">Highlight text to see AI context (coming soon)</p>
                    </div>
                 </div>
                 <PDFViewer />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      }
      rightPane={<AIPanel />}
    />
  );
};

export default Dashboard;
