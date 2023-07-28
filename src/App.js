import React, { useContext, createContext, useEffect, useState, useRef} from 'react';
import {Text, StyleSheet} from 'react-native';
import './App.css';
import { getAuthors, getImages } from './api/request';
import { addProperties, normalizeData } from '../src/utils/utils';
import './assets/fonts/stylesheet.css';

function App() {
  const [siteData, setSiteData] = useState({ imageData: [], authorData: [] });
  const [initialized, setInitialized] = useState(false);
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);

  var init_config = {
    ar_fuzzines: 0.2,
    allow_narrow_ars: true,
    change_shoot_every: 10000,
    allow_nsfw: true,
    game_name_filter: '',
    background_color: '#272727',
    display_shot_info: true,
    zoom_to_fit_ar: true,
  }

  const [config, setConfig] = useState(init_config);
  const [dirtyConfigFlag, setDirtyConfigFlag] = useState(false);
  useEffect(() => {
    console.log("leyendo config")
    const storedConfig = JSON.parse(localStorage.getItem('config'))
    if (!storedConfig){
      localStorage.setItem('config', JSON.stringify(config));
      setConfig(JSON.parse(localStorage.getItem('config')));
      return;
    }
    setConfig(storedConfig);
    console.log(storedConfig)
  }, []);

  useEffect(() => {
      setDirtyConfigFlag(false);
  }, [dirtyConfigFlag]);

  const configStyle = { color: '#DBDFD8',
    fontFamily: 'AtkinsonHyperlegible',
  }

  function addCheckbox(value_name, display_name){
    function changeValue(value_name){
      var new_config = config
      new_config[value_name] = !new_config[value_name];
      setConfig(new_config);
      localStorage.setItem('config', JSON.stringify(config));
      setDirtyConfigFlag(true);
    }
    return (<div>
      <input type="checkbox" onChange={() => changeValue(value_name)} defaultChecked={config[value_name]}/>
      <label style={configStyle}>{display_name}</label>
      </div>)
  }

  function addSlider(value_name, display_name, min, max, step){
    const changeValue = (event) => {
      var new_config = config
      console.log(`changing ${value_name} to ${event.target.value}`);
      new_config[value_name] = event.target.value;
      setConfig(new_config);
      localStorage.setItem('config', JSON.stringify(config));
      setDirtyConfigFlag(true);
    };

    return(<div>
    <input type="range" id="volume" name={display_name} min={min} max={max} step={step} onInput={changeValue} onChange={changeValue} defaultValue={config[value_name]}/>
    <label htmlFor={display_name} style={configStyle}>{display_name}</label>
    </div>)
  }

  function addColor(value_name, display_name){
    const changeValue = (event) => {
      var new_config = config
      console.log(`changing ${value_name} to ${event.target.value}`);
      new_config[value_name] = event.target.value;
      setConfig(new_config);
      localStorage.setItem('config', JSON.stringify(config));
      setDirtyConfigFlag(true);
    };

    return (<div>
      <input type="color" id={display_name} name={display_name} onInput={changeValue} onChange={changeValue} defaultValue={config[value_name]}/>
      <label htmlFor={display_name} style={configStyle}>{display_name}</label>
    </div>)
  }

  function addTextInput(value_name, display_name){
    const changeValue = (event) => {
      var new_config = config
      console.log(`changing ${value_name} to ${event.target.value}`);
      new_config[value_name] = event.target.value;
      setConfig(new_config);
      localStorage.setItem('config', JSON.stringify(config));
      setDirtyConfigFlag(true);
    };

    return (<div>
      <input type="text" id={display_name} name={display_name} onInput={changeValue} onChange={changeValue} defaultValue={config[value_name]}/>
      <label htmlFor={display_name} style={configStyle}>{display_name}</label>
    </div>)
  }




  const configIconButton = (
    <div className={"config-icon"} style={{position: 'absolute', top: '70%', left: '80%',}}>
      {addSlider('ar_fuzzines', 'AR fuzzines', 0, 1, 0.01)}
      {addSlider('change_shoot_every', `Change shot every ${Math.trunc(config.change_shoot_every/1000)} seconds`, 10000, 3600000, 500)}
      {addTextInput('game_name_filter', 'Game Name Filter')}
      {addColor('background_color', 'Background Color')}
      {addCheckbox('allow_narrow_ars', 'Allow narrow AR shots')}
      {addCheckbox('zoom_to_fit_ar', 'Zoom to fit AR')}
      {addCheckbox('display_shot_info', 'Display shot info')}
      {addCheckbox('allow_nsfw', 'Allow NSFW/Spoiler shots')}
    </div>
  );


  const getData = async (config, first_run) => {
    setInitialized(true);

    const imagesResponse = await getImages({});
    const authorsResponse = await getAuthors({});

    const normalizedImages = normalizeData(imagesResponse.data._default);
    const normalizedAuthors = normalizeData(authorsResponse.data._default);

    const windowAR = window.innerWidth / window.innerHeight 

    const filteredARImages = normalizedImages.filter(image => Math.abs((image.width / image.height) - windowAR) < config.ar_fuzzines && (!config.allow_narrow_ars || (image.width / image.height) < windowAR))
    const filteredSpoilerImages = filteredARImages.filter(image => config.allow_nsfw || !image.spoiler)
    const filteredGameImages = filteredSpoilerImages.filter(image => image.gameName.toLowerCase().includes(config.game_name_filter.toLowerCase()))

    const formattedImages = addProperties(filteredGameImages, normalizedAuthors);

    setSiteData({ imageData: formattedImages, authorData: normalizedAuthors});

    if (first_run){
      setImage1(formattedImages[Math.floor(Math.random() * Math.floor(formattedImages.length - 1))]);
      setImage2(formattedImages[Math.floor(Math.random() * Math.floor(formattedImages.length - 1))]);
      return;
    }

    switchImage(formattedImages);
  };
  
  const renderInitialized = useRef(false)
  const imageToDisplay = useRef(1)

  useEffect(() => {
    if (!renderInitialized.current) {
      renderInitialized.current = true

      let interval
      // you can't have an async useEffect, so usually people create an async function and call it right after
      const getDataAsync = async () => {
        // awaiting for getData to finish
        await getData(JSON.parse(localStorage.getItem('config')), true)
        // putting the setInterval function in a variable so we can clear when the component gets destroy

        interval = setInterval(() => {
          getData(JSON.parse(localStorage.getItem('config')), false)
        }, JSON.parse(localStorage.getItem('config')).change_shoot_every);
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
    position: 'absolute',
  }

  const dataAvailable = siteData.imageData.length > 0 && siteData.authorData.length;

  function switchImage(imageData) {
    if(imageToDisplay.current === 1){
      imageToDisplay.current = 2
      setImage1(imageData[Math.floor(Math.random() * Math.floor(imageData.length - 1))]);
    }
    else if (imageToDisplay.current === 2){
      imageToDisplay.current = 1
      setImage2(imageData[Math.floor(Math.random() * Math.floor(imageData.length - 1))]);
    }
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

  function imageElement(image, shouldDisplay){
    return(<div className="shot-background" style={{opacity: shouldDisplay ? 1 : 0, visibility: shouldDisplay ? 'visible' : 'hidden', transition: 'visibility 0.5s, opacity 0.5s'}}>
    <img src={image.shotUrl}  style={image_style}/>
      <a className="shot-info" style={textStyles.textBox} href={`https://framedsc.com/HallOfFramed/?imageId=${image.epochTime}`} target='_blank'>
        <Text style={textStyles.gameTitle}>{image.gameName}</Text>
        <br></br>
        <Text style={textStyles.authorText}>        by {image.author}</Text>
      </a>
    </div>
    )
  }

  return dataAvailable && <div className="BackgroundImage" style={{background: config.background_color, width: window.innerWidth, height: window.innerHeight}}>
    {imageElement(image1, imageToDisplay.current === 1)}
    {imageElement(image2, imageToDisplay.current === 2)}
    {configIconButton}
  </div>
}

export default App;