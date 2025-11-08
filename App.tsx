import React, { useState, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { CameraFeed } from './components/ImageUploader';
import { CareVisionReportDisplay } from './components/SurveillanceReport';
import { VideocamIcon, VideocamOffIcon, SpinnerIcon } from './components/IconComponents';
import { generateCareVisionReport } from './services/geminiService';
import { CareVisionReport, AppStatus, EmotionEvent } from './types';

const FRAME_CAPTURE_INTERVAL = 10000; // Analyze every 10 seconds
const JPEG_QUALITY = 0.8;

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [report, setReport] = useState<CareVisionReport | null>(null);
  const [history, setHistory] = useState<EmotionEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);

  const stopMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStatus(AppStatus.IDLE);
    setIsProcessing(false);
  }, []);

  const analyzeFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;

    setIsProcessing(true);
    setError(null);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (!context) {
        setError('Could not get canvas context.');
        setIsProcessing(false);
        return;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const base64Image = canvas.toDataURL('image/jpeg', JPEG_QUALITY).split(',')[1];
    
    try {
      const newReport = await generateCareVisionReport(base64Image, 'image/jpeg');
      setReport(newReport);
      const newEvent: EmotionEvent = {
        timestamp: new Date().toLocaleTimeString(),
        emotion: newReport.emotion,
        motion: newReport.motion,
        summary: newReport.summary,
      };
      setHistory(prev => [newEvent, ...prev].slice(0, 10)); // Keep last 10 events
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during analysis.');
      setStatus(AppStatus.ERROR);
      stopMonitoring();
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, stopMonitoring]);

  const startMonitoring = useCallback(async () => {
    if (status === AppStatus.MONITORING) return;

    setStatus(AppStatus.MONITORING);
    setReport(null);
    setError(null);
    setHistory([]);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setTimeout(() => {
                analyzeFrame();
                intervalRef.current = window.setInterval(analyzeFrame, FRAME_CAPTURE_INTERVAL);
            }, 500);
        };
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      setError("Camera access is required. Please enable permissions and try again.");
      setStatus(AppStatus.ERROR);
    }
  }, [status, analyzeFrame]);

  const handleToggleMonitoring = () => {
    if (status === AppStatus.MONITORING) {
      stopMonitoring();
    } else {
      startMonitoring();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-sans antialiased">
      <canvas ref={canvasRef} className="hidden" />
      <div className="relative flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto p-4 md:p-8 flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/2 flex flex-col gap-6">
            <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-6 shadow-2xl shadow-cyan-500/10 backdrop-blur-sm">
              <h2 className="flex items-center gap-3 text-2xl font-semibold text-cyan-400 mb-4">
                <VideocamIcon />
                <span>Live Feed</span>
              </h2>
              <CameraFeed videoRef={videoRef} isMonitoring={status === AppStatus.MONITORING} />
            </div>
            <button
              onClick={handleToggleMonitoring}
              disabled={isProcessing}
              className={`w-full flex items-center justify-center gap-3 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:shadow-none focus:outline-none focus:ring-4 ${
                status === AppStatus.MONITORING 
                  ? 'bg-red-600 hover:bg-red-500 focus:ring-red-500/50' 
                  : 'bg-cyan-600 hover:bg-cyan-500 focus:ring-cyan-500/50'
              }`}
            >
              {isProcessing ? <SpinnerIcon className="h-6 w-6" /> : (status === AppStatus.MONITORING ? <VideocamOffIcon /> : <VideocamIcon />)}
              {isProcessing ? 'ANALYZING...' : (status === AppStatus.MONITORING ? 'STOP MONITORING' : 'START MONITORING')}
            </button>
          </div>
          <div className="lg:w-1/2 flex-grow flex flex-col">
            <CareVisionReportDisplay status={status} report={report} error={error} history={history} isProcessing={isProcessing} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;