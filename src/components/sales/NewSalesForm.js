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
  error,
  focusMode
}) => {
  const [activeTab, setActiveTab] = useState('products'); // 'products' or 'cart'

  // For mobile, show tabs to switch between product selection and cart
  const renderMobileView = () => (
    <div className="h-[calc(100vh-160px)] flex flex-col">
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
              // In focus mode, switch to cart after adding a product
              if (focusMode) {
                setActiveTab('cart');
              }
            }}
            focusMode={focusMode}
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
            focusMode={focusMode}
          />
        )}
      </div>
    </div>
  );

  // Desktop view - focus mode changes layout to emphasize the active transaction
  const renderDesktopView = () => (
    <div className={`${focusMode ? 'grid-cols-3' : 'grid-cols-2'} grid gap-6 h-[calc(100vh-160px)]`}>
      <div className={focusMode ? 'col-span-1' : 'col-span-1'}>
        <ProductSelector 
          products={products}
          onSelectProduct={onSelectProduct}
          focusMode={focusMode}
        />
      </div>
      <div className={focusMode ? 'col-span-2' : 'col-span-1'}>
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
          focusMode={focusMode}
        />
      </div>
    </div>
  );

  return (
    <>
      {/* Focus mode indicator */}
      {focusMode && (
        <div className="mb-4 bg-primary bg-opacity-10 border border-primary rounded-lg p-4 flex items-center animate-pulse">
          <span className="mr-2 h-3 w-3 bg-primary rounded-full"></span>
          <p className="text-primary font-medium">Focus Mode Active - Streamlined for efficient transactions</p>
        </div>
      )}
      
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