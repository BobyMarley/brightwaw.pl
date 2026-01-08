import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface Worker {
  id: string;
  name: string;
  email: string;
  availability?: { [date: string]: string[] };
}

interface Order {
  id: string;
  assignedWorkerId: string;
  assignedWorkerName: string;
  scheduledDate: any;
  scheduledTime: string;
  status: string;
  serviceType: string;
  address: string;
}

const SimpleAdminSchedule: React.FC = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];
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

  const isWorkerAvailable = (workerId: string, dayIndex: number, timeSlot: string) => {
    const worker = workers.find(w => w.id === workerId);
    if (!worker || !worker.availability) return false;
    
    const weekDates = getWeekDates();
    const targetDate = weekDates[dayIndex];
    const dateStr = targetDate.toISOString().split('T')[0];
    
    const dayAvailability = worker.availability[dateStr];
    if (!dayAvailability || !Array.isArray(dayAvailability)) return false;
    
    return dayAvailability.includes(timeSlot);
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
      const slotHour = parseInt(timeSlot.split(':')[0]);
      const orderHour = parseInt(orderTime.split(':')[0]);
      
      return Math.abs(orderHour - slotHour) < 1;
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
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #f3f3f3', 
          borderTop: '4px solid #1976d2', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }}></div>
        <p>Загрузка графика работников...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '100%', overflowX: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <h1 style={{ margin: 0, color: '#1976d2', fontSize: '28px', fontWeight: '600' }}>График работников</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            onClick={() => navigateWeek(-1)} 
            style={{ 
              padding: '8px 16px', 
              background: '#1976d2', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ← Предыдущая
          </button>
          <span style={{ fontWeight: '600', minWidth: '200px', textAlign: 'center' }}>
            {getStartOfWeek(currentWeek).toLocaleDateString('ru')} - {getEndOfWeek(currentWeek).toLocaleDateString('ru')}
          </span>
          <button 
            onClick={() => navigateWeek(1)} 
            style={{ 
              padding: '8px 16px', 
              background: '#1976d2', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Следующая →
          </button>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden', minWidth: '800px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '150px repeat(7, 1fr)', background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
          <div style={{ padding: '15px 10px', fontWeight: '600', textAlign: 'center', borderRight: '1px solid #ddd' }}>Время</div>
          {weekDays.map((day, index) => {
            const date = getWeekDates()[index];
            return (
              <div key={day} style={{ padding: '10px', textAlign: 'center', borderRight: '1px solid #ddd' }}>
                <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{day}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>{date.getDate()}.{(date.getMonth() + 1).toString().padStart(2, '0')}</div>
              </div>
            );
          })}
        </div>

        {workers.map(worker => (
          <div key={worker.id} style={{ borderBottom: '1px solid #eee' }}>
            <div style={{ background: '#fafafa', padding: '10px', borderRight: '1px solid #ddd', fontWeight: '600', fontSize: '14px', color: '#333' }}>
              {worker.name}
            </div>
            
            {timeSlots.map(timeSlot => (
              <div key={timeSlot} style={{ display: 'grid', gridTemplateColumns: '150px repeat(7, 1fr)' }}>
                <div style={{ padding: '8px 10px', fontSize: '12px', color: '#666', background: '#fafafa', borderRight: '1px solid #ddd', borderBottom: '1px solid #f0f0f0', textAlign: 'center' }}>
                  {timeSlot}
                </div>
                {weekDays.map((_, dayIndex) => {
                  const isAvailable = isWorkerAvailable(worker.id, dayIndex, timeSlot);
                  const order = getOrderForSlot(worker.id, dayIndex, timeSlot);
                  
                  let backgroundColor = 'transparent';
                  let content = null;
                  let title = '';
                  
                  if (order) {
                    // Есть заказ - показываем цвет статуса
                    backgroundColor = getStatusColor(order.status);
                    content = (
                      <div style={{ textAlign: 'center', padding: '2px', width: '100%' }}>
                        <div style={{ fontSize: '10px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {order.serviceType}
                        </div>
                      </div>
                    );
                    title = `${order.serviceType} - ${order.address}`;
                  } else if (isAvailable) {
                    // Работник доступен, но нет заказа
                    backgroundColor = '#E8F5E8';
                    content = (
                      <div style={{ fontSize: '10px', color: '#2E7D32', fontWeight: '500' }}>
                        Доступен
                      </div>
                    );
                    title = 'Работник доступен для заказов';
                  }
                  
                  return (
                    <div 
                      key={`${dayIndex}-${timeSlot}`} 
                      style={{ 
                        minHeight: '30px',
                        borderRight: '1px solid #f0f0f0',
                        borderBottom: '1px solid #f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor,
                        color: order ? 'white' : 'inherit',
                        fontSize: '11px',
                        fontWeight: (order || isAvailable) ? '500' : 'normal'
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
        ))}
      </div>

      <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
          <span style={{ width: '16px', height: '16px', backgroundColor: '#E8F5E8', borderRadius: '3px' }}></span>
          Доступен
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
          <span style={{ width: '16px', height: '16px', backgroundColor: '#FFA726', borderRadius: '3px' }}></span>
          Ожидает
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
          <span style={{ width: '16px', height: '16px', backgroundColor: '#42A5F5', borderRadius: '3px' }}></span>
          Подтвержден
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
          <span style={{ width: '16px', height: '16px', backgroundColor: '#66BB6A', borderRadius: '3px' }}></span>
          В процессе
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
          <span style={{ width: '16px', height: '16px', backgroundColor: '#26A69A', borderRadius: '3px' }}></span>
          Завершен
        </div>
      </div>
    </div>
  );
};

export default SimpleAdminSchedule;