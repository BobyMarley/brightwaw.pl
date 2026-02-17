self.addEventListener('message', (e) => {
  const { type, data } = e.data;
  
  if (type === 'preload') {
    data.forEach(url => {
      fetch(url, { mode: 'no-cors' })
        .then(() => self.postMessage({ type: 'loaded', url }))
        .catch(() => self.postMessage({ type: 'error', url }));
    });
  }
  
  if (type === 'analytics') {
    fetch('https://www.google-analytics.com/collect', {
      method: 'POST',
      body: new URLSearchParams(data)
    }).catch(() => {});
  }
});



