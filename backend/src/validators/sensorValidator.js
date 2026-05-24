const SENSOR_RANGES = {
  soil:     [0, 100],
  temp_dht: [-40, 85],
  temp_ds:  [-55, 125],
  humidity: [0, 100],
};

function validateSensorBody(body) {
  const { soil, temp_dht, temp_ds, humidity, relay, mode } = body;


  if ([soil, temp_dht, temp_ds, humidity].every(v => v === undefined || v === null)) {
    return { valid: false, error: 'At least one sensor field required (soil, temp_dht, temp_ds, humidity)' };
  }


  for (const [field, [min, max]] of Object.entries(SENSOR_RANGES)) {
    const val = body[field];
    if (val !== undefined && val !== null) {
      const num = parseFloat(val);
      if (isNaN(num) || num < min || num > max) {
        return { valid: false, error: `${field} must be a number between ${min} and ${max}` };
      }
    }
  }

  if (relay !== undefined && relay !== null && ![0, 1].includes(Number(relay))) {
    return { valid: false, error: 'relay must be 0 or 1' };
  }

  if (mode !== undefined && mode !== null && !['AUTO', 'MANUAL'].includes(mode)) {
    return { valid: false, error: 'mode must be AUTO or MANUAL' };
  }

  return { valid: true };
}

module.exports = { validateSensorBody };
