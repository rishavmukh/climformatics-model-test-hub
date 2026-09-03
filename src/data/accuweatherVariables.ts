import type { VariableDef } from '../api/seriesTypes';

/**
 * Fields from AccuWeather's classic dataservice API
 * (dataservice.accuweather.com), confirmed against a live call with a real
 * key rather than docs alone — their developer portal returned a 403 to a
 * plain fetch, so every field/path here was read directly off actual JSON
 * responses from `/forecasts/v1/hourly/12hour/{locationKey}?details=true`
 * and `/forecasts/v1/daily/5day/{locationKey}?details=true`.
 *
 * AccuWeather nests almost everything (`Temperature.Value`, `Wind.Speed.
 * Value`, daily `Day.RelativeHumidity.Average`, etc.) rather than using
 * flat field names — the extraction paths matching these keys live in
 * accuweatherClient.ts, generated from the same source so they can't drift
 * out of sync with each other.
 */
export const ACCUWEATHER_HOURLY_VARIABLES: VariableDef[] = [
  { key: 'temperature', label: 'Temperature', category: 'Temperature' },
  { key: 'realFeelTemperature', label: 'RealFeel temperature', category: 'Temperature' },
  { key: 'realFeelTemperatureShade', label: 'RealFeel temperature (shade)', category: 'Temperature' },
  { key: 'wetBulbTemperature', label: 'Wet bulb temperature', category: 'Temperature' },
  { key: 'wetBulbGlobeTemperature', label: 'Wet bulb globe temperature', category: 'Temperature' },
  { key: 'dewPoint', label: 'Dew point', category: 'Temperature' },
  { key: 'windChillTemperature', label: 'Wind chill temperature', category: 'Temperature' },
  { key: 'heatIndex', label: 'Heat index', category: 'Temperature' },
  { key: 'windSpeed', label: 'Wind speed', category: 'Wind' },
  { key: 'windDirectionDegrees', label: 'Wind direction', category: 'Wind' },
  { key: 'windGustSpeed', label: 'Wind gust speed', category: 'Wind' },
  { key: 'relativeHumidity', label: 'Relative humidity', category: 'Humidity & Moisture' },
  { key: 'indoorRelativeHumidity', label: 'Indoor relative humidity', category: 'Humidity & Moisture' },
  { key: 'visibility', label: 'Visibility', category: 'Cloud Cover & Visibility' },
  { key: 'ceiling', label: 'Cloud ceiling height', category: 'Cloud Cover & Visibility' },
  { key: 'uvIndex', label: 'UV index', category: 'Solar & Radiation' },
  { key: 'uvIndexFloat', label: 'UV index (precise)', category: 'Solar & Radiation' },
  { key: 'precipitationProbability', label: 'Precipitation probability', category: 'Precipitation' },
  { key: 'thunderstormProbability', label: 'Thunderstorm probability', category: 'Precipitation' },
  { key: 'rainProbability', label: 'Rain probability', category: 'Precipitation' },
  { key: 'snowProbability', label: 'Snow probability', category: 'Precipitation' },
  { key: 'iceProbability', label: 'Ice probability', category: 'Precipitation' },
  { key: 'totalLiquid', label: 'Total liquid', category: 'Precipitation' },
  { key: 'rain', label: 'Rain', category: 'Precipitation' },
  { key: 'snow', label: 'Snow', category: 'Precipitation' },
  { key: 'ice', label: 'Ice', category: 'Precipitation' },
  { key: 'cloudCover', label: 'Cloud cover', category: 'Cloud Cover & Visibility' },
  { key: 'evapotranspiration', label: 'Evapotranspiration', category: 'Evapotranspiration' },
  { key: 'solarIrradiance', label: 'Solar irradiance', category: 'Solar & Radiation' },
  { key: 'accuLumenBrightnessIndex', label: 'AccuLumen brightness index', category: 'Solar & Radiation' },
];

