import isType from './isType.js';
import isPrimitiveType from './isPrimitiveType.js';
import isTypedValue from './isTypedValue.js';

import isNil from 'ramda/src/isNil.js';
import is from 'ramda/src/is.js';
import map from 'ramda/src/map.js';
import keys from 'ramda/src/keys.js';
import length from 'ramda/src/length.js';

//    toString : Any -> String
const toString = x => {
  if (isNil(x)) return 'Nil.js';
  if (is(Array, x)) return `[${map(toString, x).join(', ')}]`;
  if (isPrimitiveType(x)) return x.name;
  if (isType(x) || isTypedValue(x)) return x.toString();
  if (is(Object, x)) {
    return length(keys(x)) > 3 ? JSON.stringify(x, null, 2) : JSON.stringify(x);
  }
  return x.toString();
};

export default toString;
