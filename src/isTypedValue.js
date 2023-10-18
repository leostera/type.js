import isNil from 'ramda/src/isNil.js';

import { $$type, $$value, $$constructor } from './symbols.js';

/*
 * Helper function to determine if a given value is a typed value.
 *
 * It relies on the type/symbols.js module symbols to check for different values
 * being set in the object passed in.
 *
 * Return false as soon as it finds a reason the value is not a typed value.
 *
 * Sample usage:
 *
 *    const Bool = Type({
 *      typeName: 'Bool',
 *      constructors: [
 *        { name: 'True', arity: 0 },
 *        { name: 'False', arity: 0 },
 *      ],
 *    });
 *
 *    isTypedValue(Bool) === false
 *    isTypedValue(Bool.True()) === true
 *    isTypedValue(Bool.True) === false
 *    isTypedValue(1) === false
 *    isTypedValue("Hello!") === false
 *    isTypedValue({ [$$type]: "What!" }) === false
 */

//     isTypedValue : Any -> Boolean
export default object => {
  // Bail early if the object is null
  if (isNil(object)) return false;

  // Accessors to make the code below more readable
  const value = object[$$value];
  const type = object[$$type];
  const constructor = object[$$constructor];
  if (isNil(type) || isNil(constructor) || value === undefined) return false;
  return true;
};
