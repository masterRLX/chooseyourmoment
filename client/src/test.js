// src/components/NextScreen.js (최종 최적화 버전)
import React, { useState, useEffect, useCallback } from 'react';

// 이제 NextScreen은 App.js로부터 모든 것을 props로 전달받습니다.
function NextScreen({ paintingDetails, isLoading, error, onClose, onNextClick }) {
    const [isContentVisible, setIsContentVisible] = useState(false);

    // 새 그림이 로드될 때마다 content를 숨겼다가, 이미지 로드가 완료되면 다시 보여줍니다.
    useEffect(() => {
        setIsContentVisible(false);
    }, [paintingDetails]);
    
    const handleImageLoad = () => {
        setIsContentVisible(true);
    };

    const handleInfoIconClick = (e) => {
        e.stopPropagation();
        if (paintingDetails?.objectURL && paintingDetails.objectURL !== '#') {
            window.open(paintingDetails.objectURL, '_blank');
        }
    };

    const handleKeyDown = useCallback((event) => {
        if (['Escape', 'Backspace', 'ArrowLeft'].includes(event.key)) {
            event.preventDefault();
            onClose();
        }
    }, [onClose]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return (
        <div id="nextScreen" className={isContentVisible ? "active" : ""}>
            {isLoading && <p>명화 이미지를 로딩 중입니다...</p>}
            
            {error && <div style={{position: 'absolute', zIndex: 20, color: 'orange', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.7)', padding: '20px', borderRadius: '10px'}}>
                <p>{error}</p>
                <button onClick={onClose} style={{marginTop: '10px', padding: '8px 15px', cursor: 'pointer'}}>돌아가기</button>
            </div>}
            
            {paintingDetails && (
                <>
                    <button id="infoIcon" onClick={handleInfoIconClick} title="그림 정보 보기">i</button>
                    <div onClick={onNextClick} style={{ cursor: isLoading || error ? 'default' : 'pointer', width: '100%', height: '100%' }}>
                        <img
                            id="paintingImage"
                            key={paintingDetails.img} // key를 추가하여 src가 바뀔 때마다 img 태그를 새로 그리도록 함
                            alt={paintingDetails.title}
                            src={paintingDetails.img}
                            onLoad={handleImageLoad}
                            style={{
                                opacity: isContentVisible ? 1 : 0,
                                transition: 'opacity 0.5s ease-in-out' // 전환 속도 약간 빠르게
                            }}
                        />
                         <div id="paintingInfo" style={{
                            position: 'absolute',
                            bottom: '20px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            color: '#fff',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            padding: '5px 15px',
                            borderRadius: '15px',
                            textAlign: 'center',
                            textShadow: '0 0 5px rgba(0, 0, 0, 0.8)',
                            opacity: isContentVisible ? 1 : 0,
                            transition: 'opacity 0.5s ease-in-out'
                        }}>
                            {paintingDetails.title} - {paintingDetails.artist}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default NextScreen;