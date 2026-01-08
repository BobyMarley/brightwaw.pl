import React from 'react';
import * as XLSX from 'xlsx';

interface Worker {
  id: string;
  name: string;
  email: string;
  position?: string;
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

interface ScheduleExportProps {
  workers: Worker[];
  orders: Order[];
  weekStart: Date;
  weekEnd: Date;
}

const ScheduleExport: React.FC<ScheduleExportProps> = ({ workers, orders, weekStart, weekEnd }) => {
  
  const exportToExcel = () => {
    // Создаем данные для экспорта
    const exportData = [];
    
    // Заголовок
    exportData.push([
      'График работников',
      `${weekStart.toLocaleDateString('ru-RU')} - ${weekEnd.toLocaleDateString('ru-RU')}`
    ]);
    exportData.push([]); // Пустая строка
    
    // Заголовки таблицы
    exportData.push([
      'Сотрудник',
      'Должность',
      'Дата',
      'Время',
      'Длительность (мин)',
      'Услуга',
      'Адрес',
      'Статус',
      'Клиент'
    ]);
    
    // Данные по заказам
    orders.forEach(order => {
      const worker = workers.find(w => w.id === order.assignedWorkerId);
      exportData.push([
        order.assignedWorkerName || worker?.name || 'Неизвестно',
        worker?.position || 'Сотрудник',
        order.scheduledDate.toDate().toLocaleDateString('ru-RU'),
        order.scheduledTime,
        order.estimatedDuration || 120,
        order.serviceType,
        order.address,
        getStatusText(order.status),
        order.customerName || 'Не указан'
      ]);
    });
    
    // Статистика по сотрудникам
    exportData.push([]); // Пустая строка
    exportData.push(['Статистика по сотрудникам']);
    exportData.push(['Сотрудник', 'Количество заказов', 'Общее время (часы)', 'Статусы']);
    
    workers.forEach(worker => {
      const workerOrders = orders.filter(order => order.assignedWorkerId === worker.id);
      const totalHours = workerOrders.reduce((sum, order) => sum + (order.estimatedDuration || 120), 0) / 60;
      const statusCounts = workerOrders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const statusText = Object.entries(statusCounts)
        .map(([status, count]) => `${getStatusText(status)}: ${count}`)
        .join(', ');
      
      exportData.push([
        worker.name,
        workerOrders.length,
        Math.round(totalHours * 10) / 10,
        statusText || 'Нет заказов'
      ]);
    });
    
    // Создаем рабочую книгу
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(exportData);
    
    // Настраиваем ширину колонок
    const colWidths = [
      { wch: 20 }, // Сотрудник
      { wch: 15 }, // Должность
      { wch: 12 }, // Дата
      { wch: 8 },  // Время
      { wch: 12 }, // Длительность
      { wch: 25 }, // Услуга
      { wch: 30 }, // Адрес
      { wch: 15 }, // Статус
      { wch: 20 }  // Клиент
    ];
    ws['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(wb, ws, 'График работников');
    
    // Сохраняем файл
    const fileName = `график_работников_${weekStart.toLocaleDateString('ru-RU').replace(/\./g, '-')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };
  
  const exportToCSV = () => {
    const csvData = [];
    
    // Заголовки
    csvData.push([
      'Сотрудник',
      'Должность', 
      'Дата',
      'Время',
      'Длительность (мин)',
      'Услуга',
      'Адрес',
      'Статус',
      'Клиент'
    ]);
    
    // Данные
    orders.forEach(order => {
      const worker = workers.find(w => w.id === order.assignedWorkerId);
      csvData.push([
        order.assignedWorkerName || worker?.name || 'Неизвестно',
        worker?.position || 'Сотрудник',
        order.scheduledDate.toDate().toLocaleDateString('ru-RU'),
        order.scheduledTime,
        order.estimatedDuration || 120,
        order.serviceType,
        order.address,
        getStatusText(order.status),
        order.customerName || 'Не указан'
      ]);
    });
    
    // Преобразуем в CSV строку
    const csvContent = csvData.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
    
    // Создаем и скачиваем файл
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `график_работников_${weekStart.toLocaleDateString('ru-RU').replace(/\./g, '-')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const printSchedule = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>График работников</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #2563eb; text-align: center; }
          .period { text-align: center; color: #666; margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .status-pending { background-color: #fff3cd; }
          .status-confirmed { background-color: #d1ecf1; }
          .status-in_progress { background-color: #d4edda; }
          .status-completed { background-color: #cce7f0; }
          .status-cancelled { background-color: #f8d7da; }
          .stats { margin-top: 30px; }
          .stats h3 { color: #2563eb; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>График работников</h1>
        <div class="period">${weekStart.toLocaleDateString('ru-RU')} - ${weekEnd.toLocaleDateString('ru-RU')}</div>
        
        <table>
          <thead>
            <tr>
              <th>Сотрудник</th>
              <th>Дата</th>
              <th>Время</th>
              <th>Услуга</th>
              <th>Адрес</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map(order => `
              <tr class="status-${order.status}">
                <td>${order.assignedWorkerName}</td>
                <td>${order.scheduledDate.toDate().toLocaleDateString('ru-RU')}</td>
                <td>${order.scheduledTime}</td>
                <td>${order.serviceType}</td>
                <td>${order.address}</td>
                <td>${getStatusText(order.status)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="stats">
          <h3>Статистика по сотрудникам</h3>
          <table>
            <thead>
              <tr>
                <th>Сотрудник</th>
                <th>Заказов</th>
                <th>Часов</th>
              </tr>
            </thead>
            <tbody>
              ${workers.map(worker => {
                const workerOrders = orders.filter(order => order.assignedWorkerId === worker.id);
                const totalHours = workerOrders.reduce((sum, order) => sum + (order.estimatedDuration || 120), 0) / 60;
                return `
                  <tr>
                    <td>${worker.name}</td>
                    <td>${workerOrders.length}</td>
                    <td>${Math.round(totalHours * 10) / 10}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
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
  
  return (
    <div className="schedule-export">
      <div className="export-buttons">
        <button onClick={exportToExcel} className="export-btn excel-btn">
          📊 Экспорт в Excel
        </button>
        <button onClick={exportToCSV} className="export-btn csv-btn">
          📄 Экспорт в CSV
        </button>
        <button onClick={printSchedule} className="export-btn print-btn">
          🖨️ Печать
        </button>
      </div>
    </div>
  );
};

export default ScheduleExport;