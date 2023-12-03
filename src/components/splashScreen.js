import React from 'react';

const splashScreenStyle = {
  width: '100%',
  height: window.innerHeight,
  objectFit: 'cover',
  objectPosition: 'center',
  display: 'block', 
  position: 'absolute',
  zIndex: 1,
  animation: 'splashScreen .3s 1.5s cubic-bezier(.22,.61,.36,1) forwards',
}

export const splashScreen = <img src={require('../assets/Wallpaper-1.png')} style={splashScreenStyle} alt=''></img>
