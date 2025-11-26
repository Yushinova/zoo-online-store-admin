'use client';
import { useState } from 'react';
import ImageUploader from '@/components/imageUpload/ImageUpoad';

export default function NewProduct() {
  const [product, setProduct] = useState({
    name: '',
    price: '',
    description: '',
    images: []
  });

  const handleImagesChange = (images) => {
    setProduct(prev => ({
      ...prev,
      images: images
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Product data:', product);
    // Отправка данных в ASP.NET API
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ marginBottom: '30px' }}>Добавить новый товар</h1>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Название товара:
          </label>
          <input
            type="text"
            value={product.name}
            onChange={(e) => setProduct(prev => ({ ...prev, name: e.target.value }))}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '16px'
            }}
            required
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Изображения товара:
          </label>
          <ImageUploader 
            onImagesChange={handleImagesChange}
            maxFiles={8}
          />
        </div>

        <button
          type="submit"
          style={{
            background: '#3b82f6',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Создать товар
        </button>
      </form>
    </div>
  );
}