import './App.css';
import React, { useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import AnalysisSection from './AnalysisSection';

const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please upload a PDF file');
      setFile(null);
    }
  };

  const analyzePDF = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('pdfFile', file);

      const response = await fetch('http://localhost:8000/analyze-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to analyze PDF');
      }

      const data = await response.json();
      setFeedback(data);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-gray-50 rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Resume Analyzer</h1>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium"
            >
              Upload Resume (PDF)
            </label>
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {file.name}
              </p>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <button
          onClick={analyzePDF}
          disabled={!file || loading}
          className="mt-6 w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing Resume...
            </>
          ) : (
            'Analyze Resume'
          )}
        </button>

        {feedback && !loading && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Analysis Results</h2>
            {feedback.analysis && 
              <AnalysisSection ollamaResponse={feedback.analysis} />
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalyzer;