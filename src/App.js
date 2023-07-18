import React, { useState} from 'react';
import {Text, StyleSheet} from 'react-native';
import './App.css';
import { getAuthors, getImages } from './api/request';
import { addProperties, normalizeData } from '../src/utils/utils';
import './assets/fonts/stylesheet.css';

function App() {
  const [siteData, setSiteData] = useState({ imageData: [], authorData: [] });
  const [initialized, setInitialized] = useState(false);
  const [image, setImage] = useState(null);

  var config = {
    ar_fuzzines: 0.2,
    allow_narrow_ars: true,
    change_shoot_every: 300,
    allow_nsfw: true,
    game_name_filter: '',
    background_color: '#272727',
    display_shot_info: true,
    zoom_to_fit_ar: true,
  }

  const getData = async (config) => {
    setInitialized(true);

    const imagesResponse = await getImages({});
    const authorsResponse = await getAuthors({});

    const normalizedImages = normalizeData(imagesResponse.data._default);
    const normalizedAuthors = normalizeData(authorsResponse.data._default);

    const windowAR = window.innerWidth / window.innerHeight 

    const filteredARImages = normalizedImages.filter(image => Math.abs((image.width / image.height) - windowAR) < config.ar_fuzzines && (config.allow_narrow_ars || (image.width / image.height) < windowAR))
    const filteredSpoilerImages = filteredARImages.filter(image => config.allow_nsfw || !image.spoiler)
    const filteredGameImages = filteredSpoilerImages.filter(image => image.gameName.toLowerCase().includes(config.game_name_filter.toLowerCase()))

    const formattedImages = addProperties(filteredGameImages, normalizedAuthors);

    setSiteData({ imageData: formattedImages, authorData: normalizedAuthors});

    setImage(formattedImages[Math.floor(Math.random() * Math.floor(formattedImages.length - 1))]);
  };

  const image_style = (image) => {
    return {
      background: config.background_color,
      backgroundImage: `url(${image.shotUrl})`,
      backgroundSize: config.zoom_to_fit_ar ? 'cover' : 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center center',
    }
  }

  !initialized && getData(config);

  const dataAvailable = siteData.imageData.length > 0 && siteData.authorData.length;

  function switchImage() {
      console.log("test")
      return setImage(siteData.imageData[Math.floor(Math.random() * Math.floor(siteData.imageData.length - 1))])
  }

  //dataAvailable && setInterval(switchImage(), config.change_shoot_every)

  const textStyles = StyleSheet.create({
    gameTitle: {
      fontSize: 58,
      color: '#DBDFD8',
      opacity: 0.9,
      fontFamily: 'AtkinsonHyperlegible',
    },
    authorText:{
      fontSize: 32,
      color: '#DBDFD8',
      opacity: 0.7,
      fontFamily: 'AtkinsonHyperlegible',
    },
    textBox:{
      marginLeft: `${window.innerWidth / 10}px`,
      marginTop: `${(window.innerHeight / 3)*2.3}px`,
      display: config.display_shot_info ? 'block' : 'none',
      textShadow: '0 0 3px #DBDFD8',
      width: 'fit-content',
    },
  })

  return dataAvailable && <div className="BackgroundImage" style={image_style(image)}>
    <a className="shot-info" style={textStyles.textBox} href={`https://framedsc.com/HallOfFramed/?imageId=${image.epochTime}`} target='_blank'>
      <Text style={textStyles.gameTitle}>{image.gameName}</Text>
      <br></br>
      <Text style={textStyles.authorText}>        by {image.author}</Text>
    </a>
  </div>
}

export default App;