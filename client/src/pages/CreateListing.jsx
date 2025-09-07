import React, { useState } from 'react';
// import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// NOTE: You will need to create a listing slice and this action if you haven't already.
// import { addListing } from '../redux/listing/listingSlice';

export default function CreateListing() {
  const { currentUser } = useSelector((state) => state.user);
  // const dispatch = useDispatch();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    type: 'rent',
    parking: false,
    furnished: false,
    offer: false,
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountPrice: 0,
    imageUrls: [], // will hold uploaded image paths/filenames
  });

  // change handler

  const handleChange = (e) => {
    if (e.target.id === 'sale' || e.target.id === 'rent') {
      setFormData({
        ...formData,
        type: e.target.id,
      });
    }

    if (
      e.target.id === 'parking' ||
      e.target.id === 'furnished' ||
      e.target.id === 'offer'
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.checked,
      });
    }

    if (
      e.target.type === 'number' ||
      e.target.type === 'text' ||
      e.target.type === 'textarea'
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
      });
    }
  };

  const handleImageSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      setMessage('Please select at least one image to upload.');
      setIsError(true);
      return;
    }
    if (files.length + formData.imageUrls.length > 6) {
      setMessage('You can only upload a maximum of 6 images.');
      setIsError(true);
      return;
    }

    setUploading(true);
    setMessage('');
    setIsError(false);

    try {
      const imageFormData = new FormData();
      Array.from(files).forEach((file) => {
        imageFormData.append('images', file);
      });

      const res = await fetch('/api/listings/upload', {
        method: 'POST',
        body: imageFormData,
      });

      const data = await res.json();
      setUploading(false);

      if (!res.ok) {
        throw new Error(data.message || 'Image upload failed');
      }

      setFormData((prev) => ({
        ...prev,
        imageUrls: [...prev.imageUrls, ...data.files.map((file) => file.path)],
      }));
      setMessage(data.message || 'Images uploaded successfully!');
      setIsError(false);
      setTimeout(() => {
        setMessage('');
      }, 3000);
    } catch (error) {
      setMessage(error.message);
      setIsError(true);
      setUploading(false);
    }
  };

  // Form submition

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.imageUrls.length < 1) {
      setMessage('You must upload at least one image.');
      setIsError(true);
      return;
    }

    if (+formData.regularPrice < +formData.discountPrice) {
      setMessage('Discount price must be lower than regular price');
      setIsError(true);
      return;
    }

    // Send formData to your backend
    try {
      setLoading(true);
      setIsError(false);
      const res = await fetch('/api/listing/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userRef: currentUser._id,
        }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success === false) {
        setMessage(data.message || 'Failed to create listing');
        setIsError(true);
      } else {
        setMessage('Listing created!');
        setIsError(false);
        // dispatch(addListing(data)); // Dispatch action to update Redux store
        navigate(`/listing/${data._id}`); // Navigate to the new listing page
      }
    } catch (error) {
      setMessage('Error creating listing');
      setIsError(error.message);
      setLoading(false);
    }
  };

  console.log(formData);

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  return (
    <main className='p-3 max-w-4xl mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>
        Create a Listing
      </h1>
      <form className='flex flex-col sm:flex-row gap-4' onSubmit={handleSubmit}>
        <div className='flex flex-col gap-4 flex-1'>
          <input
            type='text'
            placeholder='Name'
            className='border p-3 rounded-lg'
            id='name'
            maxLength={'62'}
            minLength={'10'}
            required
            onChange={handleChange}
            value={formData.name || ''}
          />
          <textarea
            type='text'
            placeholder='Description'
            className='border p-3 rounded-lg'
            id='description'
            required
            onChange={handleChange}
            value={formData.description || ''}
          />
          <input
            type='text'
            placeholder='Address'
            className='border p-3 rounded-lg'
            id='address'
            required
            onChange={handleChange}
            value={formData.address || ''}
          />
          <div className='flex gap-6 flex-wrap text-gray-800'>
            <div className='flex gap-2'>
              <input
                onChange={handleChange}
                type='checkbox'
                id='sale'
                className='w-4'
                checked={formData.type === 'sale'}
              />
              <span>Sell</span>
            </div>
            <div className='flex gap-2'>
              <input
                onChange={handleChange}
                type='checkbox'
                id='rent'
                className='w-4'
                checked={formData.type === 'rent'}
              />
              <span>Rent</span>
            </div>
            <div className='flex gap-2'>
              <input
                onChange={handleChange}
                type='checkbox'
                id='parking'
                className='w-4'
                value={formData.parking}
              />
              <span>Parking spot</span>
            </div>
            <div className='flex gap-2'>
              <input
                onChange={handleChange}
                type='checkbox'
                id='furnished'
                className='w-4'
                value={formData.furnished}
              />
              <span>Furnished</span>
            </div>
            <div className='flex gap-2'>
              <input
                onChange={handleChange}
                type='checkbox'
                id='offer'
                className='w-4'
                value={formData.offer}
              />
              <span>Offer</span>
            </div>
          </div>
          <div className='flex flex-wrap gap-6'>
            <div className='flex items-center gap-2'>
              <input
                type='number'
                className='p-3 border-gray-300 rounded-lg'
                id='bedrooms'
                min={'1'}
                max={'10'}
                required
                onChange={handleChange}
                value={formData.bedrooms}
              />
              <p>Beds</p>
            </div>
            <div className='flex items-center gap-2'>
              <input
                type='number'
                className='p-3 border-gray-300 rounded-lg'
                id='bathrooms'
                min={'1'}
                max={'10'}
                required
                onChange={handleChange}
                value={formData.bathrooms}
              />
              <p>Baths</p>
            </div>
            <div className='flex items-center gap-2'>
              <input
                type='number'
                className='p-3 border-gray-300 rounded-lg'
                id='regularPrice'
                min={'50'}
                max={'1000000'}
                required
                onChange={handleChange}
                value={formData.regularPrice}
              />
              <div className='flex flex-col items-center'>
                <p>Regular price</p>
                <span className='text-sm'>( $ / month)</span>
              </div>
            </div>
            {formData.offer && (
              <div className='flex items-center gap-2'>
                <input
                  type='number'
                  className='p-3 border-gray-300 rounded-lg'
                  id='discountPrice'
                  min={'0'}
                  max={'1000000'}
                  required
                  onChange={handleChange}
                  value={formData.discountPrice}
                />
                <div className='flex flex-col items-center'>
                  <p>Discounted price</p>
                  <span className='text-sm'>($ / month)</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className='flex flex-col flex-1 gap-4'>
          <p className='font-semibold'>
            Images:
            <span className='font-normal text-gray-700 ml-2'>
              The first image will be the cover (max 6)
            </span>
          </p>
          <div className='flex gap-4'>
            <input
              className='p-2 border border-gray-300 rounded w-ful'
              type='file'
              id='images'
              accept='image/*'
              multiple
              onChange={(e) => setFiles(e.target.files)}
            />
            <button
              type='button'
              onClick={handleImageSubmit}
              disabled={uploading}
              className='p-2 font-semibold text-gray-700 hover:text-white border border-amber-500 hover:bg-amber-400 rounded uppercase disabled:opacity-80'
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
          {formData.imageUrls.length > 0 &&
            formData.imageUrls.map((url, index) => {
              return (
                <div
                  key={url}
                  className='flex justify-between p-3 border items-center'
                >
                  <img
                    src={'/' + url.replace(/\\/g, '/')}
                    alt={`listing image ${index + 1}`}
                    className='w-20 h-20 object-cover rounded-lg'
                  />
                  <button
                    type='button'
                    onClick={() => handleRemoveImage(index)}
                    className=' p-3 text-red-700 uppercase hover:opacity-75 rounded-lg'
                  >
                    Delete
                  </button>
                </div>
              );
            })}

          {message && (
            <p
              className={`mt-2 text-sm ${
                isError ? 'text-red-500' : 'text-emerald-500'
              }`}
            >
              {message}
            </p>
          )}
          <button
            disabled={loading || uploading}
            // className='p-3 bg-transparent font-semibold hover:bg-stone-950 text-gray-700 hover:text-white border border-gray-200 rounded-lg uppercase hover:opacity-95 disabled:opacity-80'
            className='p-3 bg-stone-950 font-semibold hover:bg-stone-900 text-white border border-gray-200 rounded-lg uppercase hover:opacity-95 disabled:opacity-80'
          >
            {loading ? 'Creating...' : 'Create Listing'}
          </button>
        </div>
      </form>
    </main>
  );
}
