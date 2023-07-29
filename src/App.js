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
    const storedConfig = JSON.parse(localStorage.getItem('config'))
    if (!storedConfig){
      localStorage.setItem('config', JSON.stringify(config));
      setConfig(JSON.parse(localStorage.getItem('config')));
      return;
    }
    setConfig(storedConfig);
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
      <label htmlFor={display_name} style={configStyle}> {display_name}</label>
    </div>)
  }

  function addTextInput(value_name, display_name, width){
    const changeValue = (event) => {
      var new_config = config
      console.log(`changing ${value_name} to ${event.target.value}`);
      new_config[value_name] = event.target.value;
      setConfig(new_config);
      localStorage.setItem('config', JSON.stringify(config));
      setDirtyConfigFlag(true);
    };

    return (<div>
      <input type="text" id={display_name} name={display_name} onInput={changeValue} onChange={changeValue} defaultValue={config[value_name]} style={{width: width}}/>
      <label htmlFor={display_name} style={configStyle}> {display_name}</label>
    </div>)
  }

  function addShotTimerInput(){
    const changeValue = (event) => {
      var new_config = config
      console.log(`changing change_shoot_every to ${event.target.value * 1000}`);
      new_config.change_shoot_every = event.target.value * 1000;
      setConfig(new_config);
      localStorage.setItem('config', JSON.stringify(config));
      setDirtyConfigFlag(true);
    };

    return (<div>
      <input type="text" id={'shot-timer-input'} name={'shot-timer-input'} onInput={changeValue} onChange={changeValue} defaultValue={config.change_shoot_every/1000} style={{width: '40px'}}/>
      <label htmlFor={'shot-timer-input'} style={configStyle}> {`Seconds between shots`}</label>
    </div>)
  }

  const configMenuStyle = {
    position: 'absolute',
    display: 'flex',
    width: '2500px',
    height: 'auto',
    padding: '10px 0px',
    bottom: '5%',
    left: 'calc(100% - 50px)',
    transition: 'left 0.5s',
    backgroundColor: 'rgba(59, 59, 59, 0.475)',
    borderRadius: '10px',
    border: '2px solid #DBDFD8',
    boxShadow: '0 0 3px #DBDFD8',
    backdropFilter: 'blur(10px)',
  }

  const configMenuLabel = {
    transformOrigin: '0 0',
    transform: 'rotate(-90deg)',
    width: '50px',
    marginTop: '175px',
    marginLeft: '5px',
    fontSize: 32,
    color: '#DBDFD8',
    opacity: 0.7,
    fontFamily: 'AtkinsonHyperlegible',
    userSelect: 'none',
  }

  const displayZoneStyle = {
    position: 'absolute',
    top: '20%',
    left: '50%',
    width: '50%',
    height: '80%',
    transition: 'opacity 0.5s',
  }

  const creditsStyle = {
    color: '#DBDFD8',
    opacity: 0.9,
    fontFamily: 'AtkinsonHyperlegible',
  }

  const configIconButton = (
    <div className="display-zone" onMouseEnter={ (e) => e.target.style.opacity = '100%'} onMouseLeave={ (e) => e.target.style.opacity = '0%'} style={displayZoneStyle}>
      <div className="config-menu" onMouseEnter={ (e) => e.target.style.left = 'calc(100% - 360px)'} onMouseLeave={ (e) => e.target.style.left = 'calc(100% - 50px)'} style={configMenuStyle}>
        <div style={configMenuLabel}>Config</div>
        <div>
          {addSlider('ar_fuzzines', 'AR fuzzines', 0, 1, 0.01)}
          {addShotTimerInput()}
          {addTextInput('game_name_filter', 'Game Name Filter', 150)}
          {addColor('background_color', 'Background Color')}
          {addCheckbox('allow_narrow_ars', 'Allow narrow AR shots')}
          {addCheckbox('zoom_to_fit_ar', 'Zoom to fit AR')}
          {addCheckbox('display_shot_info', 'Display shot info')}
          {addCheckbox('allow_nsfw', 'Allow NSFW/Spoiler shots')}
          <p style={creditsStyle}>
            Made by <a href='https://twitter.com/originalnicodr' style={{color: 'inherit', textDecoration: 'underline'}} target='_blank'>Originalnicodr</a> using <br/>
            the <a href='https://framedsc.com/HallOfFramed' style={{color: 'inherit', textDecoration: 'underline'}} target='_blank'>HallOfFramed</a> database. <br/>
            © FRAMED. All rights reserved.
          </p>
        </div>
      </div>
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