import React, { useEffect } from 'react';

export const WebsiteComponent = ({ websiteConfig, children }) => {
    useEffect(() => {
        if (!websiteConfig) {
            return; 
        }

        const currentWebsite = window.location.href;

        if (currentWebsite.startsWith(websiteConfig.url)) {
            const inputBox = document.querySelector(websiteConfig.inputSelector);

            if (inputBox) {
                const observer = new MutationObserver(async (mutations) => {
                    for (const mutation of mutations) {
                        if (mutation.type === 'characterData') {
                            const input = mutation.target.data;

                            if (input.endsWith('///')) {
                                try {
                                    const query = input.slice(0,-3);
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
    }, [websiteConfig]);

    return children || null;
};