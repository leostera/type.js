import isType from 'type/isType';
import isPrimitiveType from 'type/isPrimitiveType';
import isTypedValue from 'type/isTypedValue';

import isNil from 'ramda/src/isNil';
import is from 'ramda/src/is';
import map from 'ramda/src/map';
import keys from 'ramda/src/keys';
import length from 'ramda/src/length';

//    toString : Any -> String
const toString = x => {
  if (isNil(x)) return 'Nil';
  if (is(Array, x)) return `[${map(toString, x).join(', ')}]`;
  if (isPrimitiveType(x)) return x.name;
  if (isType(x) || isTypedValue(x)) return x.toString();
  if (is(Object, x)) {
    return length(keys(x)) > 3 ? JSON.stringify(x, null, 2) : JSON.stringify(x);
  }
  return x.toString();
};

export default toString;
