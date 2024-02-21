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

let map, mapEvent;
const popup = () => L.popup({
  content: '<p>안녕하세요!<br />나의 위치</p>',
  maxWidth: 300, minWidth: 60, autoClose: false, className: 'running-popup', closeOnClick: false,
});

class App {
  // private variables.
  #map;
  #mapEvent;
  #popup = () => L.popup({
    content: '<p>안녕하세요!<br />나의 위치</p>',
    maxWidth: 300, minWidth: 60, autoClose: false, className: 'running-popup', closeOnClick: false,
  });
  constructor() {
    this._getPosition();

    form.addEventListener('submit', this._newWorkout);

    inputType.addEventListener('change', function () {
      inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
      inputCadence.closest('.form__row').classList.toggle('form__row--hidden')
    });
  }
  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this),
           function (err) {
             console.log('위치를 찾을 수 없습니다.')
           });
  }
  _loadMap(position) {
    const {latitude, longitude} = position.coords;
    console.log(`https://www.google.pt/maps/@${latitude},${longitude}`)

    const coords = [latitude, longitude];
    console.log(this)
    this.#map = L.map('map').setView(coords, 16);

    // L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.#map);

    L.marker(coords).addTo(this.#map).bindPopup(this.#popup()).openPopup();

    // handling clicks on map
    this.#map.on('click', function (mapEv) {
      this.#mapEvent = mapEv;
      form.classList.remove('hidden');
      inputDistance.focus();
    }); // 초기 나의 위치에 마커 설정
  }
  _showForm() {
  }
  _toggleElevationField() {
  }
  _newWorkout(e) {
    e.preventDefault();
    console.log(this)

    const spm = Math.round(+inputDuration.value / +inputCadence.value);
    const onDate = new Date();
    const dataId = Date.now();
    const month = onDate.getMonth() + 1;
    const day = onDate.getDay();

    const htmlRunning = `
    <li class="workout workout--running" data-id=${dataId}>
      <h2 class="workout__title">Running on ${month}월 ${day}일</h2>
      <div class="workout__details">
        <span class="workout__icon">🏃‍♂️</span>
        <span class="workout__value">${inputDistance.value}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${inputDuration.value}</span>
        <span class="workout__unit">min</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${inputCadence.value}</span>
        <span class="workout__unit">min/km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">🦶🏼</span>
        <span class="workout__value">${spm}</span>
        <span class="workout__unit">spm</span>
      </div>
    </li>
  `;
    const htmlCycling = `
    <li class="workout workout--cycling" data-id=${dataId}>
      <h2 class="workout__title">Cycling on  ${month}월 ${day}일</h2>
      <div class="workout__details">
        <span class="workout__icon">🚴‍♀️</span>
        <span class="workout__value">${inputDistance.value}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${inputDuration.value}</span>
        <span class="workout__unit">min</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${inputCadence.value}</span>
        <span class="workout__unit">km/h</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⛰</span>
        <span class="workout__value">223</span>
        <span class="workout__unit">m</span>
      </div>
    </li>
  `;
    if (inputType.value === 'running')
      containerWorkouts.insertAdjacentHTML('beforeend', htmlRunning);
    else containerWorkouts.insertAdjacentHTML('beforeend', htmlCycling);

    // clear input fields
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';

    const {lat, lng} = this.#mapEvent.latlng;
    L.marker([lat, lng], markerOption)
         .addTo(this.#map)
         .bindPopup(this.#popup())
         .setPopupContent('workout') // override popup content
         .openPopup();
  }
}

const app = new App();




// const markerOption = {opacity: 0.8, shadowPaine: 'shadowPane',}