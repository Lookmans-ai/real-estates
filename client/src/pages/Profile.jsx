import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  deleteUser,
  signOutUser,
  updateUserAvatar,
  updateUser,
  clearError,
} from '../redux/user/userSlice';
import {
  fetchUserListings,
  deleteListing,
  clearListings,
} from '../redux/listing/listingSlice';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const {
    listings,
    loading: listingsLoading,
    error: listingsError,
  } = useSelector((state) => state.listings);

  const fileRef = useRef(null);
  const [file, setFile] = useState(undefined);
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [isError, setIsError] = useState(false);
  // const [userListings, setUserListings] = useState([]);

  // formData
  const [formData, setFormData] = useState({});

  // This effect syncs the local form state with the Redux state.
  // This is crucial to prevent stale data in the form after a successful update or page rehydration.
  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username,
        email: currentUser.email,
        password: '', // Always clear password for security
        avatar: currentUser.avatar,
      });
    }
  }, [currentUser]);

  // handle input change for text fields
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const dispatch = useDispatch();

  const handleFileUpload = useCallback(
    async (file) => {
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/auth/upload');

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          console.log(percent);

          setProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          console.log(data);
          setMessage(data.message || 'Upload successful!');
          setIsError(false);

          if (data.filename) {
            const avatarPath = `uploads/${data.filename}`;
            dispatch(updateUserAvatar(avatarPath));
          }
        } else {
          setMessage('Error uploading file');
          setIsError(true);
        }
        setProgress(0);
      };

      xhr.onerror = () => {
        setMessage('Error uploading file');
        setIsError(true);
        setProgress(0);
      };

      xhr.send(formData);
    },
    [dispatch]
  );

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file, handleFileUpload]);

  // handle form submission for profile update
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Clear previous messages before a new submission
    setMessage('');
    dispatch(clearError()); // Clear any lingering redux errors

    try {
      const submitData = { ...formData };
      // Ensure we don't send an empty password string to be hashed
      if (!submitData.password || submitData.password.trim() === '') {
        delete submitData.password;
      }

      // Dispatch the async thunk and use .unwrap() to handle promise resolution
      const actionResult = await dispatch(
        updateUser({ userId: currentUser._id, formData: submitData })
      ).unwrap();

      // If successful, set a transient success message
      setMessage(actionResult.message || 'Profile updated successfully!');
    } catch (rejectedValue) {
      // .unwrap() will throw the rejected value, which is the error message from the slice.
      // The error is already in the Redux state, so we just log it for debugging.
      console.error('Failed to update profile:', rejectedValue);
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(clearError());
      await dispatch(deleteUser(currentUser._id)).unwrap();
    } catch (rejectedValue) {
      console.error('Failed to delete user:', rejectedValue);
    }
  };

  // handle sign Out

  const handleSignOut = async () => {
    try {
      dispatch(clearError());
      dispatch(clearListings());
      await dispatch(signOutUser()).unwrap();
    } catch (rejectedValue) {
      console.error('Failed to sign out:', rejectedValue);
    }
  };

  // Show Listing func

  const handleShowListings = async () => {
    dispatch(fetchUserListings(currentUser._id));
  };

  // Delete listing func

  const handleListingDelete = async (listingId) => {
    try {
      await dispatch(deleteListing(listingId)).unwrap();
    } catch (rejectedValue) {
      console.error('Failed to delete listing:', rejectedValue);
    }
  };

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-3'>User Profile</h1>

      {/* --- Unified and Improved Message Display --- */}
      {/* Shows Redux error first, then local component messages */}
      {error || listingsError ? (
        <p className='bg-red-200 text-red-700 p-3 my-2 rounded-lg text-center'>
          {error || listingsError}
        </p>
      ) : message ? (
        <p
          className={`${
            isError ? 'bg-red-200 text-red-700' : 'bg-green-200 text-green-700'
          } p-3 my-2 rounded-lg text-center`}
        >
          {message}
        </p>
      ) : null}
      <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
        <input
          onChange={(e) => setFile(e.target.files[0])}
          type='file'
          ref={fileRef}
          hidden
          accept='image/*'
        />
        <img
          onClick={() => fileRef.current.click()}
          src={
            currentUser?.avatar
              ? currentUser.avatar.startsWith('http')
                ? currentUser.avatar // Google photo URL
                : `/${currentUser.avatar}` // Local upload, now proxied
              : '/default-avatar.png'
          }
          alt='profile'
          className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2'
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/default-avatar.png';
          }}
        />

        {progress > 0 && (
          <div className='w-full bg-gray-200 rounded-full h-2.5 mb-4'>
            <div
              className={
                isError
                  ? 'bg-red-500 h-2.5 rounded-full'
                  : 'bg-amber-500 h-2.5 rounded-full'
              }
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        <input
          type='text'
          placeholder='username'
          className='border p-3 rounded-lg'
          id='username'
          autoComplete='on'
          value={formData.username || ''}
          onChange={handleChange}
        />
        <input
          type='email'
          placeholder='email'
          className='border p-3 rounded-lg'
          id='email'
          autoComplete='on'
          value={formData.email || ''}
          onChange={handleChange}
        />
        <input
          type='password'
          placeholder='password'
          className='border p-3 rounded-lg'
          id='password'
          autoComplete='on'
          value={formData.password || ''}
          onChange={handleChange}
        />
        <button
          disabled={loading}
          className='bg-amber-500 font-semibold text-white p-3 hover:opacity-95 disabled:opacity-80 uppercase rounded-lg'
        >
          {loading ? 'Loading...' : 'Update'}
        </button>
        <Link
          to={'/create-listing'}
          className='bg-stone-950 font-semibold p-3 text-white rounded-lg uppercase text-center hover:opacity-95'
        >
          Create Listing
        </Link>
      </form>
      <div className='flex justify-between mt-5'>
        <span
          onClick={handleDeleteUser}
          className='text-red-700 cursor-pointer hover:underline'
        >
          Delete account
        </span>
        <span
          onClick={handleSignOut}
          className='text-red-700 cursor-pointer hover:underline'
        >
          Sign out
        </span>
      </div>
      <button
        onClick={handleShowListings}
        className='text-emerald-500 w-full font-semibold'
      >
        {' '}
        Show Listings
      </button>
      {listingsLoading && (
        <p className='text-center my-7'>Loading listings...</p>
      )}
      {listings && listings.length > 0 && (
        <div className='flex flex-col gap-4'>
          <h1 className='text-center mt-7 text-2xl font-semibold text-gray-600'>
            Your Listings
          </h1>
          {listings.map((listing) => {
            return (
              <div
                key={listing._id}
                className='border rounded-lg p-3 flex justify-between items-center gap-4'
              >
                <Link to={`/listing/${listing._id}`}>
                  <img
                    src={'/' + listing.imageUrls[0].replace(/\\/g, '/')}
                    alt='listing cover'
                    className='h-16 w-16 object-contain'
                  />
                </Link>
                <Link
                  to={`/listing/${listing._id}`}
                  className='text-slate-700 font-semibold flex-1 hover:underline truncate'
                >
                  <p>{listing.name}</p>
                </Link>
                <div className='flex flex-col items-center'>
                  <button
                    onClick={() => handleListingDelete(listing._id)}
                    className='text-red-500 uppercase'
                  >
                    Delete
                  </button>
                  <button className='text-emerald-500 uppercase'>Edit</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
