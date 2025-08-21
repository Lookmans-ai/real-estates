import React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log(data);
      if (data?.success === false) {
        setLoading(false);
        setError(data.message);
        return;
      }

      setLoading(false);
      setError(null);

      navigate('/sign-in');
    } catch (error) {
      console.log(error);
      setLoading(false);
      setError(error.message);
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
        ) : null}
      </div>
      <form className='flex flex-col gap-4' onSubmit={submitHandler}>
        <input
          type='text'
          className='border p-3 rounded-lg w-full'
          id='username'
          placeholder='username'
          onChange={handleChange}
        />
        <input
          type='email'
          className='border p-3 rounded-lg w-full'
          id='email'
          placeholder='email'
          onChange={handleChange}
        />
        <input
          type='password'
          className='border p-3 rounded-lg w-full'
          id='password'
          placeholder='password'
          onChange={handleChange}
        />
        <button
          disabled={loading}
          className='bg-amber-500 hover:opacity-95 disabled:opacity-80 text-white p-3 rounded-lg uppercase'
        >
          {loading ? 'Loading...' : 'Sign Up'}
        </button>
      </form>
      <div className='flex gap-2 mt-3'>
        <p>Have an account?</p>
        <Link to={'/sign-in'}>
          <span className='text-amber-500'>Sign In</span>
        </Link>
      </div>
    </div>
  );
}
