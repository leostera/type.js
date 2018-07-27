import isNil from 'ramda/src/isNil';
import any from 'ramda/src/any';
import or from 'ramda/src/or';

/*
 * Helper function to determine whether a type is one of the 7 native primitive
 * types that come built into Javascript.
 *
 * Granted, Promise and Symbol sometimes need to be polyfilled, but in general
 * we can treat them as built-ins.
 */

//    isPrimitiveType = Type -> Bool
const isPrimitiveType = type => {
  // Bail early if no name property is found
  if (isNil(type) || isNil(type.name)) return false;

  // Proceed checking for all types
  const isArray = type.name === 'Array' && type === Array;
  const isBoolean = type.name === 'Boolean' && type === Boolean;
  const isNumber = type.name === 'Number' && type === Number;
  const isObject = type.name === 'Object' && type === Object;
  const isPromise = type.name === 'Promise' && type === Promise;
  const isString = type.name === 'String' && type === String;
  const isSymbol = type.name === 'Symbol' && type === Symbol;
  const isFunction = type.name === 'Function' && type === Function;

  // If any of these is true, return true
  return any(or(false), [
    isArray,
    isBoolean,
    isNumber,
    isObject,
    isPromise,
    isString,
    isSymbol,
    isFunction,
  ]);
};

export default isPrimitiveType;
