// src/components/sales/NewSaleForm.js
import React, { useState } from 'react';
import ProductSelector from './ProductSelector';
import SaleDetails from './SaleDetails';

const NewSaleForm = ({
  products,
  customers,
  saleItems,
  selectedCustomer,
  comments,
  onSelectProduct,
  onUpdateQuantity,
  onRemoveItem,
  onSelectCustomer,
  onNewCustomer,
  onCommentsChange,
  onCompleteSale,
  loading,
  error
}) => {
  const [activeTab, setActiveTab] = useState('products'); // 'products' or 'cart'

  // For mobile, show tabs to switch between product selection and cart
  const renderMobileView = () => (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      {/* Tab navigation */}
      <div className="flex bg-dark-400 rounded-t-lg mb-1">
        <button
          className={`flex-1 py-3 text-center ${activeTab === 'products' ? 'bg-primary text-white' : 'text-gray-400'}`}
          onClick={() => setActiveTab('products')}
        >
          Select Products
        </button>
        <button
          className={`flex-1 py-3 text-center ${activeTab === 'cart' ? 'bg-primary text-white' : 'text-gray-400'} relative`}
          onClick={() => setActiveTab('cart')}
        >
          Cart
          {saleItems.length > 0 && (
            <span className="absolute top-1 right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {saleItems.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'products' ? (
          <ProductSelector 
            products={products}
            onSelectProduct={(product) => {
              onSelectProduct(product);
              // Optionally switch to cart view after adding a product
              // setActiveTab('cart');
            }}
          />
        ) : (
          <SaleDetails 
            saleItems={saleItems}
            onUpdateQuantity={onUpdateQuantity}
            onRemoveItem={onRemoveItem}
            onCompleteSale={onCompleteSale}
            customer={selectedCustomer}
            onSelectCustomer={onSelectCustomer}
            onNewCustomer={onNewCustomer}
            customers={customers}
            comments={comments}
            onCommentsChange={onCommentsChange}
          />
        )}
      </div>
    </div>
  );

  // Desktop view remains a side-by-side layout
  const renderDesktopView = () => (
    <div className="grid grid-cols-2 gap-6 h-[calc(100vh-120px)]">
      <ProductSelector 
        products={products}
        onSelectProduct={onSelectProduct}
      />
      <SaleDetails 
        saleItems={saleItems}
        onUpdateQuantity={onUpdateQuantity}
        onRemoveItem={onRemoveItem}
        onCompleteSale={onCompleteSale}
        customer={selectedCustomer}
        onSelectCustomer={onSelectCustomer}
        onNewCustomer={onNewCustomer}
        customers={customers}
        comments={comments}
        onCommentsChange={onCommentsChange}
      />
    </div>
  );

  return (
    <>
      {/* Mobile view */}
      <div className="md:hidden">
        {renderMobileView()}
      </div>
      
      {/* Desktop view */}
      <div className="hidden md:block">
        {renderDesktopView()}
      </div>
    </>
  );
};

export default NewSaleForm;