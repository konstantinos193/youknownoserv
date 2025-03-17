export const fetchWithRetry = async (url: string) => {
    const maxRetries = 3;
    const backoffDelay = 1000;
  
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const randomUserAgent = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${Math.floor(Math.random() * 20 + 100)}.0.0.0 Safari/537.36`;
  
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': randomUserAgent
          },
          cache: 'no-store'
        });
  
        if (response.status === 429 || response.status === 403) {
          if (attempt < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, backoffDelay * Math.pow(2, attempt)));
            continue;
          }
          return null;
        }
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const data = await response.json();
        return data.data;
      } catch (error) {
        console.error(`Attempt ${attempt + 1}/${maxRetries} failed:`, error);
        if (attempt === maxRetries - 1) {
          return null;
        }
        await new Promise(resolve => setTimeout(resolve, backoffDelay * Math.pow(2, attempt)));
      }
    }
  
    return null;
  };