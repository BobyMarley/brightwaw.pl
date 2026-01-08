import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import './SimpleScheduleGrid.css';

interface Worker {
  id: string;
  name: string;
  email: string;
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
}

const SimpleScheduleGrid: React.FC = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const timeSlots = Array.from({ length: 28 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = (i % 2) * 30;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });

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
        where('scheduledDate', '<=', endOfWeek),
        where('assignedWorkerId', '!=', null)
      );
      
      const ordersSnapshot = await getDocs(ordersQuery);
      const ordersData = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(ordersData);
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
    return new Date(d.setDate(diff));
  };

  const getEndOfWeek = (date: Date) => {
    const start = getStartOfWeek(date);
    return new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
  };

  const getWeekDates = () => {
    const start = getStartOfWeek(currentWeek);
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  };

  const getOrderForSlot = (workerId: string, dayIndex: number, timeSlot: string) => {
    const weekDates = getWeekDates();
    const targetDate = weekDates[dayIndex];
    
    return orders.find(order => {
      if (order.assignedWorkerId !== workerId) return false;
      
      const orderDate = order.scheduledDate.toDate();
      const isSameDay = orderDate.toDateString() === targetDate.toDateString();
      
      if (!isSameDay) return false;
      
      const orderTime = order.scheduledTime;
      const orderHour = parseInt(orderTime.split(':')[0]);
      const orderMinute = parseInt(orderTime.split(':')[1]);
      const slotHour = parseInt(timeSlot.split(':')[0]);
      const slotMinute = parseInt(timeSlot.split(':')[1]);
      
      const orderMinutes = orderHour * 60 + orderMinute;
      const slotMinutes = slotHour * 60 + slotMinute;
      const duration = order.estimatedDuration || 120;
      
      return orderMinutes <= slotMinutes && slotMinutes < orderMinutes + duration;
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': '#FFA726',
      'confirmed': '#42A5F5',
      'in_progress': '#66BB6A',
      'completed': '#26A69A',
      'cancelled': '#EF5350'
    };
    return colors[status as keyof typeof colors] || '#9E9E9E';
  };

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() + (direction * 7));
    setCurrentWeek(newDate);
  };

  if (loading) {
    return <div className="schedule-loading">Загрузка...</div>;
  }

  return (
    <div className="simple-schedule">
      <div className="schedule-header">
        <h1>График работников</h1>
        <div className="week-navigation">
          <button onClick={() => navigateWeek(-1)}>← Предыдущая</button>
          <span>{getStartOfWeek(currentWeek).toLocaleDateString('ru')} - {getEndOfWeek(currentWeek).toLocaleDateString('ru')}</span>
          <button onClick={() => navigateWeek(1)}>Следующая →</button>
        </div>
      </div>

      <div className="schedule-grid">
        <div className="grid-header">
          <div className="time-column-header">Время</div>
          {weekDays.map((day, index) => {
            const date = getWeekDates()[index];
            return (
              <div key={day} className="day-header">
                <div className="day-name">{day}</div>
                <div className="day-date">{date.getDate()}.{(date.getMonth() + 1).toString().padStart(2, '0')}</div>
              </div>
            );
          })}
        </div>

        {workers.map(worker => (
          <div key={worker.id} className="worker-row">
            <div className="worker-info">
              <div className="worker-name">{worker.name}</div>
            </div>
            
            <div className="time-slots-container">
              {timeSlots.map(timeSlot => (
                <div key={timeSlot} className="time-slot-row">
                  <div className="time-label">{timeSlot}</div>
                  {weekDays.map((_, dayIndex) => {
                    const order = getOrderForSlot(worker.id, dayIndex, timeSlot);
                    return (
                      <div 
                        key={`${dayIndex}-${timeSlot}`} 
                        className={`time-cell ${order ? 'occupied' : 'free'}`}
                        style={{ 
                          backgroundColor: order ? getStatusColor(order.status) : 'transparent' 
                        }}
                        title={order ? `${order.serviceType} - ${order.address}` : ''}
                      >
                        {order && (
                          <div className="order-info">
                            <div className="service-type">{order.serviceType}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#FFA726' }}></span>
          Ожидает
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#42A5F5' }}></span>
          Подтвержден
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#66BB6A' }}></span>
          В процессе
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#26A69A' }}></span>
          Завершен
        </div>
      </div>
    </div>
  );
};

export default SimpleScheduleGrid;