export const ACCUWEATHER_DAILY_VARIABLES: VariableDef[] = [
  { key: 'temperatureMin', label: 'Temperature min', category: 'Temperature' },
  { key: 'temperatureMax', label: 'Temperature max', category: 'Temperature' },
  { key: 'realFeelTemperatureMin', label: 'RealFeel temperature min', category: 'Temperature' },
  { key: 'realFeelTemperatureMax', label: 'RealFeel temperature max', category: 'Temperature' },
  { key: 'realFeelTemperatureShadeMin', label: 'RealFeel temperature (shade) min', category: 'Temperature' },
  { key: 'realFeelTemperatureShadeMax', label: 'RealFeel temperature (shade) max', category: 'Temperature' },
  { key: 'hoursOfSun', label: 'Hours of sun', category: 'Solar & Radiation' },
  { key: 'degreeDaysHeating', label: 'Heating degree days', category: 'Evapotranspiration' },
  { key: 'degreeDaysCooling', label: 'Cooling degree days', category: 'Evapotranspiration' },

  { key: 'dayWindSpeed', label: 'Day wind speed', category: 'Wind' },
  { key: 'dayWindDirectionDegrees', label: 'Day wind direction', category: 'Wind' },
  { key: 'dayWindGustSpeed', label: 'Day wind gust speed', category: 'Wind' },
  { key: 'dayTotalLiquid', label: 'Day total liquid', category: 'Precipitation' },
  { key: 'dayRain', label: 'Day rain', category: 'Precipitation' },
  { key: 'daySnow', label: 'Day snow', category: 'Precipitation' },
  { key: 'dayIce', label: 'Day ice', category: 'Precipitation' },
  { key: 'dayCloudCover', label: 'Day cloud cover', category: 'Cloud Cover & Visibility' },
  { key: 'dayEvapotranspiration', label: 'Day evapotranspiration', category: 'Evapotranspiration' },
  { key: 'daySolarIrradiance', label: 'Day solar irradiance', category: 'Solar & Radiation' },
  { key: 'dayRelativeHumidityMin', label: 'Day relative humidity min', category: 'Humidity & Moisture' },
  { key: 'dayRelativeHumidityMax', label: 'Day relative humidity max', category: 'Humidity & Moisture' },
  { key: 'dayRelativeHumidityAverage', label: 'Day relative humidity average', category: 'Humidity & Moisture' },
  { key: 'dayWetBulbTemperatureMin', label: 'Day wet bulb temperature min', category: 'Temperature' },
  { key: 'dayWetBulbTemperatureMax', label: 'Day wet bulb temperature max', category: 'Temperature' },
  { key: 'dayWetBulbTemperatureAverage', label: 'Day wet bulb temperature average', category: 'Temperature' },
  { key: 'dayWetBulbGlobeTemperatureMin', label: 'Day wet bulb globe temperature min', category: 'Temperature' },
  { key: 'dayWetBulbGlobeTemperatureMax', label: 'Day wet bulb globe temperature max', category: 'Temperature' },
  { key: 'dayWetBulbGlobeTemperatureAverage', label: 'Day wet bulb globe temperature average', category: 'Temperature' },
  { key: 'dayUvIndexFloatMin', label: 'Day UV index min', category: 'Solar & Radiation' },
  { key: 'dayUvIndexFloatMax', label: 'Day UV index max', category: 'Solar & Radiation' },
  { key: 'dayPrecipitationProbability', label: 'Day precipitation probability', category: 'Precipitation' },
  { key: 'dayThunderstormProbability', label: 'Day thunderstorm probability', category: 'Precipitation' },
  { key: 'dayRainProbability', label: 'Day rain probability', category: 'Precipitation' },
  { key: 'daySnowProbability', label: 'Day snow probability', category: 'Precipitation' },
  { key: 'dayIceProbability', label: 'Day ice probability', category: 'Precipitation' },
  { key: 'dayHoursOfPrecipitation', label: 'Day hours of precipitation', category: 'Precipitation' },
  { key: 'dayHoursOfRain', label: 'Day hours of rain', category: 'Precipitation' },
  { key: 'dayHoursOfSnow', label: 'Day hours of snow', category: 'Precipitation' },
  { key: 'dayHoursOfIce', label: 'Day hours of ice', category: 'Precipitation' },

  { key: 'nightWindSpeed', label: 'Night wind speed', category: 'Wind' },
  { key: 'nightWindDirectionDegrees', label: 'Night wind direction', category: 'Wind' },
  { key: 'nightWindGustSpeed', label: 'Night wind gust speed', category: 'Wind' },
  { key: 'nightTotalLiquid', label: 'Night total liquid', category: 'Precipitation' },
  { key: 'nightRain', label: 'Night rain', category: 'Precipitation' },
  { key: 'nightSnow', label: 'Night snow', category: 'Precipitation' },
  { key: 'nightIce', label: 'Night ice', category: 'Precipitation' },
  { key: 'nightCloudCover', label: 'Night cloud cover', category: 'Cloud Cover & Visibility' },
  { key: 'nightEvapotranspiration', label: 'Night evapotranspiration', category: 'Evapotranspiration' },
  { key: 'nightSolarIrradiance', label: 'Night solar irradiance', category: 'Solar & Radiation' },
  { key: 'nightRelativeHumidityMin', label: 'Night relative humidity min', category: 'Humidity & Moisture' },
  { key: 'nightRelativeHumidityMax', label: 'Night relative humidity max', category: 'Humidity & Moisture' },
  { key: 'nightRelativeHumidityAverage', label: 'Night relative humidity average', category: 'Humidity & Moisture' },
  { key: 'nightWetBulbTemperatureMin', label: 'Night wet bulb temperature min', category: 'Temperature' },
  { key: 'nightWetBulbTemperatureMax', label: 'Night wet bulb temperature max', category: 'Temperature' },
  { key: 'nightWetBulbTemperatureAverage', label: 'Night wet bulb temperature average', category: 'Temperature' },
  { key: 'nightWetBulbGlobeTemperatureMin', label: 'Night wet bulb globe temperature min', category: 'Temperature' },
  { key: 'nightWetBulbGlobeTemperatureMax', label: 'Night wet bulb globe temperature max', category: 'Temperature' },
  { key: 'nightWetBulbGlobeTemperatureAverage', label: 'Night wet bulb globe temperature average', category: 'Temperature' },
  { key: 'nightUvIndexFloatMin', label: 'Night UV index min', category: 'Solar & Radiation' },
  { key: 'nightUvIndexFloatMax', label: 'Night UV index max', category: 'Solar & Radiation' },
  { key: 'nightPrecipitationProbability', label: 'Night precipitation probability', category: 'Precipitation' },
  { key: 'nightThunderstormProbability', label: 'Night thunderstorm probability', category: 'Precipitation' },
  { key: 'nightRainProbability', label: 'Night rain probability', category: 'Precipitation' },
  { key: 'nightSnowProbability', label: 'Night snow probability', category: 'Precipitation' },
  { key: 'nightIceProbability', label: 'Night ice probability', category: 'Precipitation' },
  { key: 'nightHoursOfPrecipitation', label: 'Night hours of precipitation', category: 'Precipitation' },
  { key: 'nightHoursOfRain', label: 'Night hours of rain', category: 'Precipitation' },
  { key: 'nightHoursOfSnow', label: 'Night hours of snow', category: 'Precipitation' },
  { key: 'nightHoursOfIce', label: 'Night hours of ice', category: 'Precipitation' },
];

export const ACCUWEATHER_CATEGORY_ORDER = [
  'Solar & Radiation',
  'Temperature',
  'Humidity & Moisture',
  'Precipitation',
  'Wind',
  'Cloud Cover & Visibility',
  'Evapotranspiration',
];

export const ACCUWEATHER_DEFAULT_HOURLY_VARIABLES = ['solarIrradiance', 'temperature', 'uvIndex'];
