import React from 'react';
import { Link } from 'react-router-dom';

export default function Signin() {
  return (
    <div className='max-w-lg mx-auto p-3'>
      <h1 className='text-3xl text-center font-semibold my-7'>Sign Up</h1>
      <form className='flex flex-col gap-4'>
        <input
          type='text'
          className='border p-3 rounded-lg w-full'
          id='username'
          placeholder='username'
        />
        <input
          type='email'
          className='border p-3 rounded-lg w-full'
          id='email'
          placeholder='email'
        />
        <input
          type='password'
          className='border p-3 rounded-lg w-full'
          id='password'
          placeholder='password'
        />
        <button
          // disabled
          className='bg-amber-500 hover:opacity-95 disabled:opacity-80 text-white p-3 rounded-lg uppercase'
        >
          Sign Up
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
