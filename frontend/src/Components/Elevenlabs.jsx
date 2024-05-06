import React, { useState } from 'react';
import axios from 'axios';

const ElevenLabsTTS = () => {
  const [text, setText] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleConvertToSpeech = async () => {
    try {
      setIsLoading(true);
      const apiKey = process.env.elevenLabs;
      const voice_id = process.env.voiceID
      const elevenLabsApiUrl = process.env.elevenLabsApiUrl

      const headers = {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      };

      const data = {
        text: text,
        voice_id: voice_id,
      };

      const response = await axios.post(
        `${elevenLabsApiUrl}${voice_id}`,
        data,
        { headers, responseType: 'arraybuffer' }
      );

      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = () => {
    const audio = new Audio(audioUrl);
    audio.play();
  };

  return (
    <div>
      <textarea
        value={text}
        onChange={handleTextChange}
        placeholder="Enter text to convert to speech"
      />
      <button onClick={handleConvertToSpeech} disabled={isLoading}>
        {isLoading ? 'Converting...' : 'Convert to Speech'}
      </button>
      {audioUrl && (
        <div>
          <button onClick={handlePlayAudio}>Play Audio</button>
        </div>
      )}
    </div>
  );
};

export default ElevenLabsTTS;