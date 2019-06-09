// Just move temporarily

/***** [BEGIN] Display Map from TomTom Map API *****/
const script = document.createElement('script');
//script.src = '../public/sdk/tomtom.min.js';
script.src = process.env.PUBLIC_URL + '/sdk/tomtom.min.js';
document.body.appendChild(script);
script.async = true;
script.onload = function () {
  window.tomtom.L.map('map', {
    source: 'vector',
    key: "zzfvLaj8kWBmYRPl6rJqxpiKqKW91AV4",   // API-KEY sample
    //key: MAP_API_KEY,
    //key: '<your-api-key>',
    center: [37.769167, -122.478468],
    basePath: '/sdk',
    zoom: 15
  });
}
/***** [END] Display Map from TomTom Map API *****/
