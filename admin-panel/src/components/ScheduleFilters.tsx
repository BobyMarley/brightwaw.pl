import React from 'react';
import './ScheduleFilters.css';

interface Worker {
  id: string;
  name: string;
  position?: string;
}

interface ScheduleFiltersProps {
  workers: Worker[];
  selectedWorkers: string[];
  selectedStatuses: string[];
  searchTerm: string;
  onWorkersChange: (workers: string[]) => void;
  onStatusesChange: (statuses: string[]) => void;
  onSearchChange: (term: string) => void;
  onClearFilters: () => void;
}

const ScheduleFilters: React.FC<ScheduleFiltersProps> = ({
  workers,
  selectedWorkers,
  selectedStatuses,
  searchTerm,
  onWorkersChange,
  onStatusesChange,
  onSearchChange,
  onClearFilters
}) => {
  
  const statuses = [
    { value: 'pending', label: 'Ожидает', color: '#FF9800' },
    { value: 'confirmed', label: 'Подтвержден', color: '#2196F3' },
    { value: 'in_progress', label: 'В работе', color: '#4CAF50' },
    { value: 'completed', label: 'Завершен', color: '#00BCD4' },
    { value: 'cancelled', label: 'Отменен', color: '#F44336' }
  ];
  
  const handleWorkerToggle = (workerId: string) => {
    if (selectedWorkers.includes(workerId)) {
      onWorkersChange(selectedWorkers.filter(id => id !== workerId));
    } else {
      onWorkersChange([...selectedWorkers, workerId]);
    }
  };
  
  const handleStatusToggle = (status: string) => {
    if (selectedStatuses.includes(status)) {
      onStatusesChange(selectedStatuses.filter(s => s !== status));
    } else {
      onStatusesChange([...selectedStatuses, status]);
    }
  };
  
  const handleSelectAllWorkers = () => {
    if (selectedWorkers.length === workers.length) {
      onWorkersChange([]);
    } else {
      onWorkersChange(workers.map(w => w.id));
    }
  };
  
  const handleSelectAllStatuses = () => {
    if (selectedStatuses.length === statuses.length) {
      onStatusesChange([]);
    } else {
      onStatusesChange(statuses.map(s => s.value));
    }
  };
  
  const hasActiveFilters = selectedWorkers.length > 0 || selectedStatuses.length > 0 || searchTerm.length > 0;
  
  return (
    <div className="schedule-filters">
      <div className="filters-header">
        <h3>Фильтры и поиск</h3>
        {hasActiveFilters && (
          <button onClick={onClearFilters} className="clear-filters-btn">
            Очистить все
          </button>
        )}
      </div>
      
      <div className="filters-content">
        {/* Поиск */}
        <div className="filter-section">
          <label className="filter-label">Поиск по адресу или услуге:</label>
          <div className="search-input-container">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Введите адрес или тип услуги..."
              className="search-input"
            />
            {searchTerm && (
              <button 
                onClick={() => onSearchChange('')}
                className="clear-search-btn"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        
        {/* Фильтр по работникам */}
        <div className="filter-section">
          <div className="filter-header">
            <label className="filter-label">Сотрудники:</label>
            <button 
              onClick={handleSelectAllWorkers}
              className="select-all-btn"
            >
              {selectedWorkers.length === workers.length ? 'Снять все' : 'Выбрать все'}
            </button>
          </div>
          <div className="filter-options workers-filter">
            {workers.map(worker => (
              <label key={worker.id} className="filter-option">
                <input
                  type="checkbox"
                  checked={selectedWorkers.includes(worker.id)}
                  onChange={() => handleWorkerToggle(worker.id)}
                />
                <span className="checkmark"></span>
                <div className="worker-info">
                  <span className="worker-name">{worker.name}</span>
                  <span className="worker-position">{worker.position || 'Сотрудник'}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
        
        {/* Фильтр по статусам */}
        <div className="filter-section">
          <div className="filter-header">
            <label className="filter-label">Статусы заказов:</label>
            <button 
              onClick={handleSelectAllStatuses}
              className="select-all-btn"
            >
              {selectedStatuses.length === statuses.length ? 'Снять все' : 'Выбрать все'}
            </button>
          </div>
          <div className="filter-options statuses-filter">
            {statuses.map(status => (
              <label key={status.value} className="filter-option">
                <input
                  type="checkbox"
                  checked={selectedStatuses.includes(status.value)}
                  onChange={() => handleStatusToggle(status.value)}
                />
                <span className="checkmark"></span>
                <div className="status-info">
                  <span 
                    className="status-color" 
                    style={{ backgroundColor: status.color }}
                  ></span>
                  <span className="status-label">{status.label}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
      
      {/* Активные фильтры */}
      {hasActiveFilters && (
        <div className="active-filters">
          <span className="active-filters-label">Активные фильтры:</span>
          <div className="active-filters-list">
            {selectedWorkers.length > 0 && (
              <div className="active-filter">
                Сотрудники: {selectedWorkers.length} из {workers.length}
              </div>
            )}
            {selectedStatuses.length > 0 && (
              <div className="active-filter">
                Статусы: {selectedStatuses.length} из {statuses.length}
              </div>
            )}
            {searchTerm && (
              <div className="active-filter">
                Поиск: "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleFilters;