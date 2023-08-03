export const downloadImage = (image) => {
  fetch(image.shotUrl)
      .then(response => response.blob())
      .then(blob => {
          // Create a temporary anchor element
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;

          // Extract the filename from the URL
          const filename = `${image.gameName} - ${image.author} - ${image.epochtime}`;

          // Set the download attribute and filename
          link.setAttribute('download', filename);
          document.body.appendChild(link);

          // Simulate a click on the anchor element to start the download
          link.click();

          // Clean up the temporary anchor element
          link.parentNode.removeChild(link);
      })
      .catch(error => {
          console.error('Error downloading image:', error);
      });
};