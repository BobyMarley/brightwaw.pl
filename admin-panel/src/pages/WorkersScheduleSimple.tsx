import React, { useState } from 'react';
import SimpleAdminSchedule from '../components/SimpleAdminSchedule';
import WeeklyScheduleGrid from '../components/WeeklyScheduleGrid';

const WorkersScheduleSimple: React.FC = () => {
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('compact');

  return (
    <div>
      <div style={{ padding: '20px 20px 0 20px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={() => setViewMode('compact')}
          style={{ 
            padding: '8px 16px', 
            background: viewMode === 'compact' ? '#1976d2' : '#f5f5f5', 
            color: viewMode === 'compact' ? 'white' : '#666',
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer' 
          }}
        >
          Сводный вид
        </button>
        <button 
          onClick={() => setViewMode('detailed')}
          style={{ 
            padding: '8px 16px', 
            background: viewMode === 'detailed' ? '#1976d2' : '#f5f5f5', 
            color: viewMode === 'detailed' ? 'white' : '#666',
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer' 
          }}
        >
          Детальный вид
        </button>
      </div>
      
      {viewMode === 'compact' ? <WeeklyScheduleGrid /> : <SimpleAdminSchedule />}
    </div>
  );
};

export default WorkersScheduleSimple;