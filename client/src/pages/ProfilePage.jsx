import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets.js";
import { AuthContext } from "../../context/AuthContext.jsx";
import Swal from "sweetalert2";
const ProfilePage = () => {
  const { authUser, updateProfile, deleteProfile } = useContext(AuthContext);
  const [selectedImg, setSelectedImg] = useState(null);
  const navigate = useNavigate();
  const [name, setName] = useState(authUser.fullName);
  const [bio, setBio] = useState(authUser.bio);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let profileData = { fullName: name, bio };
      if (selectedImg) {
        const base64Image = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(selectedImg);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
        });
        profileData.profilePic = base64Image;
      }
      await updateProfile(profileData);
      navigate("/");
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };
  const handleDeleteProfile = async () => {
    const result = await Swal.fire({
      title: "Delete Profile?",
      text: "This will remove your profile!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      background: "#1f2937",
      color: "#fff",
    });

    if (result.isConfirmed) {
      await deleteProfile();
      Swal.fire("Deleted!", "The profile has been removed.", "success");
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-5/6 max-w-2xl backdrop-blur-2xl bg-slate-900 text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg ">
        <button
          onClick={() => navigate("/")}
          className="absolute top-5 right-5 z-10 p-2 hover:bg-slate-800 rounded-full transition-all"
        >
          <img src={assets.arrow_icon} alt="Back" className="w-6 h-6" />
        </button>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 p-10 flex-1"
        >
          <h3 className="text-lg">Profile Details</h3>

          <label
            htmlFor="avatar"
            className="flex items-center gap-3 cursor-pointer"
          >
            <input
              onChange={(e) => setSelectedImg(e.target.files[0])}
              type="file"
              accept=".png, .jpg , .jpeg "
              id="avatar"
              hidden
            />
            <img
              src={
                selectedImg
                  ? URL.createObjectURL(selectedImg)
                  : authUser?.profilePic
              }
              alt=""
              className={`w-12 h-12  rounded-full`}
            />
            upload profile image
          </label>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            required
            placeholder="Your name "
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <textarea
            required
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            placeholder="Write profile bio"
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
            rows={4}
          ></textarea>
          <button
            type="submit"
            className="bg-gradient-to-r from-indigo-500 to-indigo-900 text-white p-2 rounded-full text-lg cursor-pointer"
          >
            Save
          </button>
          <div className="pt-4 border-t border-gray-700 mt-2">
            <button
              type="button"
              onClick={handleDeleteProfile}
              className="text-red-500 hover:text-red-400 text-sm transition-colors w-full text-center cursor-pointer"
            >
              Delete Account
            </button>
          </div>
        </form>
        <div className="">
          <img
            className={`max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10`}
            src={authUser?.profilePic || assets.avatar_icon}
            alt=""
          />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
