import React from 'react';
import '../../styles/loader.css';

const Loading = (props) => {
    const { 
        fullPage = false, // Set to true to center on the entire screen
        style = {} 
    } = props;

    const containerStyle = fullPage ? {
        position: 'fixed',
        inset: 0,
        background: 'rgba(5, 5, 10, 0.95)',
        zIndex: 99999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        ...style
    } : {
        ...style
    };

    return (
        <div className={fullPage ? "" : "loader-container"} style={containerStyle}>
            <div className="loader">
                <span></span>
            </div>
        </div>
    );
};

export default Loading;
