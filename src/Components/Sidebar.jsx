import React, { useState } from 'react'
import { FaMicrophone, FaPaperPlane, FaTrash, FaStop, FaTimes, FaBars } from 'react-icons/fa';
import menu_24px from '../heroimages/menu_24px.svg';
import add_icon from '../heroimages/add_icon.svg';
import user_image from '../heroimages/user-image.svg';
import setting from '../heroimages/setting-image.svg';

import "../styles/sidebar.css"
import "../styles/Components.css"

export const Sidebar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [chatHistory, setChatHistory] = useState([
        "Hello, how can I help you today?",
        "I'm looking for product support.",
        "Sure, I can assist you with that."
    ]);


    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Define CSS class based on sidebar state
    const sidebarClassName = isSidebarOpen ? 'side side-open' : 'side side-closed';
 
    return (
        <div className='side-container'>
            <button onClick={toggleSidebar}>
                <FaBars />
            </button>
            {isSidebarOpen && (
                <div className="chat-history">
                    {chatHistory.map((msg, index) => (
                        <div key={index} className="chat-message">{msg}</div>
                    ))}
                </div>
            )}
            

            <div className={sidebarClassName}>
                <img src={menu_24px} alt="Menu Icon" />
                <div className='add_icon_div'>
                    <img className='add-icon' src={add_icon} alt="add Icon" />
                </div>

                <div className='below-icons'>
                    <img className='userimage' src={user_image} alt="user-image" />
                    <img className='userimage' src={user_image} alt="user-image" />
                    <img className='setting_image' src={setting} alt="setting_image" />
                </div>
            </div>
        </div>
    );
};
