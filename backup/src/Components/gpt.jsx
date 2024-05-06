import React, { useEffect, useState } from 'react';

const ChatGPTModifier = () => {
  const [userInput, setUserInput] = useState('');

  useEffect(() => {
    if (window.location.href.includes('https://chat.openai.com/')) {
      const targetElement = document.getElementById('prompt-textarea');
      targetElement.addEventListener("input",()=>{
        console.log(targetElement.value)
      })

      if (targetElement) {
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('button-container');
        buttonContainer.style.backgroundColor="red"
        buttonContainer.style.color = "green"

        const button1 = document.createElement('button');
        button1.textContent = 'Button 1';
        button1.style.backgroundColor = "teal"
        button1.addEventListener('click', function() {
          console.log('Button 1 clicked');
        });

        const button2 = document.createElement('button');
        button2.textContent = 'Button 2';
        button2.style.backgroundColor = "yellow"
        button2.addEventListener('click', function() {
          console.log('Button 2 clicked');
        });

        buttonContainer.appendChild(button1);
        buttonContainer.appendChild(button2);

        targetElement.append(buttonContainer);

        targetElement.style.backgroundColor = '#f0f0f0';
        targetElement.style.padding = '10px';

        const textBox = document.querySelector('textarea.your-text-box-selector');

        if (textBox) {
          textBox.addEventListener('input', handleInputChange); 
        }
      }
    }
    return () => {
      const textBox = document.querySelector('textarea.your-text-box-selector');
      if (textBox) {
        textBox.removeEventListener('input', handleInputChange);
      }
    };
  }, []);

  const handleInputChange = (event) => {
    const input = event.target.value;
    setUserInput(input);
    console.log('User input:', input);
  };

  return null;
};

export default ChatGPTModifier;
