import React, { useMemo, useEffect, useState, useRef} from 'react';
import {Text, StyleSheet} from 'react-native';
import { Tooltip } from 'react-tooltip'
import Select from 'react-select'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPause, faForward, faArrowDown, faCog } from '@fortawesome/free-solid-svg-icons'
import './App.css';
import { getAuthors, getImages } from './api/request';
import { addProperties, normalizeData } from '../src/utils/utils';
import './assets/fonts/stylesheet.css';
import { FramedIcon } from './assets/svgIcons';
import { splashScreen } from './components/splashScreen';
import { ClockAndDate } from './components/clock'
import { downloadImage } from './components/imageDownloader';

function App() {
  const [siteData, setSiteData] = useState({ imageData: [], authorData: [] });
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const imageToDisplay = useRef(1)

  //-----Config menu------
  const init_config = useMemo(
    () => {
      return {
      ar_fuzzines: 1,
      ar_filter: {value: 'orientation_filter', label: 'Orientation'},
      change_shoot_every: 30000,
      allow_nsfw: false,
      game_names_filter: '',
      background_color: '#272727',
      zoom_to_fit_ar: true,
      displayed_info: {value: 'shot_info', label: 'Shot Info'},
      scroll_shot: true,
      scroll_speed: 8,
    }},
    []
  );

  const [config, setConfig] = useState(init_config);
  const [dirtyConfigFlag, setDirtyConfigFlag] = useState(false);
  useEffect(() => {
    const storedConfig = JSON.parse(localStorage.getItem('config'))
    if (!storedConfig){
      localStorage.setItem('config', JSON.stringify(init_config));
      setConfig(JSON.parse(localStorage.getItem('config')));
      return;
    }
    setConfig(storedConfig);
  }, [init_config]);

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

  function addCheckbox(value_name, display_name, tooltip, disabledCondition){
    function changeValue(value_name){
      var new_config = config
      new_config[value_name] = !new_config[value_name];
      setConfig(new_config);
      localStorage.setItem('config', JSON.stringify(config));
      setDirtyConfigFlag(true);
    }
    return (<div>
      <input type="checkbox" onChange={() => changeValue(value_name)} defaultChecked={config[value_name]} disabled={disabledCondition}/>
      <label style={{...configStyle, textDecoration: (tooltip === '') ? 'none' : 'underline dotted'}} data-tooltip-id={display_name} data-tooltip-content={tooltip}>{display_name}</label>
      <Tooltip id={display_name} style={tooltipStyle}/>
      </div>)
  }

  function addSlider(value_name, display_name, tooltip, min, max, step, disabledCondition){
    const changeValue = (event) => {
      var new_config = config
      console.log(`changing ${value_name} to ${event.target.value}`);
      new_config[value_name] = event.target.value;
      setConfig(new_config);
      localStorage.setItem('config', JSON.stringify(config));
      setDirtyConfigFlag(true);
    };

    return(<div>
    <input type="range" name={display_name} min={min} max={max} step={step} onMouseUp={changeValue} defaultValue={config[value_name]} disabled={disabledCondition}/>
    <label htmlFor={display_name} style={{...configStyle, textDecoration: (tooltip === '') ? 'none' : 'underline dotted'}} data-tooltip-id={display_name} data-tooltip-content={tooltip}>{display_name}</label>
    <Tooltip id={display_name} style={tooltipStyle}/>
    </div>)
  }

  const [configUpdateTimeout, setConfigUpdateTimeout] = useState(0); // <-- Stores timeout reference
  function addColor(value_name, display_name, disabledCondition){
    const changeValue = (event) => {
      clearTimeout(configUpdateTimeout);
      setConfigUpdateTimeout(
        setTimeout(() => {
          var new_config = config
          console.log(`changing ${value_name} to ${event.target.value}`);
          new_config[value_name] = event.target.value;
          setConfig(new_config);
          localStorage.setItem('config', JSON.stringify(config));
          setDirtyConfigFlag(true);
        }, 300) // <-- Delay config update by 300 milliseconds to avoid blocking the re-rendering by doing so many calls
      );
    };

    return (<div>
      <input type="color" id={display_name} name={display_name} onChange={changeValue} defaultValue={config[value_name]} disabled={disabledCondition}/>
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
      <input type="number" id={'shot-timer-input'} name={'shot-timer-input'} onInput={changeValue} onChange={changeValue} defaultValue={config.change_shoot_every/1000} style={{width: '60px'}}/>
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

  function addARFilterSelector(){
    const options = [
      { value: 'none', label: 'None' },
      { value: 'orientation_filter', label: 'Orientation' },
      { value: 'ar_exclusion_filter', label: 'Aspect Ratio Exclusion' }
    ]

    const handleChange = (value, action) => {
      var new_config = config
      console.log(`changing ar_filter to ${value.value}`);
      new_config.ar_filter = value;
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
            width: '190px',
          }),
          singleValue: provided => ({
            ...provided,
            fontSize: '13px',
          }),
          valueContainer: provided => ({
            ...provided,
            height: '30px',
            width: '190px',
            padding: '0 6px',
          }),
          indicatorsContainer: provided => ({
            ...provided,
            height: '30px',
          }),
        }}
        
        defaultValue={config.ar_filter}
        isClearable={false}
        className='react-select'
        classNamePrefix='select'
        options={options}
        onChange={handleChange}
      />
      <label className='ar-filter-selector-label' id='ar-filter-selector-label' style={{...configStyle, marginTop: '5px', textDecoration: 'underline dotted'}} data-tooltip-id={'ar-filter-selector-label'} data-tooltip-content={'Orientation: Only allow shots in the same orientation as the window.\n Aspect Ratio Exclusion: Only allows shots which aspect ratio is bigger/smaller than \nthe window\'s landscape/portrait aspect ratio.'}>AR Filter</label>
      <Tooltip id={'ar-filter-selector-label'} style={tooltipStyle}/>
    </div>
      )
  }

  function bottomButtons(){
    function switchAndReset(){
      resetSwitchShotInterval()
      switchImage(siteData.imageData)
    }

    const buttonStyle = {
      height: '25px',
      color: '#DBDFD8',
      zIndex: 2,
      cursor: 'pointer',
    }

    const pauseShotButton = (
      <div className='pause-shot-button' id='pause-shot-button' data-tooltip-id={'pause-shot-button'} data-tooltip-content={'Pause current shot from changing'}>
        <FontAwesomeIcon icon={faPause} style={buttonStyle} onClick={() => clearInterval(switchShotInterval)}/>
        <Tooltip id={'pause-shot-button'} style={tooltipStyle}/>
      </div>
    )

    const nextShotButton = (
      <div className='next-shot-button' id='next-shot-button' data-tooltip-id={'next-shot-button'} data-tooltip-content={'Skip current shot and \nrestart the switch shot timer'}>
        <FontAwesomeIcon icon={faForward} style={buttonStyle} onClick={() => switchAndReset()}/>
        <Tooltip id={'next-shot-button'} style={tooltipStyle}/>
      </div>
    )

    const downloadImageButton = (
      <div className='download-shot-button' id='download-shot-button' data-tooltip-id={'download-shot-button'} data-tooltip-content={'Download current shot'}>
        <FontAwesomeIcon icon={faArrowDown} style={buttonStyle} onClick={() => downloadImage(imageToDisplay.current === 1 ? image1 : image2)}/>
        <Tooltip id={'download-shot-button'} style={tooltipStyle}/>
      </div>
    )

    return <div style={{display: 'flex', margin: '10px auto 0px', alignContent: 'space-between', flexWrap: 'wrap', gap: '75px', justifyContent: 'center'}}>
      {pauseShotButton}
      {nextShotButton}
      {downloadImageButton}
    </div>
  }

  const configMenuStyle = {
    position: 'absolute',
    display: 'flex',
    width: '2500px',
    height: 'auto',
    padding: '10px 0px 0px',
    bottom: '5%',
    transition: 'all 0.5s',
  }

  const configContentMenuStyle = {
    height: 'auto',
    padding: '15px 15px 0px',
    bottom: '5%',

    backgroundColor: 'rgba(59, 59, 59, 0.475)',
    borderRadius: '10px 0 0 10px',
    border: '2px solid #DBDFD8',
    boxShadow: '0 0 3px #DBDFD8',
    backdropFilter: 'blur(10px)',
  }

  const displayZoneStyle = {
    position: 'absolute',
    top: '20%',
    left: '70%',
    width: '30%',
    height: '75%',
    transition: 'opacity 0.5s',
  }

  const creditsStyle = {
    color: '#DBDFD8',
    opacity: 0.9,
    fontFamily: 'AtkinsonHyperlegible',
  }

  const cogStyle= {
    height: '25px',
    color: '#DBDFD8',
    position: 'absolute',
    top: 25,
    left: '-50px',

    padding: '10px 15px 10px 10px',
    backgroundColor: 'rgba(59, 59, 59, 0.475)',
    borderRadius: '10px 0 0 10px',
    border: '2px solid #DBDFD8',
    borderRight: '0px',
    backdropFilter: 'blur(10px)',
  }

  const configIconButton = (
    <div className="config-display-zone" style={displayZoneStyle}>
      <div className="config-menu"  style={configMenuStyle}>
        <FontAwesomeIcon icon={faCog} style={cogStyle} class="cog"/>
        <div className="config-menu-content"  style={configContentMenuStyle}>
          <div>
            {addSlider('ar_fuzzines', 'AR fuzzines', 'How different can the aspect ratio of the shots be \ncompared to the screen\'s aspect ratio.', 0.1, 3, 0.1, false)}
            {addARFilterSelector()}
            {addTextInput('game_names_filter', 'Game Names Filter', 'Filter by game name. \nMay include multiples, separated by commas.', 150)}
            {addShotTimerInput()}
            {addTextSelector()}
            {addCheckbox('zoom_to_fit_ar', 'Zoom to fit AR', '', false)}
            {addCheckbox('scroll_shot', 'Scroll zoomed shot', 'Only works if "Zoom to fit AR" option is enabled.', !config.zoom_to_fit_ar)}
            {addSlider('scroll_speed', 'Scroll speed', '', 1, 50, 0.1, !config.zoom_to_fit_ar)}
            {addColor('background_color', 'Background Color', config.zoom_to_fit_ar)}
            {addCheckbox('allow_nsfw', 'Allow NSFW/Spoiler shots', '', false)}
            {bottomButtons()}

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
    </div>
  );

  //-----Data API call------
  function is_same_ar_orientation(ar1, ar2){
    return (ar1 < 1 && ar2 < 1) || (ar1 >= 1 && ar2 >= 1)
  }

  function wider_or_narrower(window_ar, shot_ar){
    if(window_ar > 1) return shot_ar >= window_ar //only accept wider images
    else return shot_ar <= window_ar //only accept narrower images
  }

  const getData = async (config, first_run) => {
    const imagesResponse = await getImages({});
    const authorsResponse = await getAuthors({});

    const normalizedImages = normalizeData(imagesResponse.data._default);
    const normalizedAuthors = normalizeData(authorsResponse.data._default);

    const windowAR = window.innerWidth / window.innerHeight

    const filteredARImages = normalizedImages.filter(image =>
      Math.abs((image.width / image.height) - windowAR) < config.ar_fuzzines &&
      (config.ar_filter.value !== 'orientation_filter'  || is_same_ar_orientation(windowAR, image.width / image.height)) &&
      (config.ar_filter.value !== 'ar_exclusion_filter' || wider_or_narrower(windowAR, image.width / image.height))
    )
    
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
  const [switchShotInterval, setSwitchShotInterval] = useState(null);

  function startSwitchShotInterval(){
    setSwitchShotInterval(setInterval(() => {
      getData(JSON.parse(localStorage.getItem('config')), false)
    }, JSON.parse(localStorage.getItem('config')).change_shoot_every));
  }

  function resetSwitchShotInterval(){
    startSwitchShotInterval()
    clearInterval(switchShotInterval)
  }

  useEffect(() => {
    if (!renderInitialized.current) {
      renderInitialized.current = true

      // you can't have an async useEffect, so usually people create an async function and call it right after
      const getDataAsync = async () => {
        // awaiting for getData to finish
        await getData(JSON.parse(localStorage.getItem('config')), true)
        // putting the setInterval function in a variable so we can clear when the component gets destroy

        startSwitchShotInterval();
      }
      getDataAsync()
    
      // this function gets called on component destroy (not necesserarly useful there but just in case)
      return () => {
        clearInterval(switchShotInterval)
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
      right: '10%',
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
    <div className='clock-wrapper' style={{opacity: config.displayed_info.value === 'clock_and_date' ? '100%' : '0%',  transition: 'opacity 0.5s'}}>
      <ClockAndDate />
    </div>
    {imageToDisplay.current === 1 ? shotInfo(image1) : shotInfo(image2)}
    {configIconButton}
  </div>
}

export default App;