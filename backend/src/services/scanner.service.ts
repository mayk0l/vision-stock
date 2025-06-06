// Simulación de productos para testing
const mockProducts = [
  {
    productId: 'PRD001',
    name: 'Laptop HP Pavilion',
    confidence: 0.95
  },
  {
    productId: 'PRD002',
    name: 'Monitor Dell 27"',
    confidence: 0.88
  },
  {
    productId: 'PRD003',
    name: 'Teclado Mecánico RGB',
    confidence: 0.92
  }
];

export const mockProductDetection = async (imageBase64: string): Promise<{
  productId: string;
  name: string;
  confidence: number;
}> => {
  // Simular tiempo de procesamiento
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Retornar un producto aleatorio de la lista de mock
  const randomProduct = mockProducts[Math.floor(Math.random() * mockProducts.length)];
  
  return {
    ...randomProduct,
    // Variar un poco la confianza para simular diferentes detecciones
    confidence: randomProduct.confidence * (0.9 + Math.random() * 0.2)
  };
};
