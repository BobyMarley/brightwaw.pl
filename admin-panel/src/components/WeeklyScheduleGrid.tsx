import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface Worker {
  id: string;
  name: string;
  availability?: { [date: string]: string[] };
}

interface Order {
  id: string;
  assignedWorkerId: string;
  scheduledDate: any;
  scheduledTime: string;
  status: string;
  serviceType: string;
}

const WeeklyScheduleGrid: React.FC = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const timeSlots = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  useEffect(() => {
    loadData();
  }, [currentWeek]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const workersQuery = query(collection(db, 'workers'));
      const workersSnapshot = await getDocs(workersQuery);
      const workersData = workersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Worker[];
      setWorkers(workersData);

      const startOfWeek = getStartOfWeek(currentWeek);
      const endOfWeek = getEndOfWeek(currentWeek);
      
      const ordersQuery = query(
        collection(db, 'orders'),
        where('scheduledDate', '>=', startOfWeek),
        where('scheduledDate', '<=', endOfWeek)
      );
      
      const ordersSnapshot = await getDocs(ordersQuery);
      const ordersData = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(ordersData.filter(order => order.assignedWorkerId));
    } catch (error) {
      console.error('Ошибка загрузки:', error);
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

  const getCellStatus = (workerId: string, dayIndex: number, timeSlot: string) => {
    const worker = workers.find(w => w.id === workerId);
    const weekDates = getWeekDates();
    const targetDate = weekDates[dayIndex];
    const dateStr = targetDate.toISOString().split('T')[0];
    
    // Проверяем заказ
    const order = orders.find(order => {
      if (order.assignedWorkerId !== workerId) return false;
      const orderDate = order.scheduledDate.toDate();
      const isSameDay = orderDate.toDateString() === targetDate.toDateString();
      if (!isSameDay) return false;
      const orderHour = parseInt(order.scheduledTime.split(':')[0]);
      const slotHour = parseInt(timeSlot.split(':')[0]);
      return Math.abs(orderHour - slotHour) <= 1;
    });

    if (order) {
      return { type: 'order', status: order.status, order };
    }

    // Проверяем доступность
    if (worker?.availability?.[dateStr]?.includes(timeSlot)) {
      return { type: 'available' };
    }

    return { type: 'unavailable' };
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

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() + (direction * 7));
    setCurrentWeek(newDate);
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Загрузка...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '100%', overflowX: 'auto' }}>
      {/* Заголовок */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, color: '#1976d2', fontSize: '24px', fontWeight: '600' }}>
          Сводный график работников
        </h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={() => navigateWeek(-1)} style={{ padding: '8px 16px', background: '#1976d2', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            ← Предыдущая
          </button>
          <span style={{ fontWeight: '600', minWidth: '200px', textAlign: 'center' }}>
            {getStartOfWeek(currentWeek).toLocaleDateString('ru')} - {getEndOfWeek(currentWeek).toLocaleDateString('ru')}
          </span>
          <button onClick={() => navigateWeek(1)} style={{ padding: '8px 16px', background: '#1976d2', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            Следующая →
          </button>
        </div>
      </div>

      {/* Основная таблица */}
      <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden', minWidth: '1000px' }}>
        {/* Заголовок дней */}
        <div style={{ display: 'grid', gridTemplateColumns: '200px repeat(7, 1fr)', background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
          <div style={{ padding: '15px', fontWeight: '600', textAlign: 'center', borderRight: '1px solid #ddd' }}>
            Сотрудник
          </div>
          {weekDays.map((day, index) => {
            const date = getWeekDates()[index];
            const isToday = date.toDateString() === new Date().toDateString();
            return (
              <div key={day} style={{ 
                padding: '10px', 
                textAlign: 'center', 
                borderRight: '1px solid #ddd',
                background: isToday ? 'rgba(33, 150, 243, 0.1)' : 'transparent'
              }}>
                <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{day}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {date.getDate()}.{(date.getMonth() + 1).toString().padStart(2, '0')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Строки работников */}
        {workers.map(worker => (
          <div key={worker.id} style={{ borderBottom: '1px solid #eee' }}>
            {/* Имя работника */}
            <div style={{ display: 'grid', gridTemplateColumns: '200px repeat(7, 1fr)', minHeight: '60px' }}>
              <div style={{ 
                padding: '15px', 
                background: '#fafafa', 
                borderRight: '1px solid #ddd',
                display: 'flex',
                alignItems: 'center',
                fontWeight: '600',
                fontSize: '14px'
              }}>
                {worker.name}
              </div>
              
              {/* Дни недели для работника */}
              {weekDays.map((_, dayIndex) => (
                <div key={dayIndex} style={{ 
                  borderRight: '1px solid #f0f0f0',
                  display: 'grid',
                  gridTemplateColumns: `repeat(${timeSlots.length}, 1fr)`,
                  gap: '1px',
                  padding: '2px'
                }}>
                  {timeSlots.map(timeSlot => {
                    const cellStatus = getCellStatus(worker.id, dayIndex, timeSlot);
                    
                    let backgroundColor = '#f8f9fa';
                    let content = '';
                    let title = `${timeSlot}`;
                    
                    if (cellStatus.type === 'order') {
                      backgroundColor = getStatusColor(cellStatus.status);
                      content = '●';
                      title = `${timeSlot} - ${cellStatus.order?.serviceType}`;
                    } else if (cellStatus.type === 'available') {
                      backgroundColor = '#e8f5e8';
                      content = '○';
                      title = `${timeSlot} - Доступен`;
                    }
                    
                    return (
                      <div
                        key={timeSlot}
                        style={{
                          minHeight: '20px',
                          backgroundColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: cellStatus.type === 'order' ? 'white' : '#666',
                          borderRadius: '2px',
                          cursor: 'pointer'
                        }}
                        title={title}
                      >
                        {content}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Временные слоты */}
      <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '12px', color: '#666' }}>
        {timeSlots.map(slot => (
          <span key={slot}>{slot}</span>
        ))}
      </div>

      {/* Легенда */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
          <span style={{ width: '16px', height: '16px', backgroundColor: '#e8f5e8', borderRadius: '3px' }}></span>
          Доступен (○)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
          <span style={{ width: '16px', height: '16px', backgroundColor: '#FF9800', borderRadius: '3px' }}></span>
          Заказ ожидает (●)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
          <span style={{ width: '16px', height: '16px', backgroundColor: '#2196F3', borderRadius: '3px' }}></span>
          Заказ подтвержден (●)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
          <span style={{ width: '16px', height: '16px', backgroundColor: '#4CAF50', borderRadius: '3px' }}></span>
          В работе (●)
        </div>
      </div>
    </div>
  );
};

export default WeeklyScheduleGrid;