import React, { useState, useEffect } from 'react';

export const Main = () => {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [spokenText, setSpokenText] = useState('');
  const [transcription, setTranscription] = useState('');
  const [silenceTimer, setSilenceTimer] = useState(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      let chunks = [];

      recorder.ondataavailable = e => {
        chunks.push(e.data);
        if (silenceTimer) clearTimeout(silenceTimer);
        setSilenceTimer(setTimeout(stopRecording, 2000)); // stops recording after 2 seconds of silence
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/mp3' });
        chunks = [];
        submitAudio(blob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
      setSpokenText('Recording...');
    } catch (error) {
      console.error('Error accessing the microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setRecording(false);
      setSpokenText('Stopped recording.');
      if (silenceTimer) clearTimeout(silenceTimer);
    }
  };

  const submitAudio = (audioBlob) => {
    const body = new FormData();
    body.append('file', audioBlob);
    body.append('language', 'english');
    body.append('response_format', 'json');

    fetch('https://api.lemonfox.ai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YxUl6ozyUIRZxIDnnFld8P8IhRGiiQoM'
      },
      body: body
    })
    .then(response => response.json())
    .then(data => {
      setTranscription(data['text']);
      setSpokenText(''); 
    })
    .catch(error => {
      console.error('Error:', error);
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
  <h1 className="text-3xl font-bold text-gray-800 mb-6">Main</h1>
  <button 
    className={`${
      recording ? 'bg-red-500 hover:bg-red-700' : 'bg-green-500 hover:bg-green-700'
    } transition-colors duration-300 ease-in-out transform hover:scale-110 text-white font-semibold px-6 py-3 rounded-full shadow-lg`}
    onClick={recording ? stopRecording : startRecording}
  >
    {recording ? 'Stop Recording' : 'Start Recording'}
  </button>
  <p className="text-lg text-gray-600 mt-4">{spokenText}</p>
  <h2 className="text-xl text-gray-800 mt-2">{transcription}</h2>
</div>

  );
};
