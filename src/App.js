import React, { useEffect, useState, useRef} from 'react';
import {Text, StyleSheet} from 'react-native';
import './App.css';
import { getAuthors, getImages } from './api/request';
import { addProperties, normalizeData } from '../src/utils/utils';
import './assets/fonts/stylesheet.css';

function App() {
  const [siteData, setSiteData] = useState({ imageData: [], authorData: [] });
  const [initialized, setInitialized] = useState(false);
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  var config = {
    ar_fuzzines: 0.2,
    allow_narrow_ars: true,
    change_shoot_every: 10000,
    allow_nsfw: true,
    game_name_filter: '',
    background_color: '#272727',
    display_shot_info: true,
    zoom_to_fit_ar: true,
  }

  const getData = async (config, first_run) => {
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

    if (first_run){
      setImage(formattedImages[Math.floor(Math.random() * Math.floor(formattedImages.length - 1))]);
    }


    setIsLoading(true)
    console.log("Loading new shot.")
    const newImage = formattedImages[Math.floor(Math.random() * Math.floor(formattedImages.length - 1))]
    var preloadImage = new Image();
    preloadImage.src = `url(${preloadImage.shotUrl})`;
    preloadImage.addEventListener("load", maybeSwitchImage(newImage));
    
  };
  
  const renderInitialized = useRef(false)

  useEffect(() => {
    if (!renderInitialized.current) {
      renderInitialized.current = true

      let interval
      // you can't have an async useEffect, so usually people create an async function and call it right after
      const getDataAsync = async () => {
        // awaiting for getData to finish
        await getData(config, true)
        // putting the setInterval function in a variable so we can clear when the component gets destroy
        interval = setInterval(() => {
          getData(config, false)
        }, config.change_shoot_every);
      }
      getDataAsync()
    
      // this function gets called on component destroy (not necesserarly useful there but just in case)
      return () => {
        clearInterval(interval)
      }
    }
  }, [])

  const image_style = {
    width: '100%',
    height: window.innerHeight,
    objectFit: config.zoom_to_fit_ar ? 'cover' : 'contain',
    objectPosition: 'center',
    display: 'block', 
  }

  const dataAvailable = siteData.imageData.length > 0 && siteData.authorData.length;

  function maybeSwitchImage(newImage) {
    if (isLoading) return

    console.log("changing image");
    if (image!=newImage){
      setImage(newImage)
    }
    setIsLoading(false)
  }

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
      top: '75%',
      left: '10%',
      display: config.display_shot_info ? 'block' : 'none',
      textShadow: '0 0 3px #DBDFD8',
      width: 'fit-content',
      position: 'absolute',
    },
  })

  return dataAvailable && <div className="BackgroundImage" style={{background: config.background_color, width: window.innerWidth, height: window.innerHeight}}>
    <img src={image.shotUrl}  style={image_style}/>
    <a className="shot-info" style={textStyles.textBox} href={`https://framedsc.com/HallOfFramed/?imageId=${image.epochTime}`} target='_blank'>
      <Text style={textStyles.gameTitle}>{image.gameName}</Text>
      <br></br>
      <Text style={textStyles.authorText}>        by {image.author}</Text>
    </a>
  </div>
}

export default App;