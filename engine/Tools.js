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
  } else if ( Array.isArray(obj) ) {
    newObj = [];
    obj.forEach(ele => newObj.push(depth > 1 ? shallow(ele, depth - 1) : ele));
  } else if ( typeof obj === "string" ) {
    newObj = (' ' + obj).slice(1);
  } else {
    newObj = obj;
  }
  return newObj;
}