import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as tf from '@tensorflow/tfjs';
import * as tmImage from '@teachablemachine/image';

const API_URL = import.meta.env.VITE_API_URL;
const MODEL_URL = '/model/model.json';

interface ScanResult {
  productId: string;
  name: string;
  confidence: number;
}

interface ScannerState {
  status: 'idle' | 'loading' | 'requesting' | 'active' | 'error' | 'scanning';
  error?: string;
}

// Mapeo de clases a nombres de productos
const productClasses: Record<string, string> = {
  'Class 1': 'Lisoform',
  'Class 2': 'Lemon Stones'
};

const ScannerPage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const modelRef = useRef<tmImage.CustomMobileNet | null>(null);
  const [state, setState] = useState<ScannerState>({ status: 'idle' });
  const [result, setResult] = useState<ScanResult | null>(null);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const navigate = useNavigate();

  // Cargar el modelo
  const loadModel = async () => {
    try {
      setState({ status: 'loading' });
      const model = await tmImage.load(MODEL_URL, '/model/metadata.json');
      modelRef.current = model;
      setState({ status: 'idle' });
    } catch (error) {
      console.error('Error al cargar el modelo:', error);
      setState({ 
        status: 'error', 
        error: 'Error al cargar el modelo de reconocimiento.' 
      });
    }
  };

  // Detectar iOS
  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);
    
    // Cargar el modelo al montar el componente
    loadModel();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Inicializar la cámara
  const initializeCamera = async () => {
    setState({ status: 'requesting' });
    try {
      const constraints: MediaStreamConstraints = {
        video: isIOS ? {
          facingMode: 'environment'
        } : {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        if (isIOS) {
          videoRef.current.setAttribute('playsinline', '');
          videoRef.current.setAttribute('webkit-playsinline', 'true');
        }
        
        videoRef.current.srcObject = stream;

        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) return reject();

          const loadedMetadata = () => {
            videoRef.current?.removeEventListener('loadedmetadata', loadedMetadata);
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

  // Procesar frame con el modelo
  const processFrame = async () => {
    if (!videoRef.current || !modelRef.current || state.status !== 'active') return;

    try {
      setState({ status: 'scanning' });
      
      // Realizar predicción con el modelo
      const predictions = await modelRef.current.predict(videoRef.current);
      
      // Encontrar la predicción con mayor confianza
      const bestPrediction = predictions.reduce((prev, current) => 
        current.probability > prev.probability ? current : prev
      );

      // Solo actualizar si la confianza es mayor al 70%
      if (bestPrediction.probability > 0.7) {
        setResult({
          productId: bestPrediction.className,
          name: productClasses[bestPrediction.className] || bestPrediction.className,
          confidence: bestPrediction.probability
        });
      }

      setState({ status: 'active' });
    } catch (error) {
      console.error('Error al procesar frame:', error);
      setState({ 
        status: 'error', 
        error: 'Error al procesar la imagen. Intente nuevamente.' 
      });
    }
  };

  // Efecto para captura periódica
  useEffect(() => {
    if (state.status !== 'active') return;

    const interval = setInterval(processFrame, 1000); // Procesar cada segundo
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

        {/* Estado de carga del modelo */}
        {state.status === 'loading' && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-700">Cargando modelo de reconocimiento...</p>
          </div>
        )}

        {/* Video Preview o Botón de inicio */}
        <div className="relative aspect-[4/3] bg-black rounded-lg overflow-hidden">
          {state.status === 'idle' ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
              <p className="text-white mb-4">
                Para usar el escáner, necesitamos acceso a tu cámara
              </p>
              <button
                type="button"
                onClick={initializeCamera}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Permitir acceso a la cámara
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                controls={isIOS}
                className="absolute inset-0 w-full h-full object-cover"
              />
              
              {/* Estado del escáner */}
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                <div className="flex items-center justify-between text-white">
                  <span className="text-sm font-medium">
                    {state.status === 'requesting' && 'Solicitando acceso a la cámara...'}
                    {state.status === 'active' && 'Cámara activa - Escaneando...'}
                    {state.status === 'scanning' && 'Analizando producto...'}
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
