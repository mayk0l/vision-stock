function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-auto transform hover:scale-105 transition-transform duration-300">
        <h1 className="text-3xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          Prueba de Tailwind CSS
        </h1>

        <div className="space-y-4">
          <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-lg hover:bg-blue-100 transition-colors">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">✓</span>
            </div>
            <p className="text-gray-700">Gradientes y Hover Effects</p>
          </div>

          <div className="flex items-center gap-4 bg-purple-50 p-4 rounded-lg hover:bg-purple-100 transition-colors">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">⚡</span>
            </div>
            <p className="text-gray-700">Flexbox y Spacing</p>
          </div>

          <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:opacity-90 transform hover:-translate-y-0.5 transition-all">
            Botón con Efectos
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
