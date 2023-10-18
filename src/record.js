import err from './err.js';
import isPrimitiveType from './isPrimitiveType.js';
import isType from './isType.js';
import isTypedValue from './isTypedValue.js';
import toString from './toString.js';
import { $$type, $$constructor, $$value } from './symbols.js';

import all from 'ramda/src/all.js';
import and from 'ramda/src/and.js';
import compose from 'ramda/src/compose.js';
import concat from 'ramda/src/concat.js';
import converge from 'ramda/src/converge.js';
import difference from 'ramda/src/difference.js';
import forEach from 'ramda/src/forEach.js';
import fromPairs from 'ramda/src/fromPairs.js';
import head from 'ramda/src/head.js';
import is from 'ramda/src/is.js';
import isEmpty from 'ramda/src/isEmpty.js';
import isNil from 'ramda/src/isNil.js';
import join from 'ramda/src/join.js';
import keys from 'ramda/src/keys.js';
import lensPath from 'ramda/src/lensPath.js';
import map from 'ramda/src/map.js';
import sortBy from 'ramda/src/sortBy.js';
import tail from 'ramda/src/tail.js';
import toLower from 'ramda/src/toLower.js';
import toPairs from 'ramda/src/toPairs.js';
import toUpper from 'ramda/src/toUpper.js';
import unless from 'ramda/src/unless.js';
import zip from 'ramda/src/zip.js';

const capitalize = unless(
  isNil,
  converge(concat, [compose(toUpper, head), compose(toLower, tail)])
);


/*
 * Record Types creation utility.
 *
 * The main function to create new type objects that help you:
 *
 *  1. Verify the shape of an object
 *  2. Verify the types of all attributes
 *  3. Access the objects properties in an immutable way with lenses
 *
 * Find below some type definitions that make understanding the code below
 * less confusing:
 *
 * type Record : {
 *  [$$type] : recordName             -- Internal name of the type
 *  [Symbol.toStringTag] : 'Type'     -- Internal JS compatibility
 *  toString: () -> String            -- String representation of the Record
 *
 *  is : Any -> Bool                           -- check if a value is of this type
 *  lenses : Object { [attribute]: Lens }      -- collection of lenses to use
 *                                                with values of this type
 *  of : Any -> TypedValue (throws TypeError)  -- creator of values of this type
 * }
 *
 * type Type = UserType | PrimitiveType
 *
 * type Shape : {
 *    [key] : Type | [ Type ]
 * }
 *
 * type RecordDefinition : {
 *   recordName : String        -- The name of the record
 *   shape : Shape              -- The shape of the record
 * }
 *
 * type TypedValue : {
 *   [$$constructor] : recordName   -- Internal name of the value's constructor
 *   [$$type] : recordName          -- Internal name of the value's type
 *   [$$value] : Any                -- An object following the Record's Shape
 *   [Symbol.toStringTag]: String   -- Internal JS compatibility
 * }
 *
 * The idea behind records is better explained in ADR 013 in this repository.
 *
 */

//    isListTypeSyntaxShortcut : Type -> Bool
const isListTypeSyntaxShortcut = type => {
  if (is(Array, type) && type.length === 1) {
    const t = head(type);
    if (!isNil(t) && (isPrimitiveType(t) || isType(t))) return true;
  }
  return false;
};

//    isAllTypeList : [Any] -> Bool
const isAllTypeList = list => {
  if (is(Array, list)) {
    return all(
      and(true),
      map(value => isType(value) || isPrimitiveType(value), list),
    );
  }
  return false;
};

//    getValueType : Any -> Type
const getValueType = value => {
  if (isTypedValue(value)) return value[$$type];
  if (is(Array, value)) return toString(map(getValueType, value));
  return capitalize(typeof value);
};

//    getPropertyTypeName : Type -> String
const getPropertyTypeName = type => {
  if (isListTypeSyntaxShortcut(type)) {
    return `[${getPropertyTypeName(type[0])}]`;
  }
  return isPrimitiveType(type) ? type.name : type[$$type];
};

//    printShape : (String, String) -> [ Shape ] -> String
const printShape = (separator, padding) =>
  compose(
    join(separator),
    map(([k, v]) => `${padding}${k} : ${v}`),
    map(([k, v]) => {
      if (isPrimitiveType(v)) return [k, getPropertyTypeName(v)];
      if (isType(v)) return [k, getPropertyTypeName(v)];
      if (isListTypeSyntaxShortcut(v)) return [k, getPropertyTypeName(v)];
      if (isAllTypeList(v)) return [k, toString(map(getPropertyTypeName, v))];
      return [k, toString(v)];
    }),
    sortBy(([k]) => k),
    toPairs,
  );

//    printRecord : Record -> String
const printRecord = ({ recordName, shape }) =>
  `record ${recordName} {\n${printShape('\n', '    ')(shape)}\n}`;

//    checkRecordName : String -> Void (throws TypeError)
const checkRecordName = recordName => {
  if (isNil(recordName)) err('Record must have a name');
  if (isEmpty(recordName)) err("Record name can't be empty");
  if (recordName[0] !== toUpper(recordName[0])) {
    err(
      `Record names must be capitalized. Try ${capitalize(
        recordName,
      )} instead of ${recordName}`,
    );
  }
};

