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
  deleteProduct 
} from '../services/productService';

const Products = () => {
  const location = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  }, []);

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
        // Update existing product
        const updatedProduct = await updateProduct(productData._id, productData);
        setProducts(products.map(p => 
          p._id === updatedProduct._id ? updatedProduct : p
        ));
      } else {
        // Add new product
        const newProduct = await createProduct(productData);
        setProducts([...products, newProduct]);
      }
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
        setProducts(products.filter(p => p._id !== productId));
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

  return (
    <MainLayout 
      title="Products" 
      onAddNew={handleAddNew}
    >
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-xl text-gray-400">Loading products...</p>
        </div>
      ) : error ? (
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