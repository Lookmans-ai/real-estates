import React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import OAuth from '../components/OAuth';
import { signUp } from '../redux/user/userSlice';

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});

  const { loading, error } = useSelector((state) => state.user);
  // const [error, setError] = useState(null);
  // const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    setSuccessMsg(null);

    try {
      const actionResult = await dispatch(signUp(formData)).unwrap();
      setSuccessMsg(actionResult.message || 'Sign up successful!');

      setTimeout(() => {
        navigate('/sign-in');
      }, 2000);
    } catch (rejectedValue) {
      // The error state is already handled by the rejected reducer
      // We just need to log it if we want to.
      console.error('Failed to sign up:', rejectedValue);
    }
  };
  // console.log(formData);
  return (
    <div className='max-w-lg mx-auto p-3'>
      <h1 className='text-3xl text-center font-semibold my-7'>Sign Up</h1>
      <div className='mb-2'>
        {loading ? (
          <LoadingBox />
        ) : error ? (
          <MessageBox variant='danger'>{error}</MessageBox>
        ) : successMsg ? (
          <MessageBox>{successMsg}</MessageBox>
        ) : null}
      </div>
      <form className='flex flex-col gap-4' onSubmit={submitHandler}>
        <input
          type='text'
          className='border p-3 rounded-lg w-full'
          id='username'
          placeholder='username'
          onChange={handleChange}
          autoComplete='on'
        />
        <input
          type='email'
          className='border p-3 rounded-lg w-full'
          id='email'
          placeholder='email'
          onChange={handleChange}
          autoComplete='on'
        />
        <input
          type='password'
          className='border p-3 rounded-lg w-full'
          id='password'
          placeholder='password'
          onChange={handleChange}
          autoComplete='on'
        />
        <button
          disabled={loading}
          className='bg-amber-500 hover:opacity-95 disabled:opacity-80 text-white p-3 rounded-lg uppercase'
        >
          {loading ? 'Loading...' : 'Sign Up'}
        </button>
        <OAuth />
      </form>
      <div className='flex gap-2 mt-3'>
        <p>Have an account?</p>
        <Link to={'/sign-in'}>
          <span className='text-amber-500 hover:underline'>Sign In</span>
        </Link>
      </div>
    </div>
  );
}
