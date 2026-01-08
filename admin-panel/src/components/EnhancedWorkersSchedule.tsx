import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import ScheduleExport from './ScheduleExport';
import ScheduleFilters from './ScheduleFilters';
import './EnhancedWorkersSchedule.css';

interface Worker {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  photo?: string;
}

interface Order {
  id: string;
  assignedWorkerId: string;
  assignedWorkerName: string;
  scheduledDate: any;
  scheduledTime: string;
  estimatedDuration: number;
  status: string;
  serviceType: string;
  address: string;
  customerName?: string;
}

interface TimeSlot {
  time: string;
  hour: number;
  minute: number;
}

const EnhancedWorkersSchedule: React.FC = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [selectedWorker, setSelectedWorker] = useState<string | null>(null);
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Генерируем временные слоты с 8:00 до 22:00 с интервалом 30 минут
  const timeSlots: TimeSlot[] = Array.from({ length: 28 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = (i % 2) * 30;
    return {
      time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      hour,
      minute
    };
  });

  const weekDays = [
    { short: 'Пн', full: 'Понедельник' },
    { short: 'Вт', full: 'Вторник' },
    { short: 'Ср', full: 'Среда' },
    { short: 'Чт', full: 'Четверг' },
    { short: 'Пт', full: 'Пятница' },
    { short: 'Сб', full: 'Суббота' },
    { short: 'Вс', full: 'Воскресенье' }
  ];

  useEffect(() => {
    loadData();
  }, [currentWeek]);

  // Инициализируем фильтры после загрузки данных
  useEffect(() => {
    if (workers.length > 0 && selectedWorkers.length === 0) {
      setSelectedWorkers(workers.map(w => w.id));
    }
  }, [workers]);

  useEffect(() => {
    if (selectedStatuses.length === 0) {
      setSelectedStatuses(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']);
    }
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Загружаем работников
      const workersQuery = query(collection(db, 'workers'));
      const workersSnapshot = await getDocs(workersQuery);
      const workersData = workersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Worker[];
      setWorkers(workersData);

      // Загружаем заказы на текущую неделю
      const startOfWeek = getStartOfWeek(currentWeek);
      const endOfWeek = getEndOfWeek(currentWeek);
      
      const ordersQuery = query(
        collection(db, 'orders'),
        where('scheduledDate', '>=', startOfWeek),
        where('scheduledDate', '<=', endOfWeek),
        where('assignedWorkerId', '!=', null),
        orderBy('assignedWorkerId'),
        orderBy('scheduledDate')
      );
      
      const ordersSnapshot = await getDocs(ordersQuery);
      const ordersData = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(ordersData);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(d.setDate(diff));
    start.setHours(0, 0, 0, 0);
    return start;
  };

  const getEndOfWeek = (date: Date) => {
    const start = getStartOfWeek(date);
    const end = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
    end.setHours(23, 59, 59, 999);
    return end;
  };

  const getWeekDates = () => {
    const start = getStartOfWeek(currentWeek);
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  };



  const getStatusColor = (status: string) => {
    const colors = {
      'pending': '#FF9800',
      'confirmed': '#2196F3',
      'in_progress': '#4CAF50',
      'completed': '#00BCD4',
      'cancelled': '#F44336'
    };
    return colors[status as keyof typeof colors] || '#9E9E9E';
  };

  const getStatusText = (status: string) => {
    const texts = {
      'pending': 'Ожидает',
      'confirmed': 'Подтвержден',
      'in_progress': 'В работе',
      'completed': 'Завершен',
      'cancelled': 'Отменен'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() + (direction * 7));
    setCurrentWeek(newDate);
  };

  const getWorkerStats = (workerId: string) => {
    const workerOrders = orders.filter(order => order.assignedWorkerId === workerId);
    const totalHours = workerOrders.reduce((sum, order) => sum + (order.estimatedDuration || 120), 0) / 60;
    const statusCounts = workerOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalOrders: workerOrders.length,
      totalHours: Math.round(totalHours * 10) / 10,
      statusCounts
    };
  };

  const formatDateRange = () => {
    const start = getStartOfWeek(currentWeek);
    const end = getEndOfWeek(currentWeek);
    return `${start.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })} - ${end.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
  };

  // Фильтрация данных
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Фильтр по работникам
      if (!selectedWorkers.includes(order.assignedWorkerId)) {
        return false;
      }
      
      // Фильтр по статусам
      if (!selectedStatuses.includes(order.status)) {
        return false;
      }
      
      // Поиск по тексту
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesService = order.serviceType.toLowerCase().includes(searchLower);
        const matchesAddress = order.address.toLowerCase().includes(searchLower);
        const matchesWorker = order.assignedWorkerName.toLowerCase().includes(searchLower);
        
        if (!matchesService && !matchesAddress && !matchesWorker) {
          return false;
        }
      }
      
      return true;
    });
  }, [orders, selectedWorkers, selectedStatuses, searchTerm]);

  const filteredWorkers = useMemo(() => {
    return workers.filter(worker => selectedWorkers.includes(worker.id));
  }, [workers, selectedWorkers]);

  const clearFilters = () => {
    setSelectedWorkers(workers.map(w => w.id));
    setSelectedStatuses(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']);
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="enhanced-schedule-loading">
        <div className="loading-spinner"></div>
        <p>Загрузка расписания работников...</p>
      </div>
    );
  }

  return (
    <div className="enhanced-workers-schedule">
      {/* Заголовок и навигация */}
      <div className="schedule-header">
        <div className="header-left">
          <h1>График работников</h1>
          <div className="week-info">
            <span className="week-range">{formatDateRange()}</span>
            <span className="workers-count">{workers.length} сотрудников</span>
          </div>
        </div>
        
        <div className="header-controls">
          <div className="view-toggle">
            <button 
              className={showFilters ? 'active' : ''}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
            </button>
            <button 
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
            >
              Сетка
            </button>
            <button 
              className={viewMode === 'timeline' ? 'active' : ''}
              onClick={() => setViewMode('timeline')}
            >
              Временная шкала
            </button>
          </div>
          
          <div className="week-navigation">
            <button onClick={() => navigateWeek(-1)} className="nav-btn">
              ← Предыдущая
            </button>
            <button 
              onClick={() => setCurrentWeek(new Date())} 
              className="nav-btn today-btn"
            >
              Сегодня
            </button>
            <button onClick={() => navigateWeek(1)} className="nav-btn">
              Следующая →
            </button>
          </div>
        </div>
      </div>

      {/* Статистика */}
      <div className="schedule-stats">
        <div className="stat-card">
          <div className="stat-number">{filteredOrders.length}</div>
          <div className="stat-label">Всего заказов</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{filteredOrders.filter(o => o.status === 'confirmed').length}</div>
          <div className="stat-label">Подтверждено</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{filteredOrders.filter(o => o.status === 'in_progress').length}</div>
          <div className="stat-label">В работе</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{Math.round(filteredOrders.reduce((sum, o) => sum + (o.estimatedDuration || 120), 0) / 60)}</div>
          <div className="stat-label">Часов работы</div>
        </div>
      </div>

      {/* Фильтры */}
      {showFilters && (
        <ScheduleFilters
          workers={workers}
          selectedWorkers={selectedWorkers}
          selectedStatuses={selectedStatuses}
          searchTerm={searchTerm}
          onWorkersChange={setSelectedWorkers}
          onStatusesChange={setSelectedStatuses}
          onSearchChange={setSearchTerm}
          onClearFilters={clearFilters}
        />
      )}

      {/* Экспорт */}
      <ScheduleExport 
        workers={filteredWorkers}
        orders={filteredOrders}
        weekStart={getStartOfWeek(currentWeek)}
        weekEnd={getEndOfWeek(currentWeek)}
      />

      {/* Легенда */}
      <div className="schedule-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#FF9800' }}></span>
          <span>Ожидает подтверждения</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#2196F3' }}></span>
          <span>Подтвержден</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#4CAF50' }}></span>
          <span>В работе</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#00BCD4' }}></span>
          <span>Завершен</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#F44336' }}></span>
          <span>Отменен</span>
        </div>
      </div>

      {/* Основная сетка расписания */}
      <div className="schedule-container">
        <div className="schedule-grid">
          {/* Заголовок с днями недели */}
          <div className="grid-header">
            <div className="time-column-header">
              <div className="time-label">Время</div>
              <div className="worker-label">Сотрудник</div>
            </div>
            {weekDays.map((day, index) => {
              const date = getWeekDates()[index];
              const isToday = date.toDateString() === new Date().toDateString();
              return (
                <div key={day.short} className={`day-header ${isToday ? 'today' : ''}`}>
                  <div className="day-name">{day.short}</div>
                  <div className="day-date">
                    {date.getDate()}.{(date.getMonth() + 1).toString().padStart(2, '0')}
                  </div>
                  <div className="day-orders">
                    {filteredOrders.filter(order => {
                      const orderDate = order.scheduledDate.toDate();
                      return orderDate.toDateString() === date.toDateString();
                    }).length} заказов
                  </div>
                </div>
              );
            })}
          </div>

          {/* Строки с работниками */}
          {filteredWorkers.map(worker => {
            const stats = {
              totalOrders: filteredOrders.filter(order => order.assignedWorkerId === worker.id).length,
              totalHours: Math.round(filteredOrders.filter(order => order.assignedWorkerId === worker.id).reduce((sum, order) => sum + (order.estimatedDuration || 120), 0) / 60 * 10) / 10,
              statusCounts: filteredOrders.filter(order => order.assignedWorkerId === worker.id).reduce((acc, order) => {
                acc[order.status] = (acc[order.status] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            };
            const isSelected = selectedWorker === worker.id;
            
            return (
              <div key={worker.id} className={`worker-section ${isSelected ? 'selected' : ''}`}>
                <div className="worker-info" onClick={() => setSelectedWorker(isSelected ? null : worker.id)}>
                  <div className="worker-avatar">
                    {worker.photo ? (
                      <img src={worker.photo} alt={worker.name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {worker.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="worker-details">
                    <div className="worker-name">{worker.name}</div>
                    <div className="worker-position">{worker.position || 'Сотрудник'}</div>
                    <div className="worker-stats">
                      <span className="stat">{stats.totalOrders} заказов</span>
                      <span className="stat">{stats.totalHours}ч</span>
                    </div>
                  </div>
                  <div className="expand-icon">
                    {isSelected ? '−' : '+'}
                  </div>
                </div>

                {/* Временные слоты для работника */}
                <div className="time-slots">
                  {timeSlots.map(timeSlot => (
                    <div key={timeSlot.time} className="time-row">
                      <div className="time-label">{timeSlot.time}</div>
                      {weekDays.map((_, dayIndex) => {
                        const ordersInSlot = filteredOrders.filter(order => {
                          if (order.assignedWorkerId !== worker.id) return false;
                          
                          const weekDates = getWeekDates();
                          const targetDate = weekDates[dayIndex];
                          const orderDate = order.scheduledDate.toDate();
                          const isSameDay = orderDate.toDateString() === targetDate.toDateString();
                          
                          if (!isSameDay) return false;
                          
                          const orderTime = order.scheduledTime;
                          const orderHour = parseInt(orderTime.split(':')[0]);
                          const orderMinute = parseInt(orderTime.split(':')[1]);
                          
                          const orderMinutes = orderHour * 60 + orderMinute;
                          const slotMinutes = timeSlot.hour * 60 + timeSlot.minute;
                          const duration = order.estimatedDuration || 120;
                          
                          return orderMinutes <= slotMinutes && slotMinutes < orderMinutes + duration;
                        });
                        const hasOrders = ordersInSlot.length > 0;
                        const mainOrder = ordersInSlot[0];
                        
                        return (
                          <div 
                            key={`${dayIndex}-${timeSlot.time}`} 
                            className={`time-cell ${hasOrders ? 'occupied' : 'free'}`}
                            style={{ 
                              backgroundColor: hasOrders ? getStatusColor(mainOrder.status) : 'transparent',
                              opacity: hasOrders ? 0.9 : 1
                            }}
                            title={hasOrders ? 
                              `${mainOrder.serviceType}\n${mainOrder.address}\nСтатус: ${getStatusText(mainOrder.status)}\nВремя: ${mainOrder.scheduledTime}` : 
                              'Свободно'
                            }
                          >
                            {hasOrders && (
                              <div className="order-preview">
                                <div className="service-type">{mainOrder.serviceType}</div>
                                {ordersInSlot.length > 1 && (
                                  <div className="multiple-orders">+{ordersInSlot.length - 1}</div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Детальная информация о заказах работника (показывается при выборе) */}
                {isSelected && (
                  <div className="worker-details-expanded">
                    <h4>Заказы на неделю:</h4>
                    <div className="orders-list">
                      {filteredOrders.filter(order => order.assignedWorkerId === worker.id).map(order => (
                        <div key={order.id} className="order-item">
                          <div className="order-time">
                            {order.scheduledDate.toDate().toLocaleDateString('ru-RU', { weekday: 'short', day: '2-digit', month: '2-digit' })} 
                            {' '}{order.scheduledTime}
                          </div>
                          <div className="order-service">{order.serviceType}</div>
                          <div className="order-address">{order.address}</div>
                          <div className={`order-status status-${order.status}`}>
                            {getStatusText(order.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EnhancedWorkersSchedule;