import { useState } from 'react';
import { WebsiteComponent } from './Pages/WebSitecomponents';
import { Sidebar } from './components/Sidebar';

const App = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
    <div style={{width:"40%"}} className={`fixed top-0 bottom-0 right-0 ${isOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform bg-gray-100 p-5`}>
      <button
        className="absolute top-5 right-full mr-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? 'Close' : 'Open'}
      </button>
      <WebsiteComponent/>
      <Sidebar/>
      <p className="mt-4 text-xl font-semibold">Sidebar Content</p>
    </div>
    </>
  )
};

export default App;


// // App.js
// import React, { useState, useEffect } from 'react';

// const App = () => {
//   const [prompt, setPrompt] = useState('');
//   const [isExpanded, setIsExpanded] = useState(false);

//   useEffect(() => {
//     const targetWebsites = [
//       'https://chat.openai.com/',
//       'https://www.perplexity.ai/',
//       'https://gemini.google.com/',
//     ];

//     const currentWebsite = window.location.href;

//     if (targetWebsites.some((website) => currentWebsite.startsWith(website))) {
//       const inputBox = document.querySelector('input[type="text"]');

//       if (inputBox) {
//         const originalInputBox = inputBox;

//         const extensionInputBox = document.createElement('input');
//         extensionInputBox.type = 'text';
//         extensionInputBox.value = prompt;
//         extensionInputBox.addEventListener('input', handleInputChange);

//         const expandButton = document.createElement('button');
//         expandButton.innerText = 'Expand';
//         expandButton.addEventListener('click', handleExpandClick);

//         originalInputBox.parentNode.insertBefore(extensionInputBox, originalInputBox);
//         originalInputBox.parentNode.insertBefore(expandButton, originalInputBox);
//         originalInputBox.style.display = 'none';

//         return () => {
//           originalInputBox.style.display = 'inline-block';
//           extensionInputBox.remove();
//           expandButton.remove();
//         };
//       }
//     }
//   }, [prompt, isExpanded]);

//   const handleInputChange = async (event) => {
//     const input = event.target.value;
//     setPrompt(input);

//     if (input.endsWith('///')) {
//       try {
//         const query = input.slice(0, -3); 
//         const response = await fetch('http://localhost:5000/api/generate-prompt', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({ query }),
//         });

//         if (response.ok) {
//           const data = await response.json();
//           setPrompt(data.generatedPrompt);
//         } else {
//           console.error('Error:', response.statusText);
//         }
//       } catch (error) {
//         console.error('Error:', error);
//       }
//     }
//   };

//   const handleExpandClick = () => {
//     setIsExpanded(!isExpanded);
//   };

//   return null;
// };

// export default App;