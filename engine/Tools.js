export function shallow(obj, depth = 1) {
  var newObj;
  if ( typeof obj === "object" ) {
    newObj = {};
    Object.keys(obj).forEach(key => {
      if (obj.hasOwnProperty(key)) {
        if ( depth > 1 && typeof obj[key] ) {
          newObj[key] = shallow(obj[key], depth - 1);
        } else {
          newObj[key] = obj[key];
        }
      }
    });
  } else if ( typeof obj === "array" ) {
    console.log("Arrays aren't copied yet");
    newObj = [];
  } else if ( typeof obj === "string" ) {
    newObj = (' ' + obj).slice(1);
  }
  return newObj;
}