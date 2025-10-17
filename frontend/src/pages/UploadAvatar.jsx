import React, { useState } from "react";
import axios from "axios";

export default function UploadAvatar() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = e => {
    const f = e.target.files[0];
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleUpload = () => {
    if (!file) return alert("Chọn file trước!");
    const formData = new FormData();
    formData.append("avatar", file);

    axios.post("/upload-avatar", formData)
      .then(res => alert("Upload thành công!"))
      .catch(err => console.log(err));
  };

  return (
    <div>
      <h2>Upload Avatar</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} /><br />
      {preview && <img src={preview} alt="preview" width="150" />}<br />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}