//    checkRecordShapeProperty : Record -> [String, Any] -> Void (throws TypeError)
const checkRecordShapeProperty = ({ recordName, shape }) => ([name, type]) => {
  if (isNil(name)) {
    err(
      `${recordName} has a strangely undefined name for property. See: ${printRecord(
        {
          recordName,
          shape,
        },
      )}`,
    );
  }
  if (isNil(type)) {
    err(
      `${recordName} has an undefined property named ${name}. See: ${printRecord(
        {
          recordName,
          shape,
        },
      )}`,
    );
  }
  if (isPrimitiveType(type)) return;
  if (isType(type)) return;
  if (isListTypeSyntaxShortcut(type)) return;
  err(
    `${recordName} has a property named ${name} that is not:

- a primitive, such as Number
- a user-defined type, such as Result
- a list of one primitive or user-defined type, such as [Number] or [Result]

See:

${printRecord({ recordName, shape })}`,
  );
};

//    checkRecordShape : Record -> Void (throws TypeError)
const checkRecordShape = ({ recordName, shape }) => {
  if (isNil(shape)) err(`Record shape for ${recordName} can't be undefined`);
  if (isEmpty(shape)) err(`Record shape for ${recordName} can't be empty`);
  forEach(checkRecordShapeProperty({ recordName, shape }), toPairs(shape));
};

//    checkValidValue : Any -> Void (throws TypeError)
const checkValidValue = value => {
  if (isNil(value)) err("Record value can't be undefined");
  if (isEmpty(value)) err("Record value can't be empty");
};

//    checkMatchingKeys : (Any, Record) -> Void (throws TypeError)
const checkMatchingKeys = (value, { recordName, shape }) => {
  const valueKeys = keys(value);
  const shapeKeys = keys(shape);

  if (valueKeys.length !== shapeKeys.length) {
    const extraValueKeys = difference(valueKeys, shapeKeys);
    const extraShapeKeys = difference(shapeKeys, valueKeys);

    const diff = isEmpty(extraValueKeys) ? extraShapeKeys : extraValueKeys;

    err(`Failed to create Record of shape:

${printRecord({ recordName, shape })}

With value:

${printRecord({ recordName: 'value', shape: value })}

Missing properties:

${compose(
      join('\n'),
      map(k => `  - ${k}`),
      sortBy(x => x),
    )(diff)}
`);
  }
};

//    checkMatchingTypes : (Any, Record) -> Void (throws TypeError)
const checkMatchingTypes = (value, { recordName, shape }) => {
  forEach(([[_valueName, valueValue], [propertyName, propertyType]]) => {
    try {
      if (isPrimitiveType(propertyType) && is(propertyType, valueValue)) return;
      if (isType(propertyType) && propertyType.is(valueValue)) return;
      // List Syntax Support
      if (isListTypeSyntaxShortcut(propertyType) && is(Array, valueValue)) {
        const t = head(propertyType);
        valueValue.forEach(v => {
          if ((isPrimitiveType(t) && !is(t, v)) || (isType(t) && !t.is(v))) {
            throw TypeError();
          }
        });
        return;
      }
      throw TypeError();
    } catch (exception) {
      const typeName = getPropertyTypeName(propertyType);
      err(`Failed to create ${recordName} of shape:

${printRecord({ recordName, shape })}

With values:

${printRecord({ recordName: 'value', shape: value })}

Property "${propertyName}" expected value of type "${typeName}"
but found value "${toString(valueValue)}" of type "${getValueType(valueValue)}".
`);
    }
  }, zip(sortBy(head, toPairs(value)), sortBy(head, toPairs(shape))));
};

//    checkValueShape : (Any, Record) -> Void (throws TypeError)
const checkValueShape = (value, { recordName, shape }) => {
  checkMatchingKeys(value, { recordName, shape });
  checkMatchingTypes(value, { recordName, shape });
};

//    createLensesForShape : Shape -> { [attribute]: Lens }
const createLensesForShape = compose(
  fromPairs,
  map(([name]) => [name, lensPath([$$value, name])]),
  toPairs,
);

//    Record : RecordDefinition -> Record
const Record = record => {
  if (isNil(record)) err('Record Definition Must Not Be Null');

  const { recordName, shape } = record;
  checkRecordName(recordName);
  checkRecordShape({ recordName, shape });

  const sharedProto = {
    toString: function() {
      return `${recordName} { ${printShape(', ', '')(this[$$value])} }`;
    },
  };

  return Object.freeze({
    [$$type]: recordName,
    [Symbol.toStringTag]: 'Type',
    is: value => value[$$type] === recordName,
    lenses: createLensesForShape(shape),
    toString: () => printRecord({ recordName, shape }),

    // of : Any -> TypedValue (throws TypeError)
    of: value => {
      checkValidValue(value);
      checkValueShape(value, { recordName, shape });
      return Object.freeze({
        [$$constructor]: recordName,
        [$$type]: recordName,
        [$$value]: value,
        [Symbol.toStringTag]: recordName,
        __proto__: sharedProto,
      });
    },
  });
};

export default Record;
