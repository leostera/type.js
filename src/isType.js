import { $$type, $$value } from './symbols.js';

import is from 'ramda/src/is.js';
import isNil from 'ramda/src/isNil.js';
import length from 'ramda/src/length.js';

/*
 * Helper function to determine if a given value is a user-defined type.
 * It relies on the type/symbols.js module symbols to check for different values
 * being set in the object passed in.
 *
 * Return false as soon as it finds a reason the value is not a type.
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
 *    isType(Bool) === true
 *    isType(Bool.True()) === false
 *    isType(Bool.True) === false
 *    isType(1) === false
 *    isType("Hello!") === false
 *    isType({ [$$type]: "What!" }) === true
 */

//     isType : Any -> Boolean
export default object => {
  // Bail early if the object is null
  if (isNil(object)) return false;

  // Accessors to make the code below more readable
  const value = object[$$value];
  const type = object[$$type];

  // If the type is not set, then this is clearly not a type
  if (isNil(type)) return false;
  if (is(String, type) && length(type) === 0) return false;

  // If we have a value we are probably dealing with a value of a type or a
  // record
  if (!(value === undefined)) return false;

  return true;
};
