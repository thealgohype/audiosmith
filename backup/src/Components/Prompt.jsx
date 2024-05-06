import React, { useEffect } from 'react'

export const Prompt = () => {
    useEffect(() => {
        const targetWebsites = [
          {
            url: 'https://chat.openai.com/',
            inputSelector: 'textarea[data-id="root"]',
          },
          {
            url: 'https://www.perplexity.ai/',
            inputSelector: 'input[type="text"]',
          },
          {
            url: 'https://gemini.google.com/',
            inputSelector: 'textarea[aria-label="Enter text"]',
          },
        ];
    
        const currentWebsite = window.location.href;
    
        const website = targetWebsites.find((website) =>
          currentWebsite.startsWith(website.url)
        );
    
        if (website) {
          const inputBox = document.querySelector(website.inputSelector);
    
          if (inputBox) {
            const observer = new MutationObserver(async (mutations) => {
              for (const mutation of mutations) {
                if (mutation.type === 'characterData') {
                  const input = mutation.target.data;
    
                  if (input.endsWith('///')){
                    try {
                      const query = input.slice(0, -3); 
                      const response = await fetch('http://localhost:5000/api/generate-prompt', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ query }),
                      });
    
                      if (response.ok) {
                        const data = await response.json();
                        inputBox.value = data.generatedPrompt;
                      } else {
                        console.error('Error:', response.statusText);
                      }
                    } catch (error) {
                      console.error('Error:', error);
                    }
                  }
                }
              }
            });
    
            observer.observe(inputBox, { characterData: true, subtree: true });
    
            return () => {
              observer.disconnect();
            };
          }
        }
      }, []);
    
      return null;
}
