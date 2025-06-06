import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

interface ScanResult {
  productId: string;
  name: string;
  confidence: number;
}

interface ScannerState {
  status: 'idle' | 'requesting' | 'active' | 'error' | 'scanning';
  error?: string;
}

const ScannerPage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<ScannerState>({ status: 'idle' });
  const [result, setResult] = useState<ScanResult | null>(null);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const navigate = useNavigate();

  // Detectar iOS
  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);
  }, []);

  // Inicializar la cámara
  const initializeCamera = async () => {
    setState({ status: 'requesting' });    try {
      // Constraints específicos basados en el dispositivo
      const constraints: MediaStreamConstraints = {
        video: isIOS ? {
          // iOS: mantener constraints simples
          facingMode: 'environment'
        } : {
          // Otros navegadores: podemos usar más opciones
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        // En iOS, configurar los atributos antes del stream es crucial
        if (isIOS) {
          videoRef.current.setAttribute('playsinline', '');
          videoRef.current.setAttribute('webkit-playsinline', 'true');
        }
        
        // Safari iOS: Asignar stream después de configurar atributos
        videoRef.current.srcObject = stream;

        // Safari iOS: Esperar metadata y manejar play() adecuadamente
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) return reject();

          const loadedMetadata = () => {
            videoRef.current?.removeEventListener('loadedmetadata', loadedMetadata);
            // Safari iOS: Manejar la promesa de play() explícitamente
            videoRef.current?.play()
              .then(() => resolve())
              .catch((error) => {
                console.error('Error al reproducir video:', error);
                reject(error);
              });
          };

          videoRef.current.addEventListener('loadedmetadata', loadedMetadata);
        });

        setState({ status: 'active' });
      }
    } catch (error: any) {
      console.error('Error al acceder a la cámara:', error);
      setState({ 
        status: 'error', 
        error: 'No se pudo acceder a la cámara. Por favor, verifica los permisos.' 
      });
    }
  };

  // Capturar frame y enviar al backend
  const captureFrame = async () => {
    if (!videoRef.current || state.status !== 'active') return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.8);

    try {
      setState({ status: 'scanning' });
      const response = await fetch(`${API_URL}/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData }),
      });

      if (!response.ok) throw new Error('Error en la respuesta del servidor');
      
      const data = await response.json();
      setResult(data);
      setState({ status: 'active' });
    } catch (error) {
      setState({ 
        status: 'error', 
        error: 'Error al procesar la imagen. Intente nuevamente.' 
      });
    }
  };

  // Efecto para inicializar la cámara
  useEffect(() => {
    // initializeCamera();

    // Cleanup al desmontar
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Efecto para captura periódica
  useEffect(() => {
    if (state.status !== 'active') return;

    const interval = setInterval(captureFrame, 2000);
    return () => clearInterval(interval);
  }, [state.status]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900">Escanear Producto</h1>
          <button 
            onClick={() => navigate(-1)}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <span className="sr-only">Cerrar</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Video Preview o Botón de inicio */}
        <div className="relative aspect-[4/3] bg-black rounded-lg overflow-hidden">
          {state.status === 'idle' ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
              <p className="text-white mb-4">
                Para usar el escáner, necesitamos acceso a tu cámara
              </p>
              {/* Safari iOS: Botón simple que llama directamente a initializeCamera */}
              <button
                type="button"
                onClick={initializeCamera}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Permitir acceso a la cámara
              </button>
            </div>
          ) : (
            <>              <video
                ref={videoRef}
                playsInline
                muted
                controls={isIOS} // Mostrar controles en iOS puede ayudar con la reproducción
                className="absolute inset-0 w-full h-full object-cover"
              />
              
              {/* Estado del escáner */}
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                <div className="flex items-center justify-between text-white">
                  <span className="text-sm font-medium">
                    {state.status === 'requesting' && 'Solicitando acceso a la cámara...'}
                    {state.status === 'active' && 'Cámara activa - Escaneando...'}
                    {state.status === 'scanning' && 'Procesando imagen...'}
                    {state.status === 'error' && state.error}
                  </span>
                  {(state.status === 'active' || state.status === 'scanning') && (
                    <div className="animate-pulse w-3 h-3 rounded-full bg-green-500" />
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Resultado */}
        {result && (
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Producto Detectado
            </h2>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Nombre: <span className="font-medium text-gray-900">{result.name}</span>
              </p>
              <p className="text-sm text-gray-600">
                Confianza: <span className="font-medium text-gray-900">{(result.confidence * 100).toFixed(1)}%</span>
              </p>
            </div>
          </div>
        )}

        {/* Mensaje de error con botón de reintentar */}
        {state.status === 'error' && (
          <div className="text-center">
            <button
              onClick={() => {
                setState({ status: 'idle' });
                setResult(null);
              }}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Reintentar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScannerPage;
