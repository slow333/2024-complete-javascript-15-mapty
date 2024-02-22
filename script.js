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
  clicks = 0;
  constructor(coords, distance, duration) {
    this.coords = coords; // [lat, lng]
    this.distance= distance;
    this.duration = duration;
  }
  click() {
    this.clicks++
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
  #mapZoomLevel = 15
  #mapEvent;
  #markerOption = {opacity: 0.8, shadowPaine: 'shadowPane',}
  #workouts = [];

  constructor() {
    // get users positions
    this._getPosition();
    // Get data.from local storage
    this._getLocalStorage();
    // Attach event handlers
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this))
  }
  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this),
           (err) => console.log('위치를 찾을 수 없습니다.'));
  }
  _loadMap(position) {
    const {latitude, longitude} = position.coords;
    console.log(`https://www.google.pt/maps/@${latitude},${longitude}`)

    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

    // L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.#map);

    L.marker(coords).addTo(this.#map)
      .bindPopup(L.popup({ autoClose: false, closeOnClick: false, }))
      .setPopupContent('하루의 시작 </br>🎉🎉🎉')
      .openPopup();

    // handling clicks on map
    this.#map.on('click', this._showForm.bind(this)); // 초기 나의 위치에 마커 설정

    this.#workouts.forEach(workout => {
      this._renderWorkoutMarker(workout);
    })
  }
  _showForm(mapEv) {
    this.#mapEvent = mapEv;
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  _hideForm() {
    // Empty inpus
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => form.style.display = 'grid', 1000)
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
    console.log(this.#workouts)

    this._renderWorkout(workout);
    this._renderWorkoutMarker(workout);
    // Hide form and clear input fields
    this._hideForm();
    // localstorage
    this._setLocalStorage();
  }

  _renderWorkout(workout) {
    const workDate = new Date(workout.date)
    let html = `
      <li class='workout workout--${workout.type}' data-id=${workout.id}>
        <h2 class="workout__title">Running on ${months.at(workDate.getMonth())} ${workDate.getDate()}</h2>
        <div class="workout__details">
          <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>
    `;
    if (workout.type === 'running') {
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.pace.toFixed(1)}</span>
          <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🦶🏼</span>
          <span class="workout__value">${workout.cadence}</span>
          <span class="workout__unit">spm</span>
        </div>
      </li>
    `;
    }
    if (workout.type === 'cycling') {
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.speed.toFixed(1)}</span>
          <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⛰</span>
          <span class="workout__value">${workout.elevationGain}</span>
          <span class="workout__unit">m</span>
        </div>
      </li>
    `;
    }
    // containerWorkouts.insertAdjacentHTML('beforeend', html);
    form.insertAdjacentHTML('afterend', html);
  }
  _renderWorkoutMarker(workout) {
    L.marker(workout.coords, this.#markerOption)
      .addTo(this.#map)
      .bindPopup(L.popup({
        maxWidth: 300, minWidth: 60, autoClose: false, closeOnClick: false,
        className: `workout--${workout.type}`,
      }))
      .setPopupContent(`${workout.type === 'cycling' ? 
         '🚴‍♀️ ' + workout.distance + ' km cycling' :
         '🏃‍♂️ ' + workout.distance + ' km running'}`) // override popup content
      .openPopup();
  }
  _moveToPopup(e) {
    const workoutEl = e.target.closest('.workout');
    if(!workoutEl) return;

    const workout = this.#workouts.find(work => work.id === workoutEl.dataset.id);

    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1
      }
    });
    // using the public interface
    // workout.click();  ==> localstorage에 저장해서 불러오면 prototype을 복구못함(함수를 복구하지 못함 방법은 있음)
  }
  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts))
  }
  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));
    console.log(data)
    if(!data) return;

    this.#workouts = data;
    this.#workouts.forEach(workout => {
      this._renderWorkout(workout);
    })
  }
  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}

const app = new App();

// edit, delete, sort workout
// show all workouts on the map
// draw lines and shapes instead of just points