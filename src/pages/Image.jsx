import React from "react";
import { useLocation } from "react-router-dom";

const SingleProjectImage = () => {
  const { state } = useLocation();
  const { projectName, images } = state;

  console.log(images);

  return (
    <div>
      <div>
        <h2>{projectName}</h2>
        {images.map((file, index) => {
          const fileExtension = file.split('.').pop().toLowerCase();
          const fileUrl = `${import.meta.env.VITE_BASE_URL}${file}`;
          
          if (["jpeg", "jpg", "png", "gif"].includes(fileExtension)) {
            // Render images
            return <img key={index} src={fileUrl} alt={`project-${index}`} />;
          } else if (fileExtension === "pdf") {
            // Render PDF using iframe or link
            return (
              <div key={index}>
                <iframe src={fileUrl} width="100%" height="600px" title={`project-pdf-${index}`}></iframe>
                {/* Alternatively, you can use a download link */}
                {/* <a href={fileUrl} target="_blank" rel="noopener noreferrer">View PDF</a> */}
              </div>
            );
          } else {
            return <p key={index}>Unsupported file format: {fileExtension}</p>;
          }
        })}
      </div>
    </div>
  );
};

export default SingleProjectImage;
