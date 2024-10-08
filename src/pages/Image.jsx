import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const FilePage = () => {
  const location = useLocation();
  const { images, projectName } = location.state || {}; // Use images instead of files
  console.log(location.state);

  if (!images || images.length === 0) {
    return <p>No files to display.</p>; // Handle case where no images are available
  }

  // Log the images to check the URLs
  console.log(images, 'Image URLs');

  const getFileType = (url) => {
    const extension = url.split('.').pop().toLowerCase(); // Get the file extension
    if (['jpeg', 'jpg', 'png', 'gif'].includes(extension)) {
      return 'image';
    } else if (['pdf'].includes(extension)) {
      return 'pdf';
    } else {
      return 'document';
    }
  };

  const handleDownload = (file) => {
    const link = document.createElement('a');
    link.href = file;
    link.download = file.split('/').pop(); // Extract file name from URL
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <h1>{projectName}</h1>

      <div>
        {images.map((file, index) => {  // Map over images instead of files
          const fileType = getFileType(file);

          return (
            <div key={index} style={{ marginBottom: '20px' }}>
              {fileType === 'image' && (
                <div className='d-flex'>
                  <img src={file} alt={`Image ${index}`} style={{ maxWidth: '100%', height: 'auto' }} />
                  <div style={{ marginTop: '10px' }}>
                    <Link onClick={() => handleDownload(file)} style={{ color: "blue", textDecoration: 'underline' }}>
                      Download Image
                    </Link>
                  </div>
                </div>
              )}

              {fileType === 'pdf' && (
                <div className='d-flex'>
                  <iframe src={file} title={`PDF ${index}`} style={{ width: '61%', height: '500px' }} />
                  <div style={{ marginTop: '10px' }}>
                    <Link onClick={() => handleDownload(file)} style={{ color: "blue", textDecoration: 'underline' }}>
                      Download PDF
                    </Link>
                  </div>
                </div>
              )}

              {fileType === 'document' && (
                <div className='d-flex'>
                  <span style={{ marginRight: '10px' }}>Document {index + 1}: {file.split('/').pop()}</span>
                  <Link onClick={() => handleDownload(file)} style={{ marginLeft: '10px', color: "blue", textDecoration: 'underline' }}>
                    Download Document
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FilePage;
