import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Signin from './pages/Signin';
import Signup from './pages/Signup';
import About from './pages/About';
import Profile from './pages/Profile';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';
import CreateListing from './pages/CreateListing';
import UpdateListing from './pages/UpdateListing';
import Listing from './pages/Listing';

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path='/' element={<Home />}></Route>
        <Route path='/sign-in' element={<Signin />}></Route>
        <Route path='/sign-up' element={<Signup />}></Route>
        <Route path='/about' element={<About />}></Route>
        <Route element={<PrivateRoute />}>
          <Route path='/profile' element={<Profile />}></Route>
          <Route path='/create-listing' element={<CreateListing />}></Route>
          <Route
            path='/update-listing/:listingId'
            element={<UpdateListing />}
          ></Route>
        </Route>
        <Route path='/listing/:listingId' element={<Listing />}></Route>
      </Routes>
    </BrowserRouter>
  );
}
