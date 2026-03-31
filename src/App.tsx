import { Landingpage } from './pages/landingpage';
import{ AdminDashboard } from './admin/adminDashboard';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import './App.css'
import { AuthProvider, useAuth } from './context/AuthContext';
import FullPageLoader from './components/fullpageLoader';
import ProtectedAdminRoutes from './helper/protectedRoute';
import { MenuPage } from './pages/menupage';
import { CategoryMenuPage } from './pages/categorymenupage';
import { CartProvider } from './context/cartContext';
import { CartPage } from './pages/cartPage';
import { CheckoutPage } from './pages/checkoutPage';
import { OrderConfirmationPage } from './pages/orderConfirmationPage';
import { CustomerOrdersPage } from './pages/customerorderpage';
import { AboutPage } from './pages/about';
import { ScrollToTop } from './components/scrollToTop';



const AuthRedirect = () => {
  const { user, role, loading } = useAuth();
  
  if (loading) return <FullPageLoader />;

  if(user && role === "admin") {
    return <Navigate to="/admin" replace />;    
  }
  return <Landingpage />;
}
function App() {
  return (
    <AuthProvider>
      <CartProvider>  
       <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<AuthRedirect />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/menu/:categoryId" element={<CategoryMenuPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
          <Route path="/orders" element={<CustomerOrdersPage />} />
          {/*Hidden admin route - only admins see it */}
          <Route path='/admin' element={
                    <ProtectedAdminRoutes>
                        <AdminDashboard />
                    </ProtectedAdminRoutes>}>
            </Route>
        </Routes>
      </Router>  
    </CartProvider>
 </AuthProvider>
  )
}

export default App
