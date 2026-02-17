export default {
  async fetch(request) {
    const cache = caches.default;
    let response = await cache.match(request);
    
    if (!response) {
      response = await fetch(request);
      if (response.ok && request.method === 'GET') {
        await cache.put(request, response.clone());
      }
    }
    
    return response;
  }
}
