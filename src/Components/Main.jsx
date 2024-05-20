import React, { useState, useRef, useEffect } from "react";
import {
  FaMicrophone,
  FaPaperPlane,
  FaTrash,
  FaStop,
  FaTimes,
  FaBars,
} from "react-icons/fa";
import "../styles/Components.css";
import { Sidebar } from "./Sidebar";
import openbook from "../heroimages/openbook.svg";
import arrowcirclebrokenright from "../heroimages/arrow-circle-broken-right.svg";
import ellipse from "../heroimages/Ellipse 93.svg";
import tool from "../heroimages/tool-01.svg";
import microphone from "../heroimages/microphone-01.svg";

export const Main = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [showAnimation, setShowAnimation] = useState(false);
  const [LLM, setModel] = useState("google-gemini");
  const [inputText, setInputText] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const beepAudioRef = useRef(
    new Audio(
      "https://file.notion.so/f/f/d63da4d3-2abc-444e-8eab-6e3acc166743/1b0e0826-4588-4fd4-83ac-bcca2fbb6c28/clickti_-_3.mp3?id=87b35fc2-1d96-4eef-9b23-db2cc6e72fb1&table=block&spaceId=d63da4d3-2abc-444e-8eab-6e3acc166743&expirationTimestamp=1716285600000&signature=hKYAjMFaiKhUpQYCK2UhDdL8cem-ZmxbprEiktiQEAo"
    )
  );
  const beepAudioRef2 = useRef(
    new Audio(
      "https://file.notion.so/f/f/d63da4d3-2abc-444e-8eab-6e3acc166743/b61a9ecf-7160-4f55-8c55-c562525716d0/Tech_Message.mp3?id=979953c8-6948-4b02-b495-2741e3f5b710&table=block&spaceId=d63da4d3-2abc-444e-8eab-6e3acc166743&expirationTimestamp=1716285600000&signature=xWN1af9cear2u1_0EI6m4rFGIFc2TG_padGJjQp-Hxg"
    )
  );
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
    if (
      type === "question" &&
      chatHistory.length > 0 &&
      chatHistory[chatHistory.length - 1].text === message
    ) {
      return;
    }
    setChatHistory((chatHistory) => [...chatHistory, { text: message, type }]);
    if (!chatStarted) setChatStarted(true);
  };

  const clearChatHistory = () => {
    setChatHistory([]);
    setChatStarted(false);
  };
  const startNewChat = () => {
    setChatHistory([]); // Clears the chat history
    setChatStarted(false); // Resets the chat started flag
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript
        .trim()
        .toLowerCase();
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
      console.error("Speech Recognition Error:", event.error);
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
    addToChat(text, "question");
    setInputText("");
    const payload = {
      text: text,
      LLM: LLM,
    };

    fetch(`${process.env.backendURL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        beepAudioRef2.current.play();
        console.log("audio_content", data.audio_content);
        console.log("data", data);
        const answer = data.data[3];
        addToChat(answer, "answer");

        if (isSpeech) {
          const audioSrc = `data:audio/wav;base64,${data.audio_content}`;
          const audio = new Audio(audioSrc);
          audio.play();

          setShowAnimation(true);
          audio.onended = () => {
            setShowAnimation(false);
            startSpeechRecognition();
          };
        }
      })
      .catch((error) => {
        console.error("Error with the send function:", error);
      });
  };


  const data = [
    {
      title: "Story",
      description:
        "Generate a story from the given prompt. Generate a story from the given prompt.Generate a story from the given prompt.",
    },
    {
      title: "Adventure",
      description:
        "Create an adventure story based on your input. Create an adventure story based on your input.",
    },
    {
      title: "Adventure",
      description:
        "Create an adventure story based on your input. Create an adventure story based on your input.",
    },
  ];

  return (
    <>
      <Sidebar startNewChat={startNewChat} />
      <div className="main-container">
        {!chatStarted && (
          <div className="inbuilt-prompt">
            {data.map((item, index) => (
              <div key={index} className="inbuilt-prompt-div">
                <div className="book-icon-div">
                  <img
                    className="openbook-icn"
                    src={openbook}
                    alt="openbook_image"
                  />
                </div>
                <p className="book-story">{item.title}</p>
                <p className="book-story-para">{item.description}</p>
                <img
                  className="arrowcirclebrokenright"
                  src={arrowcirclebrokenright}
                  alt="arrowcirclebrokenright_image"
                />
              </div>
            ))}
          </div>
        )}

        <div className="chat-container">
          {chatHistory.map((chat, index) => (
            <div
              key={index}
              className={
                chat.type === "question" ? "input-query" : "chat-response"
              }
              style={{
                backgroundColor:
                  chat.type === "question" ? "#424242" : "#242424",
              }}
            >
              <p>{chat.text}</p>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="input-wrapper">
          <input
            className="input-box"
            type="text"
            placeholder="Type here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSend();
              }
            }}
          />
          <div className="icons-container">
            <img
              src={ellipse}
              alt="Settings"
              className="input-icon"
              onClick={clearChatHistory}
            />
            <div className="dropdown-container">
              <img
                src={tool}
                alt="Tool"
                className="input-icon"
                onClick={() => setShowDropdown(!showDropdown)}
              />
              {showDropdown && (
                <div className="dropdown">
                  <select
                    value={LLM}
                    onChange={(e) => setModel(e.target.value)}
                  >
                    <option value="gpt-3.5-turbo">GPT-3.5-turbo</option>
                    <option value="gpt-4">GPT-4</option>
                    <option value="claude-sonneT">Claude-sonne</option>
                    <option value="claude-opus">Claude-opus</option>
                    <option value="google-gemini">Gemini</option>
                    <option value="llama3-groq">LlAMA-3-groq</option>
                  </select>
                </div>
              )}
            </div>
            <img
              src={microphone}
              alt="Microphone"
              className="input-icon"
              onClick={startSpeechRecognition}
            />
          </div>
          <img
            src="https://s3-alpha-sig.figma.com/img/9ad7/2d2d/649a3f001361586c198c4722816c0ea8?Expires=1716768000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=CSgrJrHgcDpH7rC9bzPTT3BpM8tbUY7~vw8td2TPZczjLwF7eJfGc-RUVNQwoFMUl0~t1j5oSUeGjgpQnDIwFQTjbP83chT~brqeHhoKdp4~KUFW6uByEQWL3o6xCiRWfz46bntXldaOCeynnUJd8g2q35ENAZLzND4RB~Q7bBTTMuqcqQZAXvcW2nr1G5O6msI4SBybWrf~L5J14gfo1rwNMDkTiFlkxSe8NMbe9HlDhIYSZg6VsdhLCLdBop6rGyxQ2uv~ruYjyJrSPCMz-O4CA-Y1SRp9mapcqnZ3GZBFhVg8sdl86OR6VlyaSkkV31ZUVjrqrtdW8NOCAU12KA__"
            alt="Send"
            className="send-icon"
            onClick={handleSend}
          />
        </div>

        {isListening && (
          <div className="listening-animation">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        )}

        {showAnimation && (
          <div className="speaking-animation">
            <div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
