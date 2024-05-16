

import React, { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaPaperPlane, FaTrash, FaStop, FaTimes, FaBars } from 'react-icons/fa';
import "../styles/Components.css"

import openbook from '../heroimages/openbook.svg';
import arrowcirclebrokenright from '../heroimages/arrow-circle-broken-right.svg';
import ellipse from "../heroimages/Ellipse 93.svg"
import tool from "../heroimages/tool-01.svg"
import microphone from "../heroimages/microphone-01.svg"

export const Main = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [showAnimation, setShowAnimation] = useState(false);
  const [LLM, setModel] = useState('google-gemini');
  const [inputText, setInputText] = useState('');
 const beepAudioRef = useRef(new Audio('https://file.notion.so/f/f/d63da4d3-2abc-444e-8eab-6e3acc166743/1b0e0826-4588-4fd4-83ac-bcca2fbb6c28/clickti_-_3.mp3?id=87b35fc2-1d96-4eef-9b23-db2cc6e72fb1&table=block&spaceId=d63da4d3-2abc-444e-8eab-6e3acc166743&expirationTimestamp=1715947200000&signature=S_m-rh3smiQlpVHQfIoIv_1fia85sIBjpCrUpebz-1g'));
    const beepAudioRef2 = useRef(new Audio('https://file.notion.so/f/f/d63da4d3-2abc-444e-8eab-6e3acc166743/b61a9ecf-7160-4f55-8c55-c562525716d0/Tech_Message.mp3?id=979953c8-6948-4b02-b495-2741e3f5b710&table=block&spaceId=d63da4d3-2abc-444e-8eab-6e3acc166743&expirationTimestamp=1715976000000&signature=HAf2TIX1Qi6l0afFZwni1so-8iG5LToUNdw5aZK0_m8'));
  const speechRecognitionRef = useRef(null);
  const chatEndRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);


  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView();
  }, [chatHistory]);

  const playBeep = () => {
    beepAudioRef.current.play();
  };

  const addToChat = (message, type) => {
    if (type === 'question' && chatHistory.length > 0 && chatHistory[chatHistory.length - 1].text === message) {
      return;
    }
    setChatHistory(chatHistory => [...chatHistory, { text: message, type }]);
    if (!chatStarted) setChatStarted(true);
  };

  const clearChatHistory = () => {
    setChatHistory([]);
    setChatStarted(false); 
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      if (transcript.includes("stop")) {
        stopSpeaking();
        return;
      }
      if (event.results[event.results.length - 1].isFinal) {
        playBeep();
        setTranscription(transcript);
        handleSend(transcript, true);
      }
    };

    recognition.onspeechend = () => {
      recognition.stop();
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech Recognition Error:', event.error);
    };

    recognition.start();
    speechRecognitionRef.current = recognition;
    setIsListening(true);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      speechRecognitionRef.current = null;
    }
    setIsListening(false);
    setShowAnimation(false);
  };

  const handleSend = (text = inputText, isSpeech = false) => {
    playBeep();
    addToChat(text, 'question');
    setInputText('');
    const payload = {
      text: text,
      LLM: LLM
    };

    fetch("https://chatpro-algohype.replit.app/pro/add/", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    .then(response => response.json())
    .then(data => {
      beepAudioRef2.current.play();
      console.log("data", data)
      const answer = data.data1[3];
      addToChat(answer, 'answer');
      if (isSpeech) {
        speakAnswer(answer);
      }
    })
    .catch((error) => {
      console.error('Error with the send function:', error);
    });
  };

  const speakAnswer = (answer) => {
    const speech = new SpeechSynthesisUtterance(answer);
    speech.onstart = () => {
      setShowAnimation(true);
    };
    speech.onend = () => {
      setShowAnimation(false);
      startSpeechRecognition();
    };
    window.speechSynthesis.speak(speech);
  };


  const data = [
    {
        title: "Story",
        description: "Generate a story from the given prompt. Generate a story from the given prompt.Generate a story from the given prompt."
    },
    {
        title: "Adventure",
        description: "Create an adventure story based on your input. Create an adventure story based on your input."
    },
    {
        title: "Adventure",
        description: "Create an adventure story based on your input. Create an adventure story based on your input."
    },
];


  return (
    <div className='main-container'>
    {!chatStarted && (  
        <div className='inbuilt-prompt'>
            {data.map((item, index) => (
                <div key={index} className='inbuilt-prompt-div'>
                    <div className='book-icon-div'>
                        <img className='openbook-icn' src={openbook} alt="openbook_image" />
                    </div>
                    <p className='book-story'>{item.title}</p>
                    <p className="book-story-para">{item.description}</p>
                    <img className='arrowcirclebrokenright' src={arrowcirclebrokenright} alt="arrowcirclebrokenright_image" />
                </div>
            ))}
        </div>
      )}
    {/* <div className='inbuilt-prompt'>
            {data.map((item, index) => (
                <div key={index} className='inbuilt-prompt-div'>
                    <div className='book-icon-div'>
                        <img className='openbook-icn' src={openbook} alt="openbook_image" />
                    </div>
                    <p className='book-story'>{item.title}</p>
                    <p className="book-story-para">{item.description}</p>
                    <img className='arrowcirclebrokenright' src={arrowcirclebrokenright} alt="arrowcirclebrokenright_image" />
                </div>
            ))}
        </div> */}

  {/* --------------------prompt 1 ends------------ */}

  <div className="chat-container">
  {chatHistory.map((chat, index) => (
    <div 
  key={index} 
  className={chat.type === 'question' ? 'input-query' : 'chat-response'} 
  style={{ backgroundColor: chat.type === 'question' ? '#424242' : '#242424' }}
>
  <p>{chat.text}</p>
</div>
    
  ))}
  <div ref={chatEndRef} />
</div>

      <div>
      <div className="input-wrapper">
        <input
          className='input-box'
          type="text"
          placeholder="Type here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSend();
            }
          }}
        />
        <div className="icons-container">
          <img src={ellipse} alt="Settings" className="input-icon" onClick={clearChatHistory}/>
          <img src={tool} alt="Tool" className="input-icon"/>
          <img src={microphone} alt="Microphone" className="input-icon" onClick={startSpeechRecognition}/>
        </div>
          <img  src="https://s3-alpha-sig.figma.com/img/9ad7/2d2d/649a3f001361586c198c4722816c0ea8?Expires=1716768000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=CSgrJrHgcDpH7rC9bzPTT3BpM8tbUY7~vw8td2TPZczjLwF7eJfGc-RUVNQwoFMUl0~t1j5oSUeGjgpQnDIwFQTjbP83chT~brqeHhoKdp4~KUFW6uByEQWL3o6xCiRWfz46bntXldaOCeynnUJd8g2q35ENAZLzND4RB~Q7bBTTMuqcqQZAXvcW2nr1G5O6msI4SBybWrf~L5J14gfo1rwNMDkTiFlkxSe8NMbe9HlDhIYSZg6VsdhLCLdBop6rGyxQ2uv~ruYjyJrSPCMz-O4CA-Y1SRp9mapcqnZ3GZBFhVg8sdl86OR6VlyaSkkV31ZUVjrqrtdW8NOCAU12KA__" alt="Microphone" className="send-icon" onClick={()=>{handleSend()}}/>
      </div>


        {isListening && (
          <div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        )}
      </div>
      {showAnimation && (
        <div>
          <div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      )}
    </div>
  );
}


