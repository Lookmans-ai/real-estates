import React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingBox from '../components/LoadingBox';
import { useNavigate } from 'react-router-dom';
import MessageBox from '../components/MessageBox';
import { useDispatch, useSelector } from 'react-redux';
import { signIn } from '../redux/user/userSlice';
import OAuth from '../components/OAuth';

export default function Signin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  // const [error, setError] = useState(null);
  // const [loading, setLoading] = useState(false);

  const { loading, error } = useSelector((state) => state.user);
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
    // setLoading(true);
    // dispatch(signInStart());
    // setError(null);
    setSuccessMsg(null);
    try {
      const actionResult = await dispatch(signIn(formData)).unwrap();
      // setSuccessMsg(actionResult.message || 'Sign up successful!');
      setSuccessMsg(actionResult.message || 'Sign in successful!');

      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (rejectedValue) {
      // The error state is already handled by the rejected reducer
      // We just need to log it if we want to.
      console.error('Failed to sign in:', rejectedValue);
    }
  };
  // console.log(formData);
  return (
    <div className='max-w-lg mx-auto p-3'>
      <h1 className='text-3xl text-center font-semibold my-7'>Sign In</h1>
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
          className='bg-amber-500 hover:opacity-95 disabled:opacity-80 text-white p-3 rounded-lg uppercase cursor-pointer'
        >
          {loading ? 'Loading...' : 'Sign In'}
        </button>
        <OAuth />
      </form>
      <div className='flex gap-2 mt-3'>
        <p>Dont have an account?</p>
        <Link to={'/sign-up'}>
          <span className='text-amber-500 hover:underline'>Sign Up</span>
        </Link>
      </div>
    </div>
  );
}
