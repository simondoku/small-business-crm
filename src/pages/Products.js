// src/pages/Products.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProductList from '../components/products/ProductList';
import ProductForm from '../components/products/ProductForm';
import { 
  getProducts, 
  createProduct, 
  updateProduct,
  updateProductStock,
  deleteProduct 
} from '../services/productService';
import LoadingScreen from '../components/common/LoadingScreen';

const Products = () => {
  const location = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forceRefresh, setForceRefresh] = useState(0);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        setProducts(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, [forceRefresh]);

  // Check if we should show the form based on navigation state
  useEffect(() => {
    if (location.state?.showForm) {
      handleAddNew();
    }
  }, [location.state]);

  const handleAddNew = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleSave = async (productData) => {
    try {
      if (productData._id) {
        if ('stockAdjustment' in productData && productData.stockAdjustment !== 0) {
          // Handle stock adjustment
          await updateProductStock(productData._id, {
            adjustment: productData.stockAdjustment
          });
        } else {
          // Normal product update
          await updateProduct(productData._id, productData);
        }
      } else {
        // Add new product
        await createProduct(productData);
      }
      
      // Refresh product list
      setForceRefresh(prev => prev + 1);
      setShowForm(false);
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Failed to save product. Please try again.');
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
        setForceRefresh(prev => prev + 1);
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  if (loading) {
    return <LoadingScreen message="Loading products..." />;
  }

  return (
    <MainLayout 
      title="Products" 
      onAddNew={handleAddNew}
    >
      {error ? (
        <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-4 mb-4">
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <ProductList 
          products={products} 
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
      
      {showForm && (
        <ProductForm 
          product={editingProduct}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </MainLayout>
  );
};

export default Products;