import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { AuthLayout, GuestLayout }from './pages/Layout'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'
import PreviewPage from './pages/PreviewPage'

const App = () => {
  return (
    <Routes>
      {/* Login Routes */}
      <Route element={<GuestLayout />}>
        <Route path='/login' element={<AuthPage mode="login" />} />
        <Route path='/register' element={<AuthPage mode="register" />} /> 
      </Route>

       {/* Protectetd Routes */}
      <Route element={<AuthLayout />}>
        <Route path='/' element={<HomePage mode="login" />} />
        <Route path='/builder/:id' element={<HomePage />} /> 
        <Route path='/preview/:id' element={<PreviewPage />} /> 
      </Route>
    </Routes>
  )  
}

export default App
