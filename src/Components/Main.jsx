

import React, { useState, useRef, useEffect } from 'react';
import '../styles/Main.css';
import { FaMicrophone, FaPaperPlane, FaTrash, FaStop } from 'react-icons/fa';

export const Main = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [showAnimation, setShowAnimation] = useState(false);
  const [LLM, setModel] = useState('gpt-3.5-turbo');
  const [inputText, setInputText] = useState('');
  const audioRef = useRef(new Audio());
  const beepAudioRef = useRef(new Audio('https://file.notion.so/f/f/d63da4d3-2abc-444e-8eab-6e3acc166743/f177ded8-53d2-476d-8fd5-3c8ef78952ab/Goat-Baby-Cry-www.fesliyanstudios.com.mp3?id=8d1dc1f0-0954-420b-9c7e-0d21e8dfce57&table=block&spaceId=d63da4d3-2abc-444e-8eab-6e3acc166743&expirationTimestamp=1715349600000&signature=Auir38F-PYz2fvb4sfNwUnaImDBhI9PchzvIi1GYzW0&downloadName=Goat-Baby-Cry-www.fesliyanstudios.com.mp3'));
  // const beepAudioRef = useRef(new Audio('https://freesound.org/data/previews/91/91926_7037-lq.mp3'));
  const speechRecognitionRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const playBeep = () => {
    beepAudioRef.current.play();
  };

  const addToChat = (message, type) => {
    if (type === 'question' && chatHistory.length > 0 && chatHistory[chatHistory.length - 1].text === message) {
      return;
    }
    setChatHistory(chatHistory => [...chatHistory, { text: message, type }]);
  };

  const clearChatHistory = () => {
    setChatHistory([]);
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
        handleSend(transcript);
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
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      speechRecognitionRef.current = null;
    }
    setIsListening(false);
    setShowAnimation(false);
  };

  const handleSend = (text = inputText) => {
    playBeep();  
    addToChat(text, 'question');
    setInputText('');
    const payload = {
      text: text,
      LLM: LLM
    };

    fetch(`${process.env.backendURL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    .then(response => response.json())
    .then(data => {
      console.log("data",data)
      const answer = data.data1[3];
      addToChat(answer, 'answer');
      speakAnswer(answer);
    })
    .catch((error) => {
      console.error('Error with the send function:', error);
    });
  };

  const speakAnswer = (answer) => {
    playBeep();  
    const apiKey = `${process.env.apiKey}`;
    const voiceId = `${process.env.voiceId}`;

    const options = {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text: answer,
        model_id: 'eleven_turbo_v2',
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.75
        }
      })
    };

    fetch(`${process.env.ELEVENLABS_API_URL}${voiceId}/stream`, options)
      .then(response => response.blob())
      .then(audioBlob => {
        setShowAnimation(true);
        const audioUrl = URL.createObjectURL(audioBlob);
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        audioRef.current.onended = () => {
          setShowAnimation(false);
          startSpeechRecognition(); 
        };
      })
      .catch(error => {
        console.error('Fetch error:', error);
        setShowAnimation(false);
      });
  };





  return (
    <div className="main-container bg-gray-900 text-white h-screen flex">
      <aside className="sidebar w-64 bg-gray-800 p-4">
        <select className="model-selector block w-full p-2 mb-4 bg-gray-700 text-white border border-gray-600 rounded" value={LLM} onChange={(e) => setModel(e.target.value)}>
          <option value="gpt-3.5-turbo">GPT-3.5-turbo</option>
          <option value="gpt-4">GPT-4</option>
          <option value="claude-sonneT">Claude-sonne</option>
          <option value="claude-opus">Claude-opus</option>
          <option value="google-gemini">Gemini</option>
          <option value="llama3-groq">LlAMA-3-groq</option>
        </select>

        <a href="https://promptsmith.co/" target="_blank" rel="noopener noreferrer">
    <img
      src="https://croo-json-files.s3.ap-south-1.amazonaws.com/__screenshots_json/logorpomptsmith.png"  
      alt="Description of the image"           
      className="mt-10 ml-12"                          
      style={{ width: '100px', height: 'auto', display: 'block' }}
    />
  </a>
        
        <div className='mt-60'>
        <button className="clear-button ml-8 mt-10 px-8 py-4 rounded bg-red-500 text-white" onClick={clearChatHistory}>
          <FaTrash />
        </button>
        <button className="stop-button ml-5  px-8 py-4 rounded bg-red-500 text-white" onClick={stopSpeaking}>
            <FaStop />
          </button>
        </div>
         <button className="send-button ml-20 mt-10  px-8 py-4 rounded bg-blue-500 text-white" onClick={() => handleSend()}>
            <FaPaperPlane />
          </button>
          
      </aside>  
      <section className="chat-container flex-grow flex flex-col p-4 ">
        <div className="chat-display overflow-y-auto mb-4 flex-grow">
          {chatHistory.map((chat, index) => (
            <div key={index} className={`chat-message ${chat.type === 'question' ? 'justify-end' : 'justify-start'} flex mb-2`}>
              {chat.type === 'question' ? (
                <>
                  <p className="text-lg bg-blue-500 text-white p-2 rounded-lg max-w-sm">{chat.text}</p>
                  <img src="https://croo-json-files.s3.ap-south-1.amazonaws.com/__screenshots_json/user2.png" alt="User" className="w-8 h-8 ml-2" />
                </>
              ) : (
                <>
                  <img src="https://croo-json-files.s3.ap-south-1.amazonaws.com/__screenshots_json/bot.png" alt="AI" className="w-8 h-8 mr-2" />
                  <p className="text-lg bg-gray-700 text-white p-2 rounded-lg max-w-sm">{chat.text}</p>
                </>
              )}
            </div>
          ))}
          <div ref={chatEndRef} /> 
        </div>
        <div className="input-area flex items-center">
          <input
            type="text"
            className="search-bar flex-grow mr-2 p-2 bg-gray-700 border border-gray-600 rounded"
            placeholder="Type here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSend();
              }
            }}
          />
          <button className={`mic-button px-8 py-6 rounded text-white ${isListening ? 'bg-red-500' : 'bg-green-500'}`} onClick={startSpeechRecognition}>
            <FaMicrophone />
          </button>
          {/* <button className="send-button ml-2 px-4 py-2 rounded bg-blue-500 text-white" onClick={() => handleSend()}>
            <FaPaperPlane />
          </button> */}
          
          {isListening && <div className="voice-bars">
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>}
        </div>
        {showAnimation && (
          <div className="animation-overlay">
            <div className="animation-container">
              <div className="speaking-animation">
                <div className="animation-circle"></div>
                <div className="animation-circle"></div>
                <div className="animation-circle"></div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

// //     const voiceId = `dDOTNmkm9Bfx81UeUGnU`;
// //-------------------------------------------------sound functionality implemented-------------------->>>>
// import React, { useState, useRef, useEffect } from 'react';
// import '../styles/Main.css';
// import { FaMicrophone, FaPaperPlane, FaTrash, FaStop } from 'react-icons/fa';

// export const Main = () => {
//   const [isListening, setIsListening] = useState(false);
//   const [transcription, setTranscription] = useState('');
//   const [chatHistory, setChatHistory] = useState([]);
//   const [showAnimation, setShowAnimation] = useState(false);
//   const [LLM, setModel] = useState('gpt-3.5-turbo');
//   const [inputText, setInputText] = useState('');
//   // const audioRef = useRef(new Audio('https://file.notion.so/f/f/d63da4d3-2abc-444e-8eab-6e3acc166743/b61a9ecf-7160-4f55-8c55-c562525716d0/Tech_Message.mp3?id=979953c8-6948-4b02-b495-2741e3f5b710&table=block&spaceId=d63da4d3-2abc-444e-8eab-6e3acc166743&expirationTimestamp=1715342400000&signature=RzJabjicQD8R8Zhu_lUgT-zpfrtsZW06lHkxfumqZOM'));
//   const audioRef = useRef(new Audio('https://file.notion.so/f/f/d63da4d3-2abc-444e-8eab-6e3acc166743/f177ded8-53d2-476d-8fd5-3c8ef78952ab/Goat-Baby-Cry-www.fesliyanstudios.com.mp3?id=8d1dc1f0-0954-420b-9c7e-0d21e8dfce57&table=block&spaceId=d63da4d3-2abc-444e-8eab-6e3acc166743&expirationTimestamp=1715349600000&signature=Auir38F-PYz2fvb4sfNwUnaImDBhI9PchzvIi1GYzW0&downloadName=Goat-Baby-Cry-www.fesliyanstudios.com.mp3'));
//   // const audioRef = useRef(new Audio('https://file.notion.so/f/f/d63da4d3-2abc-444e-8eab-6e3acc166743/4c5c67f8-9e5b-4142-aee2-3e0e6f5d06db/Goat-screaming-sound-effect.mp3?id=bbfe8290-bff9-43a6-aa37-ab674567dcb5&table=block&spaceId=d63da4d3-2abc-444e-8eab-6e3acc166743&expirationTimestamp=1715349600000&signature=Aq2cg26kBVWYBN-2g_MoKmkBdL7AyIBttIjr-Ao4GuE&downloadName=Goat-screaming-sound-effect.mp3'));
//   // const audioRef = useRef(new Audio('https://freesound.org/data/previews/91/91926_7037-lq.mp3'));
//   const speechRecognitionRef = useRef(null);
//   const chatEndRef = useRef(null);

//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [chatHistory]);

//   // useEffect(() => {
//   //   audioRef.current.oncanplaythrough = () => {
//   //     console.log('Audio is ready to play');
//   //   };
//   //   audioRef.current.onerror = () => {
//   //     console.error('Error loading the audio file');
//   //   };
//   // }, []);

//   const addToChat = (message, type) => {
//     if (type === 'question' && chatHistory.length > 0 && chatHistory[chatHistory.length - 1].text === message) {
//       return;
//     }
//     setChatHistory(chatHistory => [...chatHistory, { text: message, type }]);
//   };

//   const clearChatHistory = () => {
//     setChatHistory([]);
//   };

//   // const startSpeechRecognition = () => {
//   //   const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//   //   const recognition = new SpeechRecognition();
//   //   recognition.lang = 'en-US';
//   //   // hi-IN
//   //   recognition.interimResults = true;  
//   //   recognition.maxAlternatives = 1;

//   //   recognition.onresult = (event) => {
//   //     const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
//   //     if (transcript.includes("stop")) {
//   //       stopSpeaking();
//   //       return;
//   //     }
//   //     if (event.results[event.results.length - 1].isFinal) {
//   //       setTranscription(transcript);
//   //       handleSend(transcript);
//   //     }
//   //   };

//   //   recognition.onspeechend = () => {
//   //     recognition.stop();
//   //     setIsListening(false);
//   //     playSound()
//   //   };
//   //   const stopAllActivities = () => {
//   //     if (audioRef.current) {
//   //       audioRef.current.pause();
//   //       audioRef.current.currentTime = 0;
//   //     }
//   //     if (speechRecognitionRef.current) {
//   //       speechRecognitionRef.current.stop();
//   //       speechRecognitionRef.current = null;
//   //     }
//   //     setIsListening(false);
//   //     setShowAnimation(false);
//   //     startSpeechRecognition();
//   //   };
//   //   recognition.onerror = (event) => {
//   //     console.error('Speech Recognition Error:', event.error);
//   //   };

//   //   recognition.start();
//   //   speechRecognitionRef.current = recognition;
//   //   setIsListening(true);
//   // };

//   const stopAllActivities = () => {
//     if (audioRef.current) {
//       audioRef.current.pause();
//       audioRef.current.currentTime = 0;
//     }
//     if (speechRecognitionRef.current) {
//       speechRecognitionRef.current.stop();
//       speechRecognitionRef.current = null;
//     }
//     setIsListening(false);
//     setShowAnimation(false);
//     startSpeechRecognition();
//   };

//   const startSpeechRecognition = () => {
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     const recognition = new SpeechRecognition();
//     recognition.lang = 'en-US';
//     recognition.interimResults = true;
//     recognition.maxAlternatives = 1;

//     recognition.onresult = (event) => {
//       const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
//       if (transcript.includes("stop")) {
//         stopAllActivities();
//         return;
//       }
//       if (event.results[event.results.length - 1].isFinal) {
//         setTranscription(transcript);
//         handleSend(transcript);
//       }
//     };

//     recognition.onspeechend = () => {
//       recognition.stop();
//       setIsListening(false);
//     };

//     recognition.onerror = (event) => {
//       console.error('Speech Recognition Error:', event.error);
//     };

//     recognition.start();
//     speechRecognitionRef.current = recognition;
//     setIsListening(true);
//   };
//   const stopSpeaking = () => {
//     if (audioRef.current) {
//       audioRef.current.pause();
//       audioRef.current.currentTime = 0;
//       // setShowAnimation(false);
//     }
//     if (speechRecognitionRef.current) {
//       speechRecognitionRef.current.stop();
//       speechRecognitionRef.current = null;
//     }
//     setIsListening(false);
//     // startSpeechRecognition();  
//     setShowAnimation(false);
//   };

//   const handleSend = (text = inputText) => {
//     addToChat(text, 'question');
//     setInputText('');
//     audioRef.current.play();
//     const payload = {
//       text: text,
//       LLM: LLM
//     };

//     fetch(`http://127.0.0.1:8000/pro/add/`, {
//     // fetch(`https://chatpro-algohype.replit.app/pro/add/`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(payload),
//     })
//     .then(response => response.json())
//     .then(data => {
//       console.log("data",data);
//       // console.log("answer",data.data1.AI_text)
//       const answer = data.data1[0].AI_text;
//       // console.log(an);
//       addToChat(answer, 'answer');
//       speakAnswer(answer);
//       setTimeout(() => {
//         audioRef.current.play();
//       }, 500);
//     })
//     .catch((error) => {
//       console.error('Error with the send function:', error);
//     });
//   };

//   const playSound = () => {
//     audioRef.current.play()
//       .then(() => {
//         console.log('Playing audio');
//       })
//       .catch((error) => {
//         console.error('Error playing the audio file:', error);
//       });
//   };
//   const speakAnswer = (answer) => {
    
//     const apiKey = `80227c64d72f358ec09c807552e29a6f`;
//     const voiceId = `dDOTNmkm9Bfx81UeUGnU`;

//     const options = {
//       method: 'POST',
//       headers: {
//         'Accept': 'audio/mpeg',
//         'Content-Type': 'application/json',
//         'xi-api-key': apiKey
//       },
//       body: JSON.stringify({
//         text: answer,
//         model_id: 'eleven_turbo_v2',
//         voice_settings: {
//           stability: 0.75,
//           similarity_boost: 0.75
//         }
//       })
//     };

//     fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, options)
//       .then(response => response.blob())
//       .then(audioBlob => {
//         setShowAnimation(true);
//         const audioUrl = URL.createObjectURL(audioBlob);
//         audioRef.current.src = audioUrl;
//         audioRef.current.play();
//         audioRef.current.onended = () => {
//           setShowAnimation(false);
//           startSpeechRecognition(); 
//         };
//       })
//       .catch(error => {
//         console.error('Fetch error:', error);
//         setShowAnimation(false);
//       });
//   };





//   return (
//     <div className="main-container bg-gray-900 text-white h-screen flex">
//       <aside className="sidebar w-64 bg-gray-800 p-4">
//         <select className="model-selector block w-full p-2 mb-4 bg-gray-700 text-white border border-gray-600 rounded" value={LLM} onChange={(e) => setModel(e.target.value)}>
//           <option value="gpt-3.5-turbo">GPT-3.5-turbo</option>
//           <option value="gpt-4">GPT-4</option>
//           <option value="claude-sonneT">Claude-sonne</option>
//           <option value="claude-opus">Claude-opus</option>
//           <option value="google-gemini">Gemini</option>
//           <option value="llama3-groq">LlAMA-3-groq</option>
//         </select>

//         <a href="https://promptsmith.co/" target="_blank" rel="noopener noreferrer">
//     <img
//       src="https://croo-json-files.s3.ap-south-1.amazonaws.com/__screenshots_json/logorpomptsmith.png"  
//       alt="Description of the image"           
//       className="mt-10 ml-12"                          
//       style={{ width: '100px', height: 'auto', display: 'block' }}
//     />
//   </a>
        
//         <div className='mt-60'>
//         <button className="clear-button ml-8 mt-10 px-8 py-4 rounded bg-red-500 text-white" onClick={clearChatHistory}>
//           <FaTrash />
//         </button>
//         <button className="stop-button ml-5  px-8 py-4 rounded bg-red-500 text-white" onClick={stopSpeaking}>
//             <FaStop />
//           </button>
//         </div>
//          <button className="send-button ml-20 mt-10  px-8 py-4 rounded bg-blue-500 text-white" onClick={() => handleSend()}>
//             <FaPaperPlane />
//           </button>
          
//       </aside>  
//       <section className="chat-container flex-grow flex flex-col p-4 ">
//         <div className="chat-display overflow-y-auto mb-4 flex-grow">
//           {chatHistory.map((chat, index) => (
//             <div key={index} className={`chat-message ${chat.type === 'question' ? 'justify-end' : 'justify-start'} flex mb-2`}>
//               {chat.type === 'question' ? (
//                 <>
//                   <p className="text-lg bg-blue-500 text-white p-2 rounded-lg max-w-sm">{chat.text}</p>
//                   <img src="https://croo-json-files.s3.ap-south-1.amazonaws.com/__screenshots_json/user2.png" alt="User" className="w-8 h-8 ml-2" />
//                 </>
//               ) : (
//                 <>
//                   <img src="https://croo-json-files.s3.ap-south-1.amazonaws.com/__screenshots_json/bot.png" alt="AI" className="w-8 h-8 mr-2" />
//                   <p className="text-lg bg-gray-700 text-white p-2 rounded-lg max-w-sm">{chat.text}</p>
//                 </>
//               )}
//             </div>
//           ))}
//           <div ref={chatEndRef} /> 
//         </div>
//         <div className="input-area flex items-center">
//           <input
//             type="text"
//             className="search-bar flex-grow mr-2 p-2 bg-gray-700 border border-gray-600 rounded"
//             placeholder="Type here..."
//             value={inputText}
//             onChange={(e) => setInputText(e.target.value)}
//             onKeyPress={(e) => {
//               if (e.key === 'Enter') {
//                 handleSend();
//               }
//             }}
//           />
//           <button className={`mic-button px-8 py-6 rounded text-white ${isListening ? 'bg-red-500' : 'bg-green-500'}`} onClick={startSpeechRecognition}>
//             <FaMicrophone />
//           </button>
//           {/* <button className="send-button ml-2 px-4 py-2 rounded bg-blue-500 text-white" onClick={() => handleSend()}>
//             <FaPaperPlane />
//           </button> */}
          
//           {isListening && <div className="voice-bars">
//             <div className="bar"></div>
//             <div className="bar"></div>
//             <div className="bar"></div>
//             <div className="bar"></div>
//             <div className="bar"></div>
//           </div>}
//         </div>
//         {showAnimation && (
//           <div className="animation-overlay">
//             <div className="animation-container">
//               <div className="speaking-animation">
//                 <div className="animation-circle"></div>
//                 <div className="animation-circle"></div>
//                 <div className="animation-circle"></div>
//               </div>
//             </div>
//           </div>
//         )}
//       </section>
//     </div>
//   );
// };