'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
// leafletjs.com ==> api

if (navigator.geolocation)
  navigator.geolocation.getCurrentPosition(
       function (position) {
         const {latitude, longitude} = position.coords;
         console.log(`https://www.google.pt/maps/@${latitude},${longitude}`)

         const coords = [latitude, longitude];
         const map = L.map('map').setView(coords, 16);
         console.log(map)

         console.log(map)
         // L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
         L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
           attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
         }).addTo(map);

         L.marker(coords).addTo(map)
              .bindPopup('나의 위치는 <br> 지금 여기 입니다.')
              .openPopup();
         map.on('click', function (mapEv) {
           console.log(mapEv)
         });
       },
       function (err) {
         console.log('위치를 찾을 수 없습니다.')
       });

