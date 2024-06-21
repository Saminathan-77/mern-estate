import { useState } from "react";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRef } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import {
  updateUserStart,
  updateUserFailure,
  updateUserSuccess,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  logOutUserFailure,
  logOutUserStart,
  logOutUserSuccess,
} from "../redux/user/userSlice.js";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";

export default function Profile() {
  const dispatch = useDispatch();
  const fileRef = useRef(null);
  const [userListings, setUserListings] = useState([]);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  console.log(formData);
  const [updateSucc, setUpdateSucc] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false);
  //firebase storage
  // allow read;
  // allow write: if
  // request.resource.size < 2 * 1024 * 1024 &&
  // request.resource.contentType.matches('image/.*')

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
      (error) => {
        setFileUploadError(true);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormData({ ...formData, avatar: downloadURL });
        });
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }
      dispatch(updateUserSuccess(data));
      setUpdateSucc(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
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

  const handleSignOut = async () => {
    try {
      dispatch(logOutUserStart());
      const res = await fetch("/api/auth/signout");
      const data = await res.json();
      if (data.success === false) {
        dispatch(logOutUserFailure(data.message));
        return;
      }
      dispatch(logOutUserSuccess(data));
    } catch (error) {
      dispatch(logOutUserFailure(error.message));
    }
  };

  const showListings = async () => {
    try {
      setShowListingsError(false);
      const res = await fetch(`/api/user/listings/${currentUser._id}`);
      const data = await res.json();
      if (data.success === false) {
        setShowListingsError(true);
        return;
      }
      setUserListings(data);
    } catch (error) {
      setShowListingsError(true);
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          onChange={(e) => setFile(e.target.files[0])}
          type="file"
          ref={fileRef}
          hidden
          accept="image/*"
        />
        <img
          onClick={() => fileRef.current.click()}
          src={formData.avatar || currentUser.avatar}
          alt="user Profile"
          className="rounded-full self-center object-cover h-24 w-24 cursor-pointer mt-2"
        />
        <p className="text-sm self-center">
          {fileUploadError ? (
            <span className="text-red-700">
              Error Image Upload (image must be less than 2 mb)
            </span>
          ) : filePerc > 0 && filePerc < 100 ? (
            <span className="text-slate-700">{`Uploading ${filePerc}`}</span>
          ) : filePerc === 100 ? (
            <span className="text-green-700">Uploaded Successfully!</span>
          ) : (
            ""
          )}
        </p>
        <input
          type="text"
          id="username"
          defaultValue={currentUser.username}
          placeholder="username"
          className="border p-3 rounded-lg max-w-lg"
          onChange={handleChange}
        />
        <input
          type="text"
          id="email"
          defaultValue={currentUser.email}
          placeholder="email"
          className="border p-3 rounded-lg max-w-lg"
          onChange={handleChange}
        />
        <input
          type="password"
          id="password"
          placeholder="password"
          className="border p-3 rounded-lg max-w-lg"
          onChange={handleChange}
        />
        <button
          disabled={loading}
          className="uppercase text-white bg-slate-700 rounded-lg p-3 hover:opacity-80"
        >
          {loading ? "Loading..." : "Update"}
        </button>
        <Link
          className="text-green-600 text-whie uppercase text-center hover:opacity-95 p-3 rounded-lg"
          to={"/create-listing"}
        >
          Create Listing
        </Link>
      </form>
      <div className="flex justify-between mt-5">
        <span
          onClick={handleDeleteUser}
          className="text-red-600 cursor-pointer hover:underline"
        >
          Delete Account
        </span>
        <span
          onClick={handleSignOut}
          className="text-red-600 cursor-pointer hover:underline"
        >
          Sign out
        </span>
      </div>
      <p className="text-green-600 mt-5">
        {updateSucc ? "User updated successfully" : ""}
      </p>
      <p className="text-red-600 mt-5">{error ? error : ""}</p>
      <button
        onClick={showListings}
        className="text-green-600 w-full hover:underline"
      >
        Show Listings
      </button>
      <p className="text-red-600 mt-5">
        {showListingsError ? "Error showing Listings" : ""}
      </p>
      {userListings && userListings.length > 0 && (
        <div className="flex flex-col gap-4">
          <h1 className="text-center mt-6 text-2xl font-semibold">
            Your Listings
          </h1>
          {userListings.map((listing) => (
            <div
              key={listing._id}
              className="border rounded-lg p-3 flex justify-between items-center gap-4"
            >
              <Link to={`/listing/${listing._id}`}>
                <img
                  src={listing.imageUrls[0]}
                  alt="listing cover"
                  className="h-16 w-16 object-contain"
                />
              </Link>
              <Link
                className="flex-1 text-slate-700 font-semibold hover:underline truncate"
                to={`/listing/${listing._id}`}
              >
                <p>{listing.name}</p>
              </Link>
              <div className="flex flex-col items-center">
                <button className="text-red-600 uppercase">Delete</button>
                <button className="text-green-600 uppercase">Edit</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
