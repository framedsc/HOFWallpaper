import React, { useState} from 'react';
import './App.css';
import { getAuthors, getImages } from './api/request';
import { addProperties, normalizeData } from '../src/utils/utils';

function App() {
  const [siteData, setSiteData] = useState({ imageData: [], authorData: [] });
  const [initialized, setInitialized] = useState(false);
  const [image, setImage] = useState(null);

  const getData = async () => {
    setInitialized(true);

    const imagesResponse = await getImages({});
    const authorsResponse = await getAuthors({});

    const normalizedImages = normalizeData(imagesResponse.data._default);
    const normalizedAuthors = normalizeData(authorsResponse.data._default);

    const formattedImages = addProperties(normalizedImages, normalizedAuthors);

    setSiteData({ imageData: formattedImages, authorData: normalizedAuthors});

    setImage(formattedImages[Math.floor(Math.random() * Math.floor(formattedImages.length - 1))]);
  };

  const image_style = (image) => {
    const ar = image.height / image.width

    console.log(ar)

    return {
      backgroundImage: `url(${image.shotUrl})`,
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center center',
    }

  }

  !initialized && getData();

  const dataAvailable = siteData.imageData.length > 0 && siteData.authorData.length;

 return dataAvailable && <div className="BackgroundImage" style={image_style(image)}></div>
}

export default App;