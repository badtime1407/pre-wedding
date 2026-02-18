import { createRouter, createWebHistory } from 'vue-router'

import Home from '../Pages/index.vue'
import Booking from '../Pages/Booking.vue'
import Gallery from '../Pages/Gallery.vue'
import Login from '../Pages/Login.vue'
import Register from '../Pages/Register.vue'
import Resetpassword from '../Pages/Resetpassword.vue'
import Packages from '../Pages/Packages.vue'
import PackagespreWedding from '../Pages/Packagespre-wedding.vue'
import Admin from '../Pages/Admin.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/booking', component: Booking },
  { path: '/gallery', component: Gallery },
  { path: "/login", component: Login, meta: { hideNavbar: true, hideFooter: true},},
  { path: "/packages", component: Packages },
  { path: "/packagespre-wedding", component: PackagespreWedding },
  { path: "/register", component: Register, meta: { hideNavbar: true, hideFooter: true},},
  { path: "/resetpassword", component: Resetpassword, meta: { hideNavbar: true, hideFooter: true},},
  { path: '/admin', component: Admin, meta: { hideNavbar: true, hideFooter: true},},
  
  ];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;