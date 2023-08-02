import React, { Component } from 'react';
import {Text, StyleSheet} from 'react-native';

const dateStyle = StyleSheet.create({
  clock: {
    fontSize: 100,
    color: 'white',
    opacity: 0.9,
    fontFamily: 'AtkinsonHyperlegible',
  },
  date:{
    fontSize: 45,
    color: 'white',
    opacity: 0.7,
    left: '30%',
    marginTop: '-10%',
    fontFamily: 'AtkinsonHyperlegible',
  },
  box:{
    display: 'flex',
    flexFlow: 'column',
    position: 'absolute',
    bottom: '200px',
    left: '10%',
    textShadow: '0 0 3px #ffffffc9',
    width: 'fit-content',
    transition: 'all 0.3s',
    userSelect: 'none',
  },
})

const SECOND = 1000;

export class ClockAndDate extends Component {
  componentDidMount(){
    this.interval = setInterval(this.update, SECOND);
  }

  componentWillUnmount(){
    clearInterval(this.interval);
  }

  update = this.forceUpdate.bind(this);
  start = new Date();

  render() {
    const date = new Date();

    const formattedHours = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()
    const formattedMinutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()

    return (
      <div className='clock-and-date' style={dateStyle.box}>
        <Text style={dateStyle.clock}>{formattedHours + ':' + formattedMinutes}</Text>
        <Text style={dateStyle.date}>{`${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`}</Text>
      </div>
    );
  }
}
