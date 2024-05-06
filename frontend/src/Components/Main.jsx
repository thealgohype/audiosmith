import React, { useState } from 'react';
import '../styles/Main.css'; // Ensure this CSS file includes the new styles

export const Main = () => {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [silenceTimer, setSilenceTimer] = useState(null);
  const [model, setModel] = useState('chatgpt');
  const [waitingForNextQuestion, setWaitingForNextQuestion] = useState(false);
  const [inputText, setInputText] = useState('');

  // ---------------------importing env variables ------------------------>>>
  const lemonfoxAPI = process.env.lemonfoxAPI
  const lemonfoxTkoen = process.env.lemonfoxTkoen
  const apiKey = process.env.elevenLabs;
  const voice = process.env.voiceID;

  const startRecording = async () => {
    if (!recording) {
      setWaitingForNextQuestion(false);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        let chunks = [];

        recorder.ondataavailable = e => {
          chunks.push(e.data);
          if (silenceTimer) clearTimeout(silenceTimer);
          setSilenceTimer(setTimeout(() => {
            stopRecording();
            submitAudio(new Blob(chunks, { type: 'audio/mp3' }));
            chunks = [];
          }, 2000));
        };

        recorder.onstop = async () => {
          setRecording(false);
        };

        recorder.start();
        setMediaRecorder(recorder);
        setRecording(true);
      } catch (error) {
        console.error('Error accessing the microphone:', error);
      }
    } else {
      stopRecording();
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
  };

  const submitAudio = (audioBlob) => {
    const body = new FormData();
    body.append('file', audioBlob);
    body.append("language", "english");
    body.append('response_format', 'json');

    fetch(`${lemonfoxAPI}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lemonfoxTkoen}`
      },
      body: body
    })
    .then(response => response.json())
    .then(data => {
      setTranscription(data['text']);
      handleResponse(data['text']);
    })
    .catch(error => {
      console.error('Error:', error);
    });
  };

  const handleResponse = (text) => {
    // Dummy response for testing
    const dummyResponse = `You asked: "${text}". This is a dummy response for testing purposes.`;

    fetch(`${process.env.elevenLabsApiUrl}${voice}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text: dummyResponse
      })
    })
    .then(response => response.blob())
    .then(blob => {
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audio.play();
      setWaitingForNextQuestion(true);
    })
    .catch(error => {
      console.error('Error:', error);
    });
  };

  return (
    <div className="main-container bg-gray-900 text-white h-screen flex">
      <aside className="sidebar w-64 bg-gray-800 p-4">
        <select className="model-selector block w-full p-2 mb-4 bg-gray-700 text-white border border-gray-600 rounded" value={model} onChange={(e) => setModel(e.target.value)}>
          <option value="gpt-3.5-turbo">GPT-3.5-turbo</option>
          <option value="gpt-4">GPT-4</option>
          <option value="claude-sonneT">Claude-sonne</option>
          <option value="claude-opus">Claude-opus</option>
          <option value="google-gemini">Gemini</option>
          <option value="llama3-groq">LlAMA-3-groq</option>
        </select>
      </aside>
      <section className="chat-container flex-grow flex flex-col p-4">
        <div className="chat-display overflow-y-auto mb-4 flex-grow">
          <p className="text-lg">{transcription}</p>
        </div>
        <div className="input-area flex items-center">
          <input type="text" className="search-bar flex-grow mr-2 p-2 bg-gray-700 border border-gray-600 rounded" placeholder="Type here..." value={inputText} onChange={(e) => setInputText(e.target.value)} />
          <button className={`mic-button px-4 py-2 rounded text-white ${recording ? 'bg-red-500' : 'bg-green-500'}`} onClick={startRecording}>
            {recording ? 'Stop' : 'Speak'}
          </button>
          <button className="send-button ml-2 px-4 py-2 rounded bg-blue-500 text-white" onClick={() => handleResponse(inputText)}>
            Send
          </button>
        </div>
        {recording && <div className="voice-bars">
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>}
      </section>
    </div>
  );
};


// -----------------------------------------second ------------------------------>>>>>
// import React, { useState } from 'react';
// import '../styles/Main.css'; // Ensure this CSS file includes the new styles

// export const Main = () => {
//   const [recording, setRecording] = useState(false);
//   const [mediaRecorder, setMediaRecorder] = useState(null);
//   const [transcription, setTranscription] = useState('');
//   const [silenceTimer, setSilenceTimer] = useState(null);
//   const [model, setModel] = useState('chatgpt');
//   const [waitingForNextQuestion, setWaitingForNextQuestion] = useState(false);
//   const [inputText, setInputText] = useState('');

//   const startRecording = async () => {
//     if (!recording) {
//       setWaitingForNextQuestion(false);
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//         const recorder = new MediaRecorder(stream);
//         let chunks = [];

//         recorder.ondataavailable = e => {
//           chunks.push(e.data);
//           if (silenceTimer) clearTimeout(silenceTimer);
//           setSilenceTimer(setTimeout(() => {
//             stopRecording();
//             submitAudio(new Blob(chunks, { type: 'audio/mp3' }));
//             chunks = [];
//           }, 2000));
//         };

//         recorder.onstop = async () => {
//           setRecording(false);
//         };

//         recorder.start();
//         setMediaRecorder(recorder);
//         setRecording(true);
//       } catch (error) {
//         console.error('Error accessing the microphone:', error);
//       }
//     } else {
//       stopRecording();
//     }
//   };

//   const stopRecording = () => {
//     if (mediaRecorder && mediaRecorder.state !== 'inactive') {
//       mediaRecorder.stop();
//     }
//   };

//   const submitAudio = (audioBlob) => {
//     const body = new FormData();
//     body.append('file', audioBlob);
//     body.append("language", "english");
//     body.append('response_format', 'json');

//     fetch('https://api.lemonfox.ai/v1/audio/transcriptions', {
//       method: 'POST',
//       headers: {
//         'Authorization': 'Bearer YxUl6ozyUIRZxIDnnFld8P8IhRGiiQoM'
//       },
//       body: body
//     })
//     .then(response => response.json())
//     .then(data => {
//       setTranscription(data['text']);
//       handleSend(data['text']);
//     })
//     .catch(error => {
//       console.error('Error:', error);
//     });
//   };

//   const handleSend = (text) => {
//     const payload = {
//       text: text,
//       model: model
//     };

//     // Send data to backend
//     fetch('YOUR_BACKEND_ENDPOINT', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(payload),
//     })
//     .then(response => response.json())
//     .then(data => {
//       console.log('Success:', data);
//       // Assuming the backend response contains the answer
//       const answer = data.answer;
//       // Speak the answer using a text-ot-speech API or library
//       speakAnswer(answer);
//       setWaitingForNextQuestion(true);
//     })
//     .catch((error) => {
//       console.error('Error:', error);
//     });
//   };

//   const speakAnswer = (answer) => {
//     const utterance = new SpeechSynthesisUtterance(answer);
//     utterance.onend = () => {
//       const nextQuestionPrompt = 'Next question, please.';
//       const nextQuestionUtterance = new SpeechSynthesisUtterance(nextQuestionPrompt);
//       window.speechSynthesis.speak(nextQuestionUtterance);
//     };
//     window.speechSynthesis.speak(utterance);
//   };

//   return (
//     <div className="main-container bg-gray-900 text-white h-screen flex">
//       <aside className="sidebar w-64 bg-gray-800 p-4">
//         <select className="model-selector block w-full p-2 mb-4 bg-gray-700 text-white border border-gray-600 rounded" value={model} onChange={(e) => setModel(e.target.value)}>
//           <option value="chatgpt">ChatGPT</option>
//           <option value="gemini">Gemini</option>
//           <option value="claude">Claude</option>
//           <option value="gpt4">GPT-4</option>
//         </select>
//       </aside>
//       <section className="chat-container flex-grow flex flex-col p-4">
//         <div className="chat-display overflow-y-auto mb-4 flex-grow">
//           <p className="text-lg">{transcription}</p>
//         </div>
//         <div className="input-area flex items-center">
//           <input type="text" className="search-bar flex-grow mr-2 p-2 bg-gray-700 border border-gray-600 rounded" placeholder="Type here..." value={inputText} onChange={(e) => setInputText(e.target.value)} />
//           <button className={`mic-button px-4 py-2 rounded text-white ${recording ? 'bg-red-500' : 'bg-green-500'}`} onClick={startRecording}>
//             {recording ? 'Stop' : 'Speak'}
//           </button>
//           <button className="send-button ml-2 px-4 py-2 rounded bg-blue-500 text-white" onClick={() => handleSend(inputText)}>
//             Send
//           </button>
//         </div>
//         {recording && <div className="voice-bars">
//           <div className="bar"></div>
//           <div className="bar"></div>
//           <div className="bar"></div>
//           <div className="bar"></div>
//           <div className="bar"></div>
//         </div>}
//       </section>
//     </div>
//   );
// };

// ------------------------------------first------------------------------>>>>>>>


// import React, { useState } from 'react';
// import '../styles/Main.css'; // Ensure this CSS file includes the new styles

// export const Main = () => {
//   const [recording, setRecording] = useState(false);
//   const [mediaRecorder, setMediaRecorder] = useState(null);
//   const [transcription, setTranscription] = useState('');
//   const [silenceTimer, setSilenceTimer] = useState(null);
//   const [model, setModel] = useState('chatgpt');
//   const [inputText, setInputText] = useState('');
//   const [waitingForNextQuestion, setWaitingForNextQuestion] = useState(false);

//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       const recorder = new MediaRecorder(stream);
//       let chunks = [];

//       recorder.ondataavailable = e => {
//         chunks.push(e.data);
//         if (silenceTimer) clearTimeout(silenceTimer);
//         setSilenceTimer(setTimeout(stopRecording, 2000));
//       };

//       recorder.onstop = async () => {
//         const blob = new Blob(chunks, { type: 'audio/mp3' });
//         chunks = [];
//         submitAudio(blob);
//       };

//       recorder.start();
//       setMediaRecorder(recorder);
//       setRecording(true);
//     } catch (error) {
//       console.error('Error accessing the microphone:', error);
//     }
//   };

//   const stopRecording = () => {
//     if (mediaRecorder && mediaRecorder.state !== 'inactive') {
//       mediaRecorder.stop();
//       setRecording(false);
//     }
//   };

//   const submitAudio = (audioBlob) => {
//     const body = new FormData();
//     body.append('file', audioBlob);
//     body.append("language","english")
//     body.append('response_format', 'json');

//     fetch('https://api.lemonfox.ai/v1/audio/transcriptions', {
//       method: 'POST',
//       headers: {
//         'Authorization': 'Bearer YxUl6ozyUIRZxIDnnFld8P8IhRGiiQoM'
//       },
//       body: body
//     })
//     .then(response => response.json())
//     .then(data => {
//       setTranscription(data['text']);
//     })
//     .catch(error => {
//       console.error('Error:', error);
//     });
//   };

//   const handleSend = () => {
//     const payload = {
//       text: inputText,
//       model: model
//     };

//     // <<<<-------------------Data send to backend ---------------->>>>
//     fetch('YOUR_BACKEND_ENDPOINT', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(payload),
//     })
//     .then(response => response.json())
//     .then(data => {
//       console.log('Success:', data);
//     })
//     .catch((error) => {
//       console.error('Error:', error);
//     });
//   };

//   return (
//     <div className="main-container bg-gray-900 text-white h-screen flex">
//       <aside className="sidebar w-64 bg-gray-800 p-4">
//         <select className="model-selector block w-full p-2 mb-4 bg-gray-700 text-white border border-gray-600 rounded" value={model} onChange={(e) => setModel(e.target.value)}>
//           <option value="chatgpt">ChatGPT</option>
//           <option value="gemini">Gemini</option>
//           <option value="claude">Claude</option>
//           <option value="gpt4">GPT-4</option>
//         </select>
//       </aside>
//       <section className="chat-container flex-grow flex flex-col p-4">
      
//         <div className="chat-display overflow-y-auto mb-4 flex-grow">
//           <p className="text-lg">{transcription}</p>
//         </div>
//         <div className="input-area flex items-center">
//           <input type="text" className="search-bar flex-grow mr-2 p-2 bg-gray-700 border border-gray-600 rounded" placeholder="Type here..." value={inputText} onChange={(e) => setInputText(e.target.value)} />
//           <button className={`mic-button px-4 py-2 rounded text-white ${recording ? 'bg-red-500' : 'bg-green-500'}`} onClick={recording ? stopRecording : startRecording}>
//             {recording ? 'Stop' : 'Speak'}
//           </button>
//           <button className="send-button ml-2 px-4 py-2 rounded bg-blue-500 text-white" onClick={handleSend}>
//             Send
//           </button>
//         </div>
//         {recording && <div className="voice-bars">
//           <div className="bar"></div>
//           <div className="bar"></div>
//           <div className="bar"></div>
//           <div className="bar"></div>
//           <div className="bar"></div>
//         </div>}
//       </section>
//     </div>
//   );
// };

