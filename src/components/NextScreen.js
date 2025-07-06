import React, { useState, useEffect, useCallback, useRef } from 'react';

function NextScreen({ paintingDetails, isLoading, error, onClose, onNextClick }) {
    // 화면에 실제로 표시되는 그림을 관리하는 상태
    const [displayPainting, setDisplayPainting] = useState(null);
    // 페이드인/아웃 효과를 제어하는 상태
    const [isFading, setIsFading] = useState(false);
    
    const intervalRef = useRef(null);
    const transitionTimeoutRef = useRef(null);

    useEffect(() => {
        // 컴포넌트가 처음 마운트될 때, 초기 그림 데이터를 즉시 표시 상태로 설정
        if (paintingDetails && !displayPainting) {
            setDisplayPainting(paintingDetails);
            // 아주 잠깐의 딜레이 후 fade-in
            setTimeout(() => setIsFading(true), 50);
            return;
        }

        // 새로운 그림 데이터(prop)가 들어왔고, 현재 표시된 그림과 다를 때
        if (paintingDetails && displayPainting && paintingDetails.img_hq !== displayPainting.img_hq) {
            
            // 1. 현재 그림을 Fade-out 시킴
            setIsFading(false);

            // 2. Fade-out 애니메이션 시간(500ms) 후에 다음 작업을 진행
            if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
            transitionTimeoutRef.current = setTimeout(() => {
                // 3. 백그라운드에서 고화질 이미지 '유령 로딩' 시작
                const highResLoader = new Image();
                highResLoader.src = paintingDetails.img_hq;

                // 4. 로딩이 완료되면
                highResLoader.onload = () => {
                    // 5. 화면에 표시될 그림을 새 그림으로 교체하고
                    setDisplayPainting(paintingDetails);
                    // 6. ✨ 아주 잠깐의 틈을 준 뒤 fade-in 신호를 보냄 (애니메이션 스킵 방지)
                    setTimeout(() => {
                        setIsFading(true);
                    }, 50);
                };
                highResLoader.onerror = () => {
                    onNextClick();
                };
            }, 1500); // CSS transition 시간과 일치
        }
        
        return () => {
            if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
        };
    }, [paintingDetails, displayPainting, onNextClick]);
    
    // 1분 자동 전환 타이머
    useEffect(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (!error && displayPainting) {
            intervalRef.current = setInterval(() => {
                if (!isLoading) onNextClick();
            }, 60000);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [displayPainting, error, isLoading, onNextClick]);

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
        <div id="nextScreen">
            {isLoading && !displayPainting && <p>...LOADING...</p>}
            {error && <div style={{position: 'absolute', zIndex: 20, color: 'orange'}}><p>{error}</p></div>}
            
            {displayPainting && (
                <div 
                    onClick={() => { if (!isLoading && !error) onNextClick(); }} 
                    style={{ cursor: isLoading || error ? 'default' : 'pointer' }}
                >
                    <img
                        id="paintingImage"
                        alt={displayPainting.title}
                        src={displayPainting.img_hq}
                        style={{
                            opacity: isFading ? 1 : 0,
                            transition: 'opacity 1.5s ease-in-out'
                        }}
                    />
                     <div id="paintingInfo" style={{
                        opacity: isFading ? 1 : 0,
                        transition: 'opacity 1.5s ease-in-out'
                     }}>
                        {displayPainting.title} - {displayPainting.artist}
                    </div>
                    <button id="infoIcon" onClick={(e) => { e.stopPropagation(); if (displayPainting.objectURL) window.open(displayPainting.objectURL, '_blank'); }}>i</button>
                </div>
            )}
        </div>
    );
}

export default NextScreen;