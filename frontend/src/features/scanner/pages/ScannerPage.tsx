import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as tf from '@tensorflow/tfjs';

// Tipos para el estado y resultado
interface ScannerState {
  status: 'idle' | 'loading' | 'active' | 'error' | 'scanning';
  error?: string;
}

interface PredictionResult {
  className: string;
  confidence: number;
}

const CLASSES = ['lisoform', 'lemon stones'];
const MODEL_PATH = '/model/model.json';
const PREDICTION_INTERVAL = 1000; // 1 segundo entre predicciones

const ScannerPage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const modelRef = useRef<tf.LayersModel | null>(null);
  const [state, setState] = useState<ScannerState>({ status: 'idle' });
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const navigate = useNavigate();

  // Detectar iOS
  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);
  }, []);

  // Cargar el modelo
  useEffect(() => {
    const loadModel = async () => {
      try {
        setState({ status: 'loading' });
        // Cargar el modelo usando tf.loadLayersModel
        modelRef.current = await tf.loadLayersModel(MODEL_PATH);
        setState({ status: 'idle' });
      } catch (error) {
        console.error('Error loading model:', error);
        setState({ 
          status: 'error', 
          error: 'No se pudo cargar el modelo. Por favor, recarga la página.' 
        });
      }
    };

    loadModel();

    return () => {
      // Limpiar el modelo al desmontar
      if (modelRef.current) {
        modelRef.current.dispose();
      }
    };
  }, []);

  // Preprocesar imagen para el modelo
  const preprocessImage = async (image: HTMLVideoElement | HTMLImageElement): Promise<tf.Tensor> => {
    // Convertir la imagen a un tensor
    const tensor = tf.browser.fromPixels(image)
      .resizeNearestNeighbor([224, 224]) // Redimensionar a 224x224 (ajusta según tu modelo)
      .toFloat()
      .expandDims();
    
    // Normalizar valores a [-1, 1]
    return tensor.div(127.5).sub(1);
  };

  // Realizar predicción
  const predict = async (image: HTMLVideoElement | HTMLImageElement) => {
    if (!modelRef.current) return;

    try {
      // Preprocesar imagen
      const tensor = await preprocessImage(image);
      
      // Obtener predicción
      const predictions = await modelRef.current.predict(tensor) as tf.Tensor;
      const probabilities = await predictions.data();
      
      // Limpiar tensores
      tensor.dispose();
      predictions.dispose();

      // Obtener el índice de la clase con mayor probabilidad
      const maxIndex = probabilities.indexOf(Math.max(...Array.from(probabilities)));
      
      setPrediction({
        className: CLASSES[maxIndex],
        confidence: probabilities[maxIndex]
      });
    } catch (error) {
      console.error('Error making prediction:', error);
      setState({ 
        status: 'error', 
        error: 'Error al procesar la imagen' 
      });
    }
  };

  // Inicializar la cámara
  const initializeCamera = async () => {
    setState({ status: 'loading' });
    
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
              .catch(reject);
          };

          videoRef.current.addEventListener('loadedmetadata', loadedMetadata);
        });

        setState({ status: 'active' });
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setState({ 
        status: 'error', 
        error: 'No se pudo acceder a la cámara. Por favor, verifica los permisos.' 
      });
    }
  };

  // Efecto para predicciones periódicas
  useEffect(() => {
    if (state.status !== 'active' || !videoRef.current) return;

    const interval = setInterval(() => {
      if (videoRef.current && modelRef.current) {
        predict(videoRef.current);
      }
    }, PREDICTION_INTERVAL);

    return () => clearInterval(interval);
  }, [state.status]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900">Escáner de Productos</h1>
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

        {/* Video Preview */}
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
                    {state.status === 'loading' && 'Cargando...'}
                    {state.status === 'active' && 'Escaneando...'}
                    {state.status === 'error' && state.error}
                  </span>
                  {state.status === 'active' && (
                    <div className="animate-pulse w-3 h-3 rounded-full bg-green-500" />
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Resultado de la predicción */}
        {prediction && (
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Producto Detectado
            </h2>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Producto: <span className="font-medium text-gray-900">{prediction.className}</span>
              </p>
              <p className="text-sm text-gray-600">
                Confianza: <span className="font-medium text-gray-900">{(prediction.confidence * 100).toFixed(1)}%</span>
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
                setPrediction(null);
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

/* 
Cambios realizados:
1. Eliminada la dependencia de @teachablemachine/image
2. Implementada carga del modelo usando tf.loadLayersModel
3. Agregado preprocesamiento de imágenes usando operaciones de tensor
4. Implementada predicción directa usando el modelo de TensorFlow.js
5. Agregada limpieza de tensores para evitar memory leaks
6. Actualizada la interfaz para mostrar las clases específicas (lisoform y lemon stones)
7. Mantenida la compatibilidad con iOS y manejo de permisos de cámara
*/
