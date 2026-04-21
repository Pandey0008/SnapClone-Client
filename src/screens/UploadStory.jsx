import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createStoryAPI } from "../services/storyService";

const UploadStory = () => {

  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);


  const handleUpload = async () => {

    if (!file) {
      alert("Please select a file first");
      return;
    }

    try {

      setLoading(true);

      const formData = new FormData();

      formData.append("media", file);
      formData.append("caption", caption);

      await createStoryAPI(formData);

      alert("Story uploaded successfully");

      navigate("/stories");

    } catch (err) {

      console.error(err);

      alert("Upload failed");

    } finally {

      setLoading(false);

    }

  };


  return (

    <div className="min-h-screen flex flex-col items-center justify-center gap-6">

      <h1 className="text-3xl font-bold">Upload Story</h1>

      <input
        type="file"
        accept="image/*,video/*"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <input
        type="text"
        placeholder="Write caption..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        className="px-4 py-2 rounded-lg text-white"
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        className="bg-yellow-400 px-6 py-3 rounded-xl font-semibold"
      >

        {loading ? "Uploading..." : "Upload Story"}

      </button>

    </div>

  );

};

export default UploadStory;