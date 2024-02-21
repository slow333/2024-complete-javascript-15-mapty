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

class Workout {
  date = new Date();
  id = Date.now()+'';
  constructor(coords, distance, duration) {
    this.coords = coords; // [lat, lng]
    this.distance= distance;
    this.duration = duration;
  }
}
class Running extends Workout {
  type = 'running'
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence; // 분당 걸음 수
    this.calcPace();
  }
  calcPace() {
    // min /km
    this.pace = this.duration / this.distance
    return this.pace;
  }
}
class Cycling extends Workout {
  type = 'cycling'
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain; // meter
    this.calcSpeed();
  }
  calcSpeed() {
    // km/h
    this.speed = this.distance / (this.duration/60);
    return this.speed;
  }
}
// const run1 = new Running([39, -19], 6, 30, 120);
// const cycle1 = new Cycling([28, -44], 29, 55, 333);
// console.log(run1, cycle1)
//////////////////////////////////
// APPLICATION ARCHITECTURE
class App {
  // private variables.
  #map;
  #mapEvent;
  #markerOption = {opacity: 0.8, shadowPaine: 'shadowPane',}
  #workouts = [];

  constructor() {
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
  }
  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this),
           function (err) {
             console.log('위치를 찾을 수 없습니다.');
           });
  }
  _loadMap(position) {
    const {latitude, longitude} = position.coords;
    console.log(`https://www.google.pt/maps/@${latitude},${longitude}`)

    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, 16);

    // L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.#map);

    L.marker(coords).addTo(this.#map)
      .bindPopup(L.popup({
        maxWidth: 300, minWidth: 60, autoClose: false, closeOnClick: false, }))
      .setPopupContent('하루의 시작 </br>🎉🎉🎉')
      .openPopup();

    // handling clicks on map
    this.#map.on('click', this._showForm.bind(this)); // 초기 나의 위치에 마커 설정
  }
  _showForm(mapEv) {
    this.#mapEvent = mapEv;
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden')
  }
  _newWorkout(e) {
    const validInputs = (...input) => input.every(inp => Number.isFinite(inp));
    const allPositive = (...input) => input.every(inp => inp > 0);
    e.preventDefault();

    const type = inputType.value;
    let distance = +inputDistance.value;
    let duration = +inputDuration.value;
    let cadence, elevation, workout;
    const {lat, lng} = this.#mapEvent.latlng;

    if (type === 'running') {
      cadence = +inputCadence.value;
      if(!validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence) )
          return alert('SET positive number');
      workout = new Running([lat, lng], distance,duration, cadence)
    }
    if (type === 'cycling') {
      elevation = +inputElevation.value;
      if(!validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration) )
          return alert('SET number');
      workout = new Cycling([lat, lng], distance,duration, elevation)

    }
    this.#workouts.push(workout);
    console.log(workout)

    const spm = Math.round(+inputDuration.value / +inputCadence.value);
    const onDate = workout.date;
    const dataId = workout.id;
    const month = onDate.getMonth() + 1;
    const day = onDate.getDay();

    const htmlRunning = `
    <li class="workout workout--running" data-id=${dataId}>
      <h2 class="workout__title">Running on ${month}월 ${day}일</h2>
      <div class="workout__details">
        <span class="workout__icon">🏃‍♂️</span>
        <span class="workout__value">${distance}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${duration}</span>
        <span class="workout__unit">min</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${cadence}</span>
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
        <span class="workout__value">${distance}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${duration}</span>
        <span class="workout__unit">min</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${elevation}</span>
        <span class="workout__unit">km/h</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⛰</span>
        <span class="workout__value">223</span>
        <span class="workout__unit">m</span>
      </div>
    </li>
  `;
    if (type === 'running')
      containerWorkouts.insertAdjacentHTML('beforeend', htmlRunning);
    else containerWorkouts.insertAdjacentHTML('beforeend', htmlCycling);

    // clear input fields
    distance = duration = cadence = elevation = '';

    this.renderWorkoutMarker(workout);
  }
  renderWorkoutMarker(workout) {
    L.marker(workout.coords, this.#markerOption)
      .addTo(this.#map)
      .bindPopup(L.popup({
        maxWidth: 300, minWidth: 60, autoClose: false, closeOnClick: false,
        className: `workout--${workout.type}`,
      }))
      .setPopupContent(`${workout.type === 'cycling' ? 
        workout.distance + ' cycling km' : 
        workout.distance + ' running km'}`) // override popup content
      .openPopup();
  }
}

const app = new App();




