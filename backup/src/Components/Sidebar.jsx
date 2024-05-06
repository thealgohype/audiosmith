import React, { useEffect, useRef, useState } from 'react'
import { GoCheck } from "react-icons/go";

export const Sidebar = () => {
    const [mode, setMode] = useState('text');
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [aspectRatio, setAspectRatio] = useState('');
    const [uploadedImage, setUploadedImage] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [recognition, setRecognition] = useState(null);
    const textareaRef = useRef(null);
    const [showScrollButton, setShowScrollButton] = useState(false);
  
    const handleModeToggle = () => {
      setMode(mode === 'text' ? 'image' : 'text');
    };
  
    const handleOptionClick = (option) => {
      console.log("option",option);
      const index = selectedOptions.indexOf(option);
      if (index > -1) {
        setSelectedOptions(selectedOptions.filter((o) => o !== option));
      } else {
        setSelectedOptions([...selectedOptions, option]);
      }
    };
  
    const handleImageUpload = (e) => {
      const file = e.target.files[0];
      setUploadedImage(file);
    };
  
    const deleteUploadedImage = () => {
      setUploadedImage(null);
    };
  
    useEffect(() => {
      if (textareaRef.current) {
        const lineHeight = 24; 
        const maxLines = 5;
        const maxHeight = lineHeight * maxLines;
  
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`;
      }
    }, [searchText]);
  
    useEffect(() => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
  
      let finalTranscript = '';
  
      recognitionInstance.onresult = (event) => {
        let interimTranscript = '';
  
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
  
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
  
        setSearchText(finalTranscript + interimTranscript);
      };
  
      setRecognition(recognitionInstance);
    }, []);
    
  
    const startRecording = () => {
      setIsRecording(true);
      recognition.start();
      console.log('Recording started');
    };
  
    const stopRecording = () => {
      setIsRecording(false);
      recognition.stop();
      console.log('Recording stopped');
      console.log('Recorded speech:', searchText);
    };
  
    const handleMicClick = () => {
      if (!isRecording) {
        startRecording();
      } else {
        stopRecording();
      }
    };
  
    const sendImageToBackend = async () => {
      if (uploadedImage) {
        const formData = new FormData();
        formData.append('image', uploadedImage);
  
        try {
          const response = await fetch('http://localhost:3000/upload', {
            method: 'POST',
            body: formData,
          });
  
          if (response.ok) {
            console.log('Image uploaded successfully');
            setUploadedImage(null);
          } else {
            console.error('Image upload failed');
          }
        } catch (error) {
          console.error('Error uploading image:', error);
        }
      }
    };
  
    return (
      <div className="min-h-screen bg-gray-900 text-white">
      <h1 className="mr-2 text-xl font-semibold text-blue-400">Promptsmith</h1>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center mb-8">
          <span className="mr-4 text-lg font-semibold text-blue-400">Text</span>
          <div
            className={`w-12 h-6 flex items-center bg-gray-700 rounded-full p-1 cursor-pointer ${
              mode === 'image' ? 'bg-green-600' : ''
            }`}
            onClick={handleModeToggle}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                mode === 'image' ? 'translate-x-6' : ''
              }`}
            ></div>
          </div>
          <span className="ml-4 text-lg font-semibold text-blue-400">Image</span>
        </div>
  
        {mode === 'image' && (
          <div className="mb-8">
            <div className="flex flex-wrap">
              {['Style Reference', 'Art Movement', 'Aspect Ratio', 'Negative Prompts', 'Prompts'].map(
                (option) => (
                  <button
                    key={option}
                    className={`px-4 py-2 rounded-md mr-4 mb-4 ${
                      selectedOptions.includes(option)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-blue-400 border border-blue-400'
                    }`}
                    onClick={() => handleOptionClick(option)}
                  >
                    {selectedOptions.includes(option) &&  <GoCheck />}
                    {option}
                  </button>
                )
              )}
            </div>
            <input
              type="text"
              placeholder="Aspect Ratio"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="px-4 py-2 border border-gray-700 bg-gray-800 rounded-md w-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        )}
  
        <div className="relative flex items-center">
          <textarea
            ref={textareaRef}
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="px-4 py-2 pl-10 border border-gray-700 bg-gray-800 rounded-t-md w-full overflow-auto text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            style={{ minHeight: '40px', resize: 'none', maxHeight: '120px' }}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <label htmlFor="imageUpload" className="cursor-pointer mr-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-400 hover:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="imageUpload"
              />
            </label>
            <button
              className={`p-2 ${
                isRecording ? 'bg-red-600' : 'bg-blue-600'
              } text-white rounded-full cursor-pointer mr-2 focus:outline-none focus:ring-2 focus:ring-blue-600`}
              onClick={handleMicClick}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isRecording ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                )}
              </svg>
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-r-md cursor-pointer flex items-center focus:outline-none focus:ring-2 focus:ring-blue-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 5l7 7-7 7M5 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
  
        {uploadedImage && (
          <div className="mt-8 flex items-center">
            <img
              src={URL.createObjectURL(uploadedImage)}
              alt="Uploaded"
              className="max-w-xs h-auto mr-4 rounded-md shadow-md"
            />
            <button
              onClick={deleteUploadedImage}
              className="p-2 bg-red-600 text-white rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
    );
}







