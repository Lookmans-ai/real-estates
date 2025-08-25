import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRef } from 'react';
import { updateUser } from '../redux/user/userSlice';
// import MessageBox from '../components/MessageBox';
// import { getStorage, ref, uploadBytesResumable } from 'firebase/storage';
// import { app } from '../firebase';

export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser } = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined);
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [isError, setIsError] = useState(false);
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

    try {
      const res = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || 'Update failed');
      } else {
        setMessage(data.message || 'Profile updated!');
        // optionally update Redux/global state here
        dispatch(
          updateUser({
            username: formData.username,
            email: formData.email,
            ...(data?.avatar && { avatar: data?.avatar }),
          })
        );
      }
    } catch (error) {
      setMessage('Error updating profile', error);
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
            currentUser.avatar
              ? currentUser.avatar.startsWith('http')
                ? currentUser.avatar
                : `http://localhost:1024/${currentUser.avatar}`
              : '/default-avatar.png'
          }
          alt='profile'
          className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2'
        />

        <p className='text-sm self-center'>
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
              {message || 'File type not supported or upload failed.'}
            </p>
          ) : (
            <p className='text-emerald-500'>{message}</p>
          )}
        </p>

        <input
          type='text'
          placeholder='username'
          className='border p-3 rounded-lg'
          id='username'
          autoComplete='on'
          value={formData.username}
          onChange={handleChange}
        />
        <input
          type='email'
          placeholder='email'
          className='border p-3 rounded-lg'
          id='email'
          autoComplete='on'
          value={formData.email}
          onChange={handleChange}
        />
        <input
          type='password'
          placeholder='password'
          className='border p-3 rounded-lg'
          id='password'
          autoComplete='on'
          value={formData}
          onChange={handleChange}
        />
        <button className='bg-amber-500 text-white p-3 hover:opacity-95 disabled:opacity-80 uppercase rounded-lg'>
          Update
        </button>
      </form>
      <div className='flex justify-between mt-5'>
        <span className='text-red-700 cursor-pointer hover:underline'>
          Delete account
        </span>
        <span className='text-red-700 cursor-pointer hover:underline'>
          Sign out
        </span>
      </div>
    </div>
  );
}
