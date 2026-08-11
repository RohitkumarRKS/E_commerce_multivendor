import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Layout from './components/layout/Layout';

// Store Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductPage from './pages/ProductPage';
import SearchPage from './pages/SearchPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import NotFoundPage from './pages/NotFoundPage';

// Buyer Dashboard (Professional Sidebar Layout)
import BuyerLayout from './components/buyer/BuyerLayout';
import BuyerDashboardPage from './pages/buyer/BuyerDashboardPage';
import BuyerOrdersPage from './pages/buyer/BuyerOrdersPage';
import BuyerProfilePage from './pages/buyer/BuyerProfilePage';
import BuyerAddressesPage from './pages/buyer/BuyerAddressesPage';
import BuyerWishlistPage from './pages/buyer/BuyerWishlistPage';
import BuyerSettingsPage from './pages/buyer/BuyerSettingsPage';

// Seller Dashboard (Professional Sidebar Layout)
import SellerLayout from './components/seller/SellerLayout';
import SellerDashboardPage from './pages/seller/SellerDashboardPage';
import SellerProductsPage from './pages/seller/SellerProductsPage';
import SellerAddProductPage from './pages/seller/SellerAddProductPage';
import SellerOrdersPage from './pages/seller/SellerOrdersPage';
import SellerPromosPage from './pages/seller/SellerPromosPage';
import SellerReturnsPage from './pages/seller/SellerReturnsPage';
import SellerSettingsPage from './pages/seller/SellerSettingsPage';

// Admin (SuperAdmin) imports
import { AdminAuthProvider } from './admin/context/AdminAuthContext';
import AdminLayout from './admin/components/layout/AdminLayout';
import AdminLoginPage from './admin/pages/AdminLoginPage';
import DashboardPage from './admin/pages/DashboardPage';
import ProductsPage from './admin/pages/ProductsPage';
import CategoriesPage from './admin/pages/CategoriesPage';
import UsersPage from './admin/pages/UsersPage';
import OrdersPage from './admin/pages/OrdersPage';
import BannersPage from './admin/pages/BannersPage';
import BrandsPage from './admin/pages/BrandsPage';
import AdminPromosPage from './admin/pages/PromosPage';
import AdminReturnsPage from './admin/pages/ReturnsPage';
import EmailManagerPage from './admin/pages/EmailManagerPage';

import StoreCategoriesPage from './pages/CategoriesPage';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <CartProvider>
          <Routes>
            {/* Full-screen auth pages (no header/footer) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Main store with layout (header + footer) */}
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/categories" element={<StoreCategoriesPage />} />
              <Route path="/product/:slug" element={<ProductPage />} />
              <Route path="/product/:categorySlug/:slug" element={<ProductPage />} />
              <Route path="/category/:categorySlug/:slug" element={<ProductPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/category/:slug" element={<SearchPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Buyer Dashboard with professional sidebar layout */}
            <Route path="/buyer" element={<BuyerLayout />}>
              <Route path="dashboard" element={<BuyerDashboardPage />} />
              <Route path="orders" element={<BuyerOrdersPage />} />
              <Route path="profile" element={<BuyerProfilePage />} />
              <Route path="addresses" element={<BuyerAddressesPage />} />
              <Route path="wishlist" element={<BuyerWishlistPage />} />
              <Route path="settings" element={<BuyerSettingsPage />} />
            </Route>

            {/* Seller Dashboard with professional sidebar layout */}
            <Route path="/seller" element={<SellerLayout />}>
              <Route path="dashboard" element={<SellerDashboardPage />} />
              <Route path="products" element={<SellerProductsPage />} />
              <Route path="add-product" element={<SellerAddProductPage />} />
              <Route path="orders" element={<SellerOrdersPage />} />
              <Route path="returns" element={<SellerReturnsPage />} />
              <Route path="promos" element={<SellerPromosPage />} />
              <Route path="settings" element={<SellerSettingsPage />} />
            </Route>

            {/* SuperAdmin panel routes under /superadmin@2026 */}
            <Route path="/superadmin@2026/*" element={
              <AdminAuthProvider>
                <Routes>
                  <Route path="/login" element={<AdminLoginPage />} />
                  <Route element={<AdminLayout />}>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/banners" element={<BannersPage />} />
                    <Route path="/brands" element={<BrandsPage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/categories" element={<CategoriesPage />} />
                    <Route path="/users" element={<UsersPage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/returns" element={<AdminReturnsPage />} />
                    <Route path="/emails" element={<EmailManagerPage />} />
                    <Route path="/promos" element={<AdminPromosPage />} />
                  </Route>
                </Routes>
              </AdminAuthProvider>
            } />
          </Routes>

          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={true}
            newestOnTop={true}
            closeOnClick={true}
            pauseOnHover={true}
            theme="colored"
          />
          </CartProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
