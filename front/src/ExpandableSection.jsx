import React, { useState } from 'react';

const ExpandableSection = ({ title, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-blue-50 rounded-lg border border-blue-100">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-4 py-3 text-left text-blue-900 font-medium"
      >
        <span>{title}</span>
        <span className="text-xl leading-none">
          {open ? '▴' : '▾'}
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-2 border-t border-blue-100 bg-white rounded-b-lg">
          {children}
        </div>
      )}
    </div>
  );
};

export default ExpandableSection;
