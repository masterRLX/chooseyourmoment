// src/App.js (다음 묶음 프리로딩 최종 버전)
import React, { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import Carousel from './components/Carousel';
import NextScreen from './components/NextScreen';

function App() {
  const [showNextScreen, setShowNextScreen] = useState(false);
  const [selectedPaintingData, setSelectedPaintingData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentBatch, setCurrentBatch] = useState([]);
  const [nextBatch, setNextBatch] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isFetchingNextBatch = useRef(false);

  const fetchPaintingBatch = useCallback(async (paintingData) => {
    if (!paintingData || !paintingData.emoji) return [];
    try {
      const response = await axios.get('http://localhost:8080/api/painting', {
        params: { emoji: paintingData.emoji }
      });
      return Array.isArray(response.data) ? response.data : [];
    } catch (err) {
      setError(err.response?.data?.error || "서버로부터 그림 묶음을 가져오지 못했습니다.");
      return [];
    }
  }, []);

  const preloadNextBatch = useCallback(async () => {
    if (!selectedPaintingData || isFetchingNextBatch.current) return;
    isFetchingNextBatch.current = true;
    const batch = await fetchPaintingBatch(selectedPaintingData);
    if (batch && batch.length > 0) {
      setNextBatch(batch);
    }
    isFetchingNextBatch.current = false;
  }, [selectedPaintingData, fetchPaintingBatch]);

  // ✨ 여기가 추가된 핵심 로직입니다 ✨
  // '다음 탄창(nextBatch)'이 준비되면, 그 즉시 '총알(이미지)'들을 미리 로딩합니다.
  useEffect(() => {
    if (nextBatch.length > 0) {
      console.log("Preloading images for the NEXT batch...");
      nextBatch.forEach(painting => {
        if (painting && painting.img_hq) {
          const imgLoader = new Image();
          imgLoader.src = painting.img_hq;
        }
      });
    }
  }, [nextBatch]);

  const handleEmojiSelectAndPreload = useCallback(async (paintingData) => {
    setSelectedPaintingData(paintingData);
    setIsLoading(true);
    setCurrentBatch([]); setNextBatch([]); setCurrentIndex(0); setError(null);
    const firstBatch = await fetchPaintingBatch(paintingData);
    if (firstBatch && firstBatch.length > 0) {
      setCurrentBatch(firstBatch);
      preloadNextBatch(); 
    } else {
      setError("이 이모지에 대한 그림을 찾을 수 없습니다.");
    }
    setIsLoading(false);
  }, [fetchPaintingBatch, preloadNextBatch]);

  const handleNextPainting = useCallback(() => {
    setCurrentIndex(prevIndex => prevIndex + 1);
  }, []);

  useEffect(() => {
    if (currentBatch.length > 0 && currentIndex >= currentBatch.length) {
      if (nextBatch.length > 0) {
        setCurrentBatch(nextBatch);
        setNextBatch([]);
        setCurrentIndex(0);
        preloadNextBatch();
      } else if (!isFetchingNextBatch.current) {
        preloadNextBatch();
      }
    }
  }, [currentIndex, currentBatch, nextBatch, preloadNextBatch]);

  const handleTransitionEnd = useCallback(() => { setShowNextScreen(true); }, []);
  const handleCloseNextScreen = useCallback(() => {
    setShowNextScreen(false);
    setSelectedPaintingData(null);
    setCurrentBatch([]); setNextBatch([]); setCurrentIndex(0); setError(null);
  }, []);

  return (
    <div className="App">
      {showNextScreen ? (
        <NextScreen 
          paintingDetails={currentBatch[currentIndex]}
          isLoading={isLoading && currentBatch.length === 0}
          error={error}
          onClose={handleCloseNextScreen}
          onNextClick={handleNextPainting}
          currentBatch={currentBatch}
          currentIndex={currentIndex}
        />
      ) : (
        <Carousel onEmojiSelect={handleEmojiSelectAndPreload} onTransitionEnd={handleTransitionEnd} />
      )}
    </div>
  );
}

export default App;