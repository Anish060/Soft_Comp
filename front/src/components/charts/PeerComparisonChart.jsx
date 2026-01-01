import React from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';

const data = [
  { subject: 'Skill Density', A: 120, B: 110, fullMark: 150 },
  { subject: 'Project Depth', A: 98, B: 130, fullMark: 150 },
  { subject: 'Keywords', A: 86, B: 130, fullMark: 150 },
  { subject: 'Exp Ratio', A: 99, B: 100, fullMark: 150 },
  { subject: 'Clarity', A: 85, B: 90, fullMark: 150 },
];

const PeerComparisonChart = () => {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#E2E8F0" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} />
          <Radar
            name="You"
            dataKey="A"
            stroke="#2563EB"
            fill="#2563EB"
            fillOpacity={0.5}
          />
          <Radar
            name="Peers"
            dataKey="B"
            stroke="#94A3B8"
            fill="#94A3B8"
            fillOpacity={0.2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PeerComparisonChart;
