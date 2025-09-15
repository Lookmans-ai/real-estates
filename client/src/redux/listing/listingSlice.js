import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  listings: [],
  loading: false,
  error: null,
};

export const fetchUserListings = createAsyncThunk(
  'listings/fetchUser',
  async (userId, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/user/listings/${userId}`);
      const data = await res.json();
      if (!res.ok) {
        return rejectWithValue(data.message || 'Failed to fetch listings.');
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteListing = createAsyncThunk(
  'listings/delete',
  async (listingId, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success === false) {
        return rejectWithValue(data.message);
      }
      // On success, return the ID of the deleted listing
      // so we can remove it from the state in the reducer.
      return listingId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const listingSlice = createSlice({
  name: 'listings',
  initialState,
  reducers: {
    clearListings: (state) => {
      state.listings = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch User Listings
      .addCase(fetchUserListings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserListings.fulfilled, (state, action) => {
        state.listings = action.payload;
        state.loading = false;
      })
      .addCase(fetchUserListings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Listing
      .addCase(deleteListing.fulfilled, (state, action) => {
        state.listings = state.listings.filter(
          (listing) => listing._id !== action.payload
        );
      });
  },
});

export const { clearListings } = listingSlice.actions;

export default listingSlice.reducer;
