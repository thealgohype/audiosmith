import React, { useState } from 'react';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

const TextToSpeech = () => {
  const [text, setText] = useState('');
  const [audioContent, setAudioContent] = useState(null);

  const synthesizeSpeech = async () => {
    const client = new TextToSpeechClient();

    const request = {
      input: { text },
      voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
      audioConfig: { audioEncoding: 'MP3' },
    };

    const [response] = await client.synthesizeSpeech(request);
    setAudioContent(response.audioContent);
  };

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
      />
      <button onClick={synthesizeSpeech}>Synthesize Speech</button>
      {audioContent && (
        <audio controls src={`data:audio/mp3;base64,${audioContent}`} />
      )}
    </div>
  );
};

export default TextToSpeech;