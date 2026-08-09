import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthLayout, GuestLayout }from './pages/Layout'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'
import PreviewPage from './pages/PreviewPage'
import BuilderPage from './pages/BuilderPage'
import { Toaster } from 'react-hot-toast'

const App = () => {
  return (
    <>
    <Toaster />
    <Routes>
      {/* Login Routes */}
      <Route element={<GuestLayout />}>
        <Route path='/login' element={<AuthPage mode="login" />} />
        <Route path='/register' element={<AuthPage mode="register" />} /> 
      </Route>

       {/* Protectetd Routes */}
      <Route element={<AuthLayout />}>
        <Route path='/' element={<HomePage mode="login" />} />
        <Route path='/builder/:id' element={<BuilderPage />} /> 
        <Route path='/preview/:id' element={<PreviewPage />} /> 
      </Route>


      {/* Catch-all*/}
      <Route path='*' element={<Navigate to="/" replace />} />
    </Routes>
    </>
   
  )  
}

export default App
