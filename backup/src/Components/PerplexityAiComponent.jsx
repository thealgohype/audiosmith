import { WebsiteComponent } from "../Pages/WebSitecomponents";
import { useState } from 'react';

export const PerplexityAIComponent = () => {
    const [prompt, setPrompt] = useState('');

    const handlePromptChange = (e) => {
        setPrompt(e.target.value);
    };

    const handleSaveClick = async () => {
        try {
            const response = await fetch('/api/save-prompt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });

            if (response.ok) {
                console.log("Prompt saved!");
            } else {
                console.error("Error saving prompt:", response.statusText);
            }
        } catch (error) {
            console.error("Error saving prompt:", error);
        }
    };

    const handleKeyPress = async (e) => {
        if (e.key === 'Enter' && prompt.endsWith('///')) {
            try {
                const response = await fetch('/api/feed-prompt-to-ai', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ prompt }),
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log("Prompt fed to AI!", data);
                } else {
                    console.error("Error feeding prompt to AI:", response.statusText);
                }
            } catch (error) {
                console.error("Error feeding prompt to AI:", error);
            }
        }
    };

    return (
        <WebsiteComponent websiteConfig={{
            url: 'https://www.perplexity.ai/',
            inputSelector: 'input[type="text"]',
        }}>
            <div style={{ position: 'fixed', top: '20px', right: '20px' }}>
                <button onClick={handleSaveClick}>Save Prompt</button>
            </div>
            <input
                type="text"
                value={prompt}
                onChange={handlePromptChange}
                onKeyPress={handleKeyPress}
                style={{ width: '100%', height: '40px' }}
            />
        </WebsiteComponent>
    );
};