export type OrderStatus =
  | "awaiting_payment" 
  | "payment_failed"
  | "pending"   
  | "preparing"  
  | "ready"      
  | "delivered"  
  | "cancelled"; 

export type PaymentMethod = "mpesa";

export type PaymentStatus =
  | "pending"    
  | "completed"  
  | "failed";    

export type OrderItem = {
  itemId:   string;   
  name:     string;  
  quantity: number;  
  price:    number; 
  imageUrl?: string;  

};


export type DeliveryDetails = {
  customerName:    string;
  customerPhone:   string;  
  deliveryAddress: string;
  deliveryNotes?:  string;  
};


export type Order = {
  id:             string;       
  customerId:     string;       
  customerName:   string;      
  customerEmail:  string;       
  delivery:       DeliveryDetails; 
  items:          OrderItem[];  
  paymentMethod:  PaymentMethod; 
  paymentStatus:  PaymentStatus; 
  mpesaReceiptNo?: string;       
  total:          number;      
  status:         OrderStatus;  
  createdAt?:     { seconds: number }; 
  updatedAt?:     { seconds: number }; 
                                       
};


export type CheckoutFormData = {
  customerName:    string;
  customerPhone:   string;
  deliveryAddress: string;
  deliveryNotes:   string;
};

export const EMPTY_CHECKOUT_FORM: CheckoutFormData = {
  customerName:    "",
  customerPhone:   "",
  deliveryAddress: "",
  deliveryNotes:   "",
};