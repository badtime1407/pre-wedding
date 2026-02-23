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
import OrderStatus from '../Pages/OrderStatus.vue'
import Admindashbord from '../Pages/Admindashbord.vue'
import Adminpackages from '../Pages/Adminpackages.vue'
import Admintimetable from '../Pages/Admintimetable.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/booking', component: Booking },
  { path: '/gallery', component: Gallery },
  { path: "/login", component: Login, meta: { hideNavbar: true, hideFooter: true},},
  { path: "/packages", component: Packages },
  { path: "/packagespre-wedding", component: PackagespreWedding },
  { path: "/register", component: Register, meta: { hideNavbar: true, hideFooter: true},},
  { path: "/resetpassword", component: Resetpassword, meta: { hideNavbar: true, hideFooter: true},},
  {  path: "/orderstatus", name: "OrderStatus", component: OrderStatus, meta: { requiresAuth: true }},
  {  path: "/admin", component: Admin, meta: { requiresAuth: true, requiresAdmin: true, hideNavbar: true, hideFooter: true }},
  {  path: "/admindashbord", component: Admindashbord, meta: { requiresAuth: true, requiresAdmin: true, hideNavbar: true, hideFooter: true }},
  {  path: "/adminpackages", component: Adminpackages, meta: { requiresAuth: true, requiresAdmin: true, hideNavbar: true, hideFooter: true }},
  {  path: "/admintimetable", component: Admintimetable, meta: { requiresAuth: true, requiresAdmin: true, hideNavbar: true, hideFooter: true }},
  ];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token")

  // ถ้าไม่ต้องการ login
  if (!to.meta.requiresAuth) {
    return next()
  }

  // ถ้าต้อง login แต่ไม่มี token
  if (!token) {
    return next("/login")
  }

  // ถ้าต้องเป็น admin
  if (to.meta.requiresAdmin) {
    const payload = JSON.parse(atob(token.split(".")[1]))

    if (payload.role !== "admin") {
      return next("/")
    }
  }

  next()
})

export default router