{/* <div className='main-container'>
<button onClick={toggleSidebar}>
  <FaBars/>
</button>

<div className="side">
<div className='sidebar' style={{ display: isSidebarOpen ? 'block' : 'none' }}>
  <select value={LLM} onChange={(e) => setModel(e.target.value)}>
    <option value="gpt-3.5-turbo">GPT-3.5-turbo</option>
    <option value="gpt-4">GPT-4</option>
    <option value="claude-sonnet">Claude-sonnet</option>
    <option value="claude-opus">Claude-opus</option>
    <option value="google-gemini">Gemini</option>
    <option value="llama3-groq">LlAMA-3-groq</option>
  </select>
  <button onClick={toggleSidebar}>
    <FaTimes />
  </button>

  <button onClick={clearChatHistory}>
    <FaTrash />
  </button>
  <button onClick={stopSpeaking}>
    <FaStop />
  </button>
  <button onClick={() => handleSend()}>
    <FaPaperPlane />
  </button>
</div>
</div>

<div>
  {chatHistory.map((chat, index) => (
    <div key={index}>
      {chat.type === 'question' ? (
        <p>{chat.text}</p>
      ) : (
        <p>{chat.text}</p>
      )}
    </div>
  ))}
  <div ref={chatEndRef} />
</div>
<div>
  <input
    type="text"
    placeholder="Type here..."
    value={inputText}
    onChange={(e) => setInputText(e.target.value)}
    onKeyPress={(e) => {
      if (e.key === 'Enter') {
        handleSend();
      }
    }}
  />
  <button onClick={startSpeechRecognition}>
    <FaMicrophone />
  </button>
  {isListening && (
    <div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  )}
</div>
{showAnimation && (
  <div>
    <div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  </div>
)}
</div> */}


// const beepAudioRef = useRef(new Audio('https://file.notion.so/f/f/d63da4d3-2abc-444e-8eab-6e3acc166743/b61a9ecf-7160-4f55-8c55-c562525716d0/Tech_Message.mp3?id=979953c8-6948-4b02-b495-2741e3f5b710&table=block&spaceId=d63da4d3-2abc-444e-8eab-6e3acc166743&expirationTimestamp=1715493600000&signature=bpShLIaV37I6gkfWfS3UckUY6ZmJMbB5Y6ovn-l3dbs'));
//    const beepAudioRef2 = useRef(new Audio('https://file.notion.so/f/f/d63da4d3-2abc-444e-8eab-6e3acc166743/1b0e0826-4588-4fd4-83ac-bcca2fbb6c28/clickti_-_3.mp3?id=87b35fc2-1d96-4eef-9b23-db2cc6e72fb1&table=block&spaceId=d63da4d3-2abc-444e-8eab-6e3acc166743&expirationTimestamp=1715493600000&signature=P2w3a-ZdxR1fQ7kySpNxU4UaDJeFmKSknFZiqQUrph8'));
// https://chatpro-algohype.replit.app/pro/add/