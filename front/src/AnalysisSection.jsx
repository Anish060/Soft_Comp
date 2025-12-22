import React from 'react';
import ExpandableSection from './ExpandableSection';

const AnalysisSection = ({ ollamaResponse }) => {
  const modelUsed = ollamaResponse?.model || 'deepseek-r1:8b';
  const analysisTime = new Date().toLocaleTimeString();

  const finalText =
    typeof ollamaResponse === 'string'
      ? ollamaResponse
      : ollamaResponse?.response || '';

  const reasoning =
    ollamaResponse?.thinking || ollamaResponse?.reasoning || '';

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Metadata Header */}
      <div className="flex flex-wrap justify-between items-center px-6 py-4 border-b border-gray-200 text-sm text-gray-600">
        <span>
          <strong className="text-gray-800">Model Used:</strong> {modelUsed}
        </span>
        <span>
          <strong className="text-gray-800">Analysis Time:</strong> {analysisTime}
        </span>
      </div>

      {/* Reasoning */}
      <div className="px-6 pt-4">
        <ExpandableSection title="Model's reasoning">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {reasoning || 'No internal reasoning provided by the model.'}
          </pre>
        </ExpandableSection>
      </div>

      {/* Analysis Results */}
      <div className="px-6 pb-6 pt-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Analysis Results
        </h3>
        <div className="text-gray-700 leading-relaxed whitespace-pre-line">
          {finalText}
        </div>
      </div>
    </div>
  );
};

export default AnalysisSection;
