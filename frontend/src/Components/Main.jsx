import React, { useState } from 'react';
import '../styles/Main.css'; 
import { FaMicrophone, FaPaperPlane, FaTrash } from 'react-icons/fa';

export const Main = () => {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [silenceTimer, setSilenceTimer] = useState(null);
  const [LLM, setModel] = useState('gpt-3.5-turbo');
  const [waitingForNextQuestion, setWaitingForNextQuestion] = useState(false);
  const [inputText, setInputText] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [showAnimation, setShowAnimation] = useState(false);

  const addToChat = (message, type) => {
    if (type === 'question' && chatHistory.length > 0 && chatHistory[chatHistory.length - 1].text === message) {
      return;
    }
    setChatHistory(chatHistory => [...chatHistory, { text: message, type }]);
  }
  const clearChatHistory = () => {
    setChatHistory([]);
  }

  const startRecording = async () => {
    if (!recording) {
      setWaitingForNextQuestion(false);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        let chunks = [];
        let silenceDetected = false;
  
        recorder.ondataavailable = e => {
          chunks.push(e.data);
          if (!silenceDetected) {
            silenceDetected = true;
            setSilenceTimer(setTimeout(() => {
              stopRecording();
              submitAudio(new Blob(chunks, { type: 'audio/mp3' }));
              chunks = [];
              silenceDetected = false;
            }, 2000));
          }
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
  
    fetch(`${process.env.lemonfoxAPI}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.lemonfoxTkoen}`
      },
      body: body
    })
    .then(response => response.json())
    .then(data => {
      setTranscription(data['text']);
      handleSend(data['text']);
    })
    .catch(error => {
      console.error('Error:', error);
    });
  };
  const handleSend = (text = inputText) => {
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
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Success:', data);
      const answer = data.data1[0].AI_text;
      addToChat(answer, 'answer');
      speakAnswer(answer);
      setWaitingForNextQuestion(true);
    })
    .catch((error) => {
      console.error('Error with the send function:', error);
    });
};


const speakAnswer = (answer) => {
  console.log("answer", answer);
  const apiKey = `${process.env.elevenLabsToken}`;
  const voiceId = `${process.env.elevenLabsvoiceID}`;

  setShowAnimation(true);

  const options = {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': apiKey
    },
    body: JSON.stringify({
      text: answer,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.75,
        similarity_boost: 0.75
      }
    })
  };

  fetch(`${process.env.elevenLabsApiUrl}${voiceId}/stream`, options)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.body;
    })
    .then(body => {
      const reader = body.getReader();
      const audioContext = new AudioContext();
      const mediaSource = new MediaSource();
      const url = URL.createObjectURL(mediaSource);
      const audio = new Audio(url);

      mediaSource.addEventListener('sourceopen', () => {
        const sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');
        sourceBuffer.mode = 'sequence';

        function appendToSourceBuffer({ done, value }) {
          if (done) {
            mediaSource.endOfStream();
            setShowAnimation(false);
            return;
          }
          if (sourceBuffer.updating) {
            return sourceBuffer.addEventListener('updateend', () => appendToSourceBuffer({ done, value }), { once: true });
          }
          sourceBuffer.appendBuffer(new Uint8Array(value));
        }

        reader.read().then(function processText({ done, value }) {
          appendToSourceBuffer({ done, value });
          if (!done) {
            reader.read().then(processText);
          }
        });
      });

      audio.addEventListener('error', (error) => {
        console.error('Audio error:', error);
        setShowAnimation(false);
      });

      audio.play();
    })
    .catch(error => {
      console.error('Error:', error);
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
    </aside>
    <section className="chat-container flex-grow flex flex-col p-4">
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
        <button className={`mic-button px-4 py-2 rounded text-white ${recording ? 'bg-red-500' : 'bg-green-500'}`} onClick={startRecording}>
          <FaMicrophone />
        </button>
        <button className="send-button ml-2 px-4 py-2 rounded bg-blue-500 text-white" onClick={() => handleSend()}>
          <FaPaperPlane />
        </button>
        <button className="clear-button ml-2 px-4 py-2 rounded bg-red-500 text-white" onClick={clearChatHistory}>
          <FaTrash />
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
  </div>
  );
};



