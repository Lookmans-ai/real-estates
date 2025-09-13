import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRef } from 'react';
import {
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutUserStart,
  updateUser,
  updateUserFailure,
  updateUserStart,
  updateUserSuccess,
} from '../redux/user/userSlice';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { currentUser } = useSelector((state) => state.user);

  const fileRef = useRef(null);
  const [file, setFile] = useState(undefined);
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [isError, setIsError] = useState(false);
  const [userListings, setUserListings] = useState([]);

  // formData
  const [formData, setFormData] = useState({
    username: currentUser?.username || '',
    email: currentUser?.email || '',
    password: '',
    avatar: currentUser.avatar,
  });
  console.log(file);

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

          // updating avatar in Redux
          if (data.filename) {
            dispatch(updateUser({ avatar: `uploads/${data.filename}` }));
          }

          if (data.filename) {
            const avatarPath = `uploads/${data.filename}`;
            dispatch(updateUser({ avatar: avatarPath }));
            setFormData((prev) => ({ ...prev, avatar: avatarPath }));
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

      console.log(formData);
    },
    [dispatch]
  );

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file, handleFileUpload]);

  console.log(formData);

  // handle form submission for profile update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    try {
      dispatch(updateUserStart());

      const submitData = { ...formData };
      if (!submitData.password) {
        delete submitData.password;
      }

      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await res.json();

      console.log(data);

      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        setMessage(data.message || 'Update failed');
        setIsError(true);
        return;
      }

      dispatch(updateUserSuccess(data));
      setMessage(data.message || 'Profile updated!');
      setIsError(false);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
      setMessage('Error updating profile');
      setIsError(true);
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());

      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }

      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  // handle sign Out

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());

      const res = await fetch('/api/auth/signout');

      const data = await res.json();

      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }

      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  // Show Listing func

  const handleShowListings = async () => {
    try {
      setIsError(false);
      const res = await fetch(`/api/user/listings/${currentUser._id}`);
      const data = await res.json();

      if (data.success === false) {
        setIsError(data.message);
        return;
      }

      setUserListings(data);
    } catch (error) {
      setIsError(error.message);
    }
  };

  // Delete listing func

  const handleListingDelete = async (listingId) => {
    try {
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success === false) {
        setIsError(data.message);
        return;
      }

      setUserListings((prev) =>
        prev.filter((listing) => listing._id !== listingId)
      );
    } catch (error) {
      setIsError(error.message);
    }
  };

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-3'>User Profile</h1>
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
                ? currentUser.avatar
                : `http://localhost:1024/${currentUser.avatar}`
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

        {isError ? (
          <p className='text-red-500'>
            {message ? message : 'File type not supported or upload failed.'}
          </p>
        ) : (
          <p className='text-emerald-500'>{message}</p>
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
          // disabled={loading}
          className='bg-amber-500 font-semibold text-white p-3 hover:opacity-95 disabled:opacity-80 uppercase rounded-lg'
        >
          Update
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
      {isError ? <p className='text-red-500'>{message}</p> : ''}

      {userListings && userListings.length > 0 && (
        <div className='flex flex-col gap-4'>
          <h1 className='text-center mt-7 text-2xl font-semibold text-gray-600'>
            Your Listings
          </h1>
          {userListings.map((listing) => {
            return (
              <div
                key={listing._id}
                className='border rounded-lg p-3 flex justify-between items-center gap-4'
              >
                <Link to={`/listing/${listing._id}`}>
                  <img
                    src={listing.imageUrls[0]}
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
