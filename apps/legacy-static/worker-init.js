if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

if ('Worker' in window) {
  const worker = new Worker('/preload-worker.js');
  
  const images = [
    '/public/rooms/room.png',
    '/public/rooms/corridor.png',
    '/public/rooms/kitchen.png',
    '/public/rooms/bathroom.png',
    '/public/work-1.jpg',
    '/public/work-2.jpg',
    '/public/work-3.jpg',
    '/public/work-4.jpg',
    '/public/work-5.jpg',
    '/public/work-6.jpg',
    '/public/faces/crop_0_1.jpg',
    '/public/faces/crop_1_0.jpg',
    '/public/faces/crop_2_0.jpg',
    '/public/faces/crop_1_1.jpg'
  ];
  
  worker.postMessage({ type: 'preload', data: images });
  
  window.trackEvent = (category, action, label) => {
    worker.postMessage({
      type: 'analytics',
      data: {
        v: '1',
        tid: 'AW-11273981561',
        cid: Date.now(),
        t: 'event',
        ec: category,
        ea: action,
        el: label
      }
    });
  };
}
