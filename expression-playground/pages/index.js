import React, { useRef, useState, useEffect } from 'react';

export default function Home() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const mountRef = useRef(true);
  const streamingRef = useRef(false);
  const captureIntervalRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [connected, setConnected] = useState(false);
  const [results, setResults] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    mountRef.current = true;
    return () => {
      mountRef.current = false;
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
        captureIntervalRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Keep a ref in sync to avoid stale closures inside intervals
  useEffect(() => {
    streamingRef.current = streaming;
  }, [streaming]);

  const connectToHume = () => {
    const apiKey = process.env.NEXT_PUBLIC_HUME_API_KEY;
    const proxyUrl = process.env.NEXT_PUBLIC_WS_URL;
    const socketUrl = apiKey
      ? `wss://api.hume.ai/v0/stream/models?apikey=${apiKey}`
      : proxyUrl || '';
    if (!socketUrl) {
      setStatus('Error: No API key or proxy URL set');
      return;
    }

    setStatus('Connecting to Hume...');
    
    const ws = new WebSocket(socketUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setStatus('Connected to Hume API');
      console.log('Connected to Hume WebSocket');
      // If webcam is already streaming, start capture immediately
      if (streamingRef.current) {
        startFrameCapture();
      }
    };

  ws.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data);
        console.log('Received from Hume:', response);
        
        if (response.face && response.face.predictions) {
          console.log('Face predictions found:', response.face.predictions.length, 'faces');
          setResults(response.face.predictions);
          setStatus('');
        } else if (response.error) {
          console.error('Hume API error:', response.error);
          setStatus(`Error: ${response.error}`);
        } else {
          console.log('Unexpected response format:', response);
        }
      } catch (e) {
        console.error('Failed to parse response:', e);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      setStatus('Disconnected from Hume API');
      console.log('WebSocket disconnected');
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
        captureIntervalRef.current = null;
      }
    };

    ws.onerror = (error) => {
      setStatus('WebSocket error');
      console.error('WebSocket error:', error);
    };
  };

  const startWebcam = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480 } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // Wait for video to be ready before setting streaming to true
          videoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded, setting streaming to true');
            setStreaming(true);
            streamingRef.current = true;
            
            // Connect to Hume and start frame capture
            connectToHume();
            // If already connected quickly, start immediately
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              startFrameCapture();
            }
          };
        }
      } catch (err) {
        setStatus(`Error accessing webcam: ${err.message}`);
      }
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setStreaming(false);
      streamingRef.current = false;
    }
    
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
    }
    
    setConnected(false);
    setResults(null);
    setStatus('');
  };

  const captureFrame = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.log('Cannot capture frame:', {
        video: !!video,
        canvas: !!canvas,
        ws: !!wsRef.current,
        wsReady: wsRef.current?.readyState === WebSocket.OPEN
      });
      return;
    }

    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    // Convert to blob and then to base64
    canvas.toBlob(async (blob) => {
      if (blob && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const base64Payload = await blobToBase64(blob);
          // Hume streaming expects { data: <base64>, models: { face: {} } }
          const request = {
            data: base64Payload,
            models: {
              face: {}
            }
          };
        
        console.log('Sending frame to Hume API...');
        wsRef.current.send(JSON.stringify(request));
      }
    }, 'image/jpeg', 0.8);
  };

  const startFrameCapture = () => {
    if (captureIntervalRef.current) {
      return; // already running
    }
    console.log('Starting frame capture... streaming:', streamingRef.current);
    captureIntervalRef.current = setInterval(() => {
      const isStreaming = streamingRef.current;
      const mounted = mountRef.current;
      console.log('Frame capture interval - streaming:', isStreaming, 'mounted:', mounted);
      if (isStreaming && mounted && wsRef.current?.readyState === WebSocket.OPEN) {
        captureFrame();
      } else if (!mounted || !isStreaming) {
        console.log('Stopping frame capture - streaming:', isStreaming, 'mounted:', mounted);
        clearInterval(captureIntervalRef.current);
        captureIntervalRef.current = null;
      }
    }, 2000); // Capture every 2 seconds to be less aggressive
  };

  // Helper function to convert blob to base64 payload (no data URL header)
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const result = reader.result;
          if (typeof result === 'string') {
            const [, payload] = result.split(',');
            resolve(payload || '');
          } else {
            reject(new Error('Unexpected reader result type'));
          }
        } catch (e) {
          reject(e);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const formatEmotions = (predictions) => {
    if (!predictions || predictions.length === 0) return 'No faces detected';
    
    const face = predictions[0];
    if (!face.emotions || face.emotions.length === 0) return 'No emotions detected';
    
    // Get top 5 emotions
    const topEmotions = face.emotions
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(emotion => `${emotion.name}: ${(emotion.score * 100).toFixed(1)}%`)
      .join('\n');
    
    return topEmotions;
  };

  return (
    <div style={{ textAlign: 'center', marginTop: 40, padding: 20 }}>
      <h1>Real-Time Expression Measurement Playground</h1>
      
      <div style={{ marginBottom: 20 }}>
        <p>Status: {status || (connected ? '🟢 Connected' : '🔴 Disconnected')}</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            width={480} 
            height={360} 
            style={{ border: '1px solid #ccc', borderRadius: 8 }} 
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          <div style={{ margin: 20 }}>
            {!streaming ? (
              <button 
                onClick={startWebcam}
                style={{ 
                  padding: '10px 20px', 
                  fontSize: 16, 
                  backgroundColor: '#007bff', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: 5,
                  cursor: 'pointer'
                }}
              >
                Turn On Webcam
              </button>
            ) : (
              <button 
                onClick={stopWebcam}
                style={{ 
                  padding: '10px 20px', 
                  fontSize: 16, 
                  backgroundColor: '#dc3545', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: 5,
                  cursor: 'pointer'
                }}
              >
                Turn Off Webcam
              </button>
            )}
          </div>
        </div>

        <div style={{ minWidth: 300, textAlign: 'left' }}>
          <h3>Expression Results</h3>
          <div style={{ 
            border: '1px solid #ccc', 
            borderRadius: 8, 
            padding: 15, 
            height: 360, 
            overflow: 'auto',
            backgroundColor: '#f8f9fa',
            fontFamily: 'monospace'
          }}>
            {results ? (
              <div>
                <div style={{ marginBottom: 10, color: 'green' }}>
                  ✅ Received {results.length} face(s)
                </div>
                <pre style={{ fontSize: 14, margin: 0, whiteSpace: 'pre-wrap' }}>
                  {formatEmotions(results)}
                </pre>
              </div>
            ) : (
              <div>
                <p style={{ color: '#666' }}>
                  {streaming ? 'Waiting for results...' : 'Turn on webcam to start'}
                </p>
                {streaming && connected && (
                  <p style={{ color: 'orange', fontSize: 12 }}>
                    📹 Webcam active, 🔗 Connected to Hume
                    <br />Check console for debug info
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
