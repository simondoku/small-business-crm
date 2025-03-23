// src/components/sales/NewSalesForm.js
import React from 'react';
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
  return (
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
};

export default NewSaleForm;