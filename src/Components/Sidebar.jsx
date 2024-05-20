import React, { useState, useEffect } from 'react';
import menu_24px from '../heroimages/menu_24px.svg';
import add_icon from '../heroimages/add_icon.svg';
import user_image from '../heroimages/user-image.svg';
import setting from '../heroimages/setting-image.svg';
import "../styles/sidebar.css";
import axios from 'axios';

export const Sidebar = (props) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [history, setHistory] = useState([]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const fetchData = () => {
        axios.get("https://chatpro-algohype.replit.app/pro/gettim/")
          .then(response => {
            console.log('Data fetched successfully:', response.data);
            setHistory(response.data);
          })
          .catch(error => {
            console.error('Error fetching data:', error);
          });
    };

    const handleHistoryClick = (record) => {
        console.log(record.AI_text); 
    };

    // useEffect(() => {
    //     fetchData();
    // }, []);

    return (
        <div className='side-container'>
            <div className={isSidebarOpen ? 'side side-open' : 'side side-closed'}>
                <img className='hamburger' src={menu_24px} alt="Menu Icon" onClick={toggleSidebar}/>
                <div className='add_icon_div'>
                    <img className='add-icon' src={add_icon} alt="Add Icon" onClick={props.startNewChat} />
                </div>
                <div className='history-container'>
                    {history.map((item, index) =>
                        item.records.map((record, recordIndex) => (
                            <div key={`${index}-${recordIndex}`} className='history-item' onClick={() => handleHistoryClick(record)}>
                                {`History-${index + 1}-${recordIndex + 1}`}
                            </div>
                        ))
                    )}
                </div>
                <div className='fixed-icons'>
                    <img className='userimage' src={user_image} alt="User Icon" />
                    <img className='setting_image' src={setting} alt="Setting Icon" />
                </div>
            </div>
        </div>
    );
};
