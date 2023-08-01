import React, { useEffect, useState, useRef} from 'react';
import {Text, StyleSheet} from 'react-native';
import './App.css';
import { getAuthors, getImages } from './api/request';
import { addProperties, normalizeData } from '../src/utils/utils';
import './assets/fonts/stylesheet.css';
import { Tooltip } from 'react-tooltip'
import Select from 'react-select'
import { FramedIcon } from './assets/svgIcons';
import { splashScreen } from './components/splashScreen';
import { ClockAndDate } from './components/clock'

function App() {
  const [siteData, setSiteData] = useState({ imageData: [], authorData: [] });
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);

  //-----Config menu------
  var init_config = {
    ar_fuzzines: 1,
    preserve_ar_orientation: true,
    change_shoot_every: 30000,
    allow_nsfw: false,
    game_names_filter: '',
    background_color: '#272727',
    zoom_to_fit_ar: true,
    displayed_info: {value: 'shot_info', label: 'Shot Info'},
    scroll_shot: true,
    scroll_speed: 8,
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

  const configStyle = {
    color: '#DBDFD8',
    fontFamily: 'AtkinsonHyperlegible',
    marginLeft: '4px',
  }

  const tooltipStyle = {
    backgroundColor: "#272727",
    color: '#DBDFD8',
    fontFamily: 'AtkinsonHyperlegible',
    whiteSpace: 'pre-line',
    textAlign: 'center',
  }

  function addCheckbox(value_name, display_name, tooltip){
    function changeValue(value_name){
      var new_config = config
      new_config[value_name] = !new_config[value_name];
      setConfig(new_config);
      localStorage.setItem('config', JSON.stringify(config));
      setDirtyConfigFlag(true);
    }
    return (<div>
      <input type="checkbox" onChange={() => changeValue(value_name)} defaultChecked={config[value_name]}/>
      <label style={{...configStyle, textDecoration: (tooltip === '') ? 'none' : 'underline dotted'}} data-tooltip-id={display_name} data-tooltip-content={tooltip}>{display_name}</label>
      <Tooltip id={display_name} style={tooltipStyle}/>
      </div>)
  }

  function addSlider(value_name, display_name, tooltip, min, max, step){
    const changeValue = (event) => {
      var new_config = config
      console.log(`changing ${value_name} to ${event.target.value}`);
      new_config[value_name] = event.target.value;
      setConfig(new_config);
      localStorage.setItem('config', JSON.stringify(config));
      setDirtyConfigFlag(true);
    };

    return(<div>
    <input type="range" name={display_name} min={min} max={max} step={step} onInput={changeValue} onChange={changeValue} defaultValue={config[value_name]}/>
    <label htmlFor={display_name} style={{...configStyle, textDecoration: (tooltip === '') ? 'none' : 'underline dotted'}} data-tooltip-id={display_name} data-tooltip-content={tooltip}>{display_name}</label>
    <Tooltip id={display_name} style={tooltipStyle}/>
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

  function addTextInput(value_name, display_name, tooltip, width){
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
      <label htmlFor={display_name} style={{...configStyle, textDecoration: (tooltip === '') ? 'none' : 'underline dotted'}} data-tooltip-id={display_name} data-tooltip-content={tooltip}>{display_name}</label>
      <Tooltip id={display_name} style={tooltipStyle}/>
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
      <label htmlFor={'shot-timer-input'} style={{...configStyle, textDecoration: 'underline dotted'}} data-tooltip-id={'shot-timer-input'} data-tooltip-content={'Needs site reload.'}>{`Time between shots (in seconds)`}</label>
      <Tooltip id={'shot-timer-input'} style={tooltipStyle}/>
    </div>)
  }

  function addTextSelector(){
    const options = [
      { value: 'none', label: 'None' },
      { value: 'shot_info', label: 'Shot Info' },
      { value: 'clock_and_date', label: 'Clock and Date' }
    ]

    const handleChange = (value, action) => {
      var new_config = config
      console.log(`changing displayed_info to ${value.value}`);
      new_config.displayed_info = value;
      setConfig(new_config);
      localStorage.setItem('config', JSON.stringify(config));
      setDirtyConfigFlag(true);
    };

    return (
    <div style={{display: 'flex'}}>
      <Select
        styles={{
          option: provided => ({
            ...provided,
            fontSize: '13px',
          }),
          control: provided => ({
            ...provided,
            fontSize: '13px',
            minHeight: '30px',
            height: '30px',
            width: '150px',
          }),
          singleValue: provided => ({
            ...provided,
            fontSize: '13px',
          }),
          valueContainer: provided => ({
            ...provided,
            height: '30px',
            width: '150px',
            padding: '0 6px',
          }),
          indicatorsContainer: provided => ({
            ...provided,
            height: '30px',
          }),
        }}
        
        defaultValue={config.displayed_info}
        isClearable={false}
        className='react-select'
        classNamePrefix='select'
        options={options}
        onChange={handleChange}
      />
      <label className='form-label' style={{...configStyle, marginTop: '5px'}}>Displayed info</label>
    </div>
      )
  }

  const configMenuStyle = {
    position: 'absolute',
    display: 'flex',
    width: '2500px',
    height: 'auto',
    padding: '10px 0px 0px',
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
    transformOrigin: 'top left',
    transform: 'rotate(-90deg)',
    width: '50px',
    marginTop: '200px',
    marginLeft: '5px',
    fontSize: 32,
    color: '#DBDFD8',
    opacity: 0.7,
    fontFamily: 'AtkinsonHyperlegible',
    userSelect: 'none',
    textAlign: 'center',
    zIndex: -1,
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
      <div className="config-menu" onMouseEnter={ (e) => e.target.style.left = 'calc(100% - 365px)'} onMouseLeave={ (e) => e.target.style.left = 'calc(100% - 50px)'} style={configMenuStyle}>
        <div style={configMenuLabel}>Config</div>
        <div>
          {addSlider('ar_fuzzines', 'AR fuzzines', 'How different can the aspect ratio of the shots be \ncompared to the screen\'s aspect ratio.', 0.1, 3, 0.1)}
          {addShotTimerInput()}
          {addTextInput('game_names_filter', 'Game Names Filter', 'Filter by game name. \nMay include multiples, separated by commas.', 150)}
          {addColor('background_color', 'Background Color')}
          {addCheckbox('preserve_ar_orientation', 'Preserve AR orientation', 'Allow vertical shots if the window \nis horizontal and vice-versa.')}
          {addCheckbox('zoom_to_fit_ar', 'Zoom to fit AR', '')}
          {addCheckbox('allow_nsfw', 'Allow NSFW/Spoiler shots', '')}
          {addTextSelector()}
          {addCheckbox('scroll_shot', 'Scroll zoomed shot', 'Only available if "Zoom to fit AR" option is enabled.')}
          {addSlider('scroll_speed', 'Scroll speed', '', 1, 50, 0.1)}

          <div style={{width:'50px', height:'auto', float:'left', margin:'20px 10px 0px 0px', zIndex: 1}}>
            <FramedIcon />
          </div>
          <p style={creditsStyle}>
            Made by <a href='https://twitter.com/originalnicodr' style={{color: 'inherit', textDecoration: 'underline'}} target='_blank' rel='noreferrer'>Originalnicodr</a> using <br/>
            the <a href='https://framedsc.com/HallOfFramed' style={{color: 'inherit', textDecoration: 'underline'}} target='_blank' rel='noreferrer'>HallOfFramed</a> database. <br/>
            © FRAMED. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );

  //-----Data API call------
  function is_same_ar_orientation(ar1, ar2){
    return (ar1 < 1 && ar2 < 1) || (ar1 >= 1 && ar2 >= 1)
  }

  const getData = async (config, first_run) => {
    const imagesResponse = await getImages({});
    const authorsResponse = await getAuthors({});

    const normalizedImages = normalizeData(imagesResponse.data._default);
    const normalizedAuthors = normalizeData(authorsResponse.data._default);

    const windowAR = window.innerWidth / window.innerHeight

    const filteredARImages = normalizedImages.filter(image => Math.abs((image.width / image.height) - windowAR) < config.ar_fuzzines && (!config.preserve_ar_orientation || is_same_ar_orientation(image.width / image.height, windowAR)))
    
    const filteredSpoilerImages = filteredARImages.filter(image => config.allow_nsfw || !image.spoiler)

    const filteredGameNames = config.game_names_filter.toLowerCase().split(',').map(function(item) {
      return item.trim();
    });
    const filteredGameImages = (filteredGameNames === ['']) ? filteredSpoilerImages : filteredSpoilerImages.filter(image => filteredGameNames.some(filterGameName => image.gameName.toLowerCase().includes(filterGameName)))

    const formattedImages = addProperties(filteredGameImages, normalizedAuthors);

    setSiteData({ imageData: formattedImages, authorData: normalizedAuthors});

    if (formattedImages.length === 0) return;

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
  },)

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

  //------Shot Info------
  const textStyles = StyleSheet.create({
    gameTitle: {
      fontSize: 58,
      color: 'white',
      opacity: 0.9,
      fontFamily: 'AtkinsonHyperlegible',
    },
    authorText:{
      fontSize: 32,
      color: 'white',
      opacity: 0.7,
      fontFamily: 'AtkinsonHyperlegible',
    },
    textBox:{
      top: '75%',
      left: '10%',
      visibility: config.displayed_info.value === 'shot_info' ? 'visible' : 'hidden',
      textShadow: '0 0 3px #ffffffc9',
      width: 'fit-content',
      position: 'absolute',
      opacity: config.displayed_info.value === 'shot_info' ? '100%' : '0%',
      transition: 'all 0.3s',
    },
    noShotsFound:{
      fontSize: 50,
      color: 'white',
      opacity: 0.9,
      fontFamily: 'AtkinsonHyperlegible',
      position: 'absolute',
      top: '35%',
      width: '100%',
      textAlign: 'center',
    }
  })

  function shotInfo(image) {
    return (
    <a className="shot-info" style={textStyles.textBox} href={`https://framedsc.com/HallOfFramed/?imageId=${image.epochTime}`} target='_blank' rel='noreferrer'>
      <Text style={textStyles.gameTitle}>{image.gameName}</Text>
      <br></br>
      <Text style={textStyles.authorText}>        shot by {image.author}</Text>
    </a>
    )
  }
  
  //------Shot Component------

  function image_style(image, shouldDisplay){
    const imageAR = image.width / image.height
    const windowAR = window.innerWidth / window.innerHeight
    const match_height = window.innerHeight / image.height
    const match_width = window.innerWidth / image.width

    const desired_zoom = (
      config.zoom_to_fit_ar ?
      (imageAR < windowAR ? match_width : match_height) :
      (imageAR < windowAR ? match_height : match_width)
    )

    const direction = Math.pow(-1 ,imageToDisplay.current)
    const xoffset = !config.zoom_to_fit_ar || !config.scroll_shot ? 0 : direction * (desired_zoom * image.width - window.innerWidth) / 2
    const yoffset = !config.zoom_to_fit_ar || !config.scroll_shot ? 0 : direction * (desired_zoom * image.height - window.innerHeight) / 2

    const scrollTime = (Math.abs(xoffset * 2) + Math.abs(yoffset * 2)) / config.scroll_speed
    
    //Animation update
    if(shouldDisplay){
      document.documentElement.style.setProperty(
        '--xStart',
        `calc(-50% - ${xoffset}px)`
      );
      document.documentElement.style.setProperty(
        '--xEnd',
        `calc(-50% + ${xoffset}px)`
      );
      document.documentElement.style.setProperty(
        '--yStart',
        `calc(-50% - ${yoffset}px)`
      );
      document.documentElement.style.setProperty(
        '--yEnd',
        `calc(-50% + ${yoffset}px)`
      );
      document.documentElement.style.setProperty(
        '--zoom',
        desired_zoom
      );  
    }

    return {
      backgroundImage: `url(${image.shotUrl})`,
      width: image.width,
      height: image.height,
      backgroundSize: 'contain',
      backgroundAttachment: 'fixed',
      backgroundRepeat: 'no-repeat',
      display: 'block', 
      position: 'absolute',
      imageRendering: 'high-quality',
      backgroundPosition: 'center',
      top: '50%',
      left: '50%',
      transform: `translate(-50%, -50%) scale(${desired_zoom})`,
      animationName: 'animated-shot',
      animationDuration: `${scrollTime}s`,
      animationTimingFunction: 'ease-in-out',
      animationIterationCount: 'infinite',
      animationDirection: 'alternate-reverse',
    }
  }

  function imageElement(image, shouldDisplay){
    return(
    <div className="shot-wrapper" style={{opacity: shouldDisplay ? 1 : 0, transition: 'opacity 0.5s'}}>
      <div className="shot-background" style={image_style(image, shouldDisplay)}/>
      <div className= "gradient" style={{backgroundImage: 'radial-gradient(300% 100% at bottom left, rgb(0 0 0 / 40%) 10%, rgb(255 255 255 / 0%) 35%)', position: 'absolute', width: '100%', height: '100%', opacity: config.displayed_info.value !== 'none' ? '100%' : '0%', transition: 'opacity 0.3s'}}/>
    </div>
    )
  }

  //------Missing shots Component------
  if (siteData.imageData.length === 0){
    return <div className="BackgroundImage" style={{background: config.background_color, width: window.innerWidth, height: window.innerHeight}}>
      {splashScreen}
      {<label style={textStyles.noShotsFound}>No matching shots were found. Please check the <br></br>game names filter or increase the AR fuzziness.</label>}
      {configIconButton}
    </div>
  }

  return image1 && image2 && <div className="BackgroundImage" style={{background: config.background_color, width: window.innerWidth, height: window.innerHeight}}>
    {splashScreen}
    {imageElement(image1, imageToDisplay.current === 1)}
    {imageElement(image2, imageToDisplay.current === 2)}
    <div className='clock-wrapper' style={{opacity: config.displayed_info.value === 'clock_and_date' ? '100%' : '0%',}}>
      <ClockAndDate />
    </div>
    {imageToDisplay.current === 1 ? shotInfo(image1) : shotInfo(image2)}
    {configIconButton}
  </div>
}

export default App;