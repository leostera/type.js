import { $$type, $$value, $$constructor } from 'type/symbols';
import err from 'type/err';
import toString from 'type/toString';

import difference from 'ramda/src/difference';
import equals from 'ramda/src/equals';
import is from 'ramda/src/is';
import isEmpty from 'ramda/src/isEmpty';
import isNil from 'ramda/src/isNil';
import length from 'ramda/src/length';
import map from 'ramda/src/map';
import take from 'ramda/src/take';
import toPairs from 'ramda/src/toPairs';

/*
 * Tagged Type creation utility.
 *
 * The main function to create new type objects that provide helper functions
 * for:
 *    1. Constructing values of this type
 *    2. Checking if a value is a value of this type
 *    3. Doing case-analysis / exhaustive pattern-matching on these values
 *
 * type TypeDefinition : {
 *    typeName : String             -- the name of the type
 *    constructors : [Constructor]  -- a list of constructors for this type
 * }
 *
 * type Constructor : {
 *    name  : String       -- the name of the method that will create the object
 *    arity : Number       -- the amount of values this constructor accepts
 * }
 *
 * type TypeObject : {
 *    is : Object -> Bool          -- check if Object is of this type
 *    match : Branches -> a -> a   -- creates a safe, exhaustive matcher for
 *                                    this specific type considering all
 *                                    specified constructors
 * }
 *
 * type TypedValue : {
 *    type : String             -- String representation of the TypedValue
 *    payload : String          -- the value held inside
 *
 *    [$$value] : Any           -- The value held inside
 *    [$$type] : String         -- The name of the type
 *    [$$constructor] : String  -- The name of the constructor
 * }
 *
 * The idea behind the matcher is to avoid manual type-checking through nested
 * if's by specifying the different constructors and how to handle each one of
 * them. For a sample type Bool, defined as:
 *
 * ```
 * const Bool = Type({
 *  typeName: 'Bool',
 *  constructors: [
 *    { name: 'True',  arity: 0 },
 *    { name: 'False', arity: 0 },
 *  ]
 * });
 *
 * const negate = Bool.match({
 *  True: Bool.False(),
 *  False: Bool.True(),
 * });
 *
 * Bool.true = Bool.True;
 *
 * negate(Bool.False()) // Bool.True()
 * negate(1) // throw TypeError("Expecting object of type Bool")
 * ```
 */

/******************************************************************************
 *
 * Helper safety check functions
 *
 ******************************************************************************/

//    invalidTypeName : String -> Bool
const invalidTypeName = x => !is(String, x) || isEmpty(x);

//    checkNotNil : TypeDefinition -> Void (throws TypeError)
const checkNotNil = typeDef => {
  if (isNil(typeDef)) {
    err('Type definition cannot be empty');
  }
};

//    checkValidName : TypeDefinition -> Void (throws TypeError)
const checkValidName = typeDef => {
  if (isNil(typeDef.typeName)) {
    err('Type name cannot be undefined');
  }

  if (invalidTypeName(typeDef.typeName)) {
    err(`${typeDef.typeName} is not a valid Type name`);
  }
};

//    checkValidName : Constructor -> Void (throws TypeError)
const checkValidConstructor = constructor => {
  if (isNil(constructor.name) || isEmpty(constructor.name)) {
    err('Type constructor name must be provided');
  }

  if (!is(Number, constructor.arity)) {
    err('Type constructor arity must be a number');
  }

  if (constructor.arity < 0) {
    err('Type constructor arity must be greater than or equal to 0');
  }
};

//    checkValidConstructors : TypeDefinition -> Void (throws TypeError)
const checkValidConstructors = typeDef => {
  if (!is(Array, typeDef.constructors) || isEmpty(typeDef.constructors)) {
    err('Type constructors must be provided');
  }
  typeDef.constructors.forEach(checkValidConstructor);
};

//    checkArity : (String, String, Integer) -> ...Any -> List Any
const checkArity = (typeName, constructorName, arity, args) => {
  if (arity !== length(args)) {
    err(`Attempting to construct value of type ${typeName} with
constructor ${typeName}.${constructorName} with ${args.length} values [${args}]
but this is an arity ${arity} constructor (takes ${arity} values)`);
  }
};

//    checkBranchNamesNotEmpty : (String, String, Branches) -> Void (throws TypeError)
const checkBranchNamesNotEmpty = (typeName, constructorNames, branchNames) => {
  if (isEmpty(branchNames)) {
    err(`
    Attempted to construct matcher for type ${typeName} without any matching.

    Missing cases for:

${constructorNames.map(x => `\t-> ${x}`).join('\n')}
    `);
  }
};

//    checkMatcherNames : (String, String, Branches) -> Void (throws TypeError)
const checkMatcherNames = (typeName, constructorNames, branchNames) => {
  if (!equals(constructorNames.sort(), branchNames.sort())) {
    const diffOne = difference(constructorNames, branchNames);
    const diffTwo = difference(branchNames, constructorNames);

    const branchNamesDifferentThanConstructorNames = isEmpty(diffTwo);

    const diff = branchNamesDifferentThanConstructorNames ? diffOne : diffTwo;

    const message = branchNamesDifferentThanConstructorNames
      ? 'Missing cases for'
      : 'The following cases will never match';

    err(`
    Non-exhaustive pattern matching found for ${typeName}.

    ${message}:

${diff.map(x => `\t-> ${x}`).join('\n')}
    `);
  }
};

//    checkMatcherBranchesNotNil : (String, Branches) -> Void (throws TypeError)
const checkMatcherBranchesNotNil = (typeName, branches) => {
  toPairs(branches).forEach(([name, f]) => {
    if (isNil(f)) {
      err(`
        Branch ${name} for type ${typeName} is null or undefined :(
        `);
    }
  });
};

//    checkBranchesIsObject : (String, [String], Any) -> Void (throws TypeError)
const checkBranchesIsObject = (typeName, constructorNames, branches) => {
  if (!isNil(branches) && !is(Array, branches) && is(Object, branches)) {
    return;
  }

  err(`
    When checking for branches for ${typeName} expecting ${constructorNames} we found ${branches}
  `);
};

/******************************************************************************
 *
 * Type Creation Steps Helpers.
 *
 ******************************************************************************/

//    getValueByArity : arity : Number,
const getValueByArity = (arity, args) => {
  switch (arity) {
    case 0:
      return null;
    case 1:
      return args[0];
    default:
      return take(arity, args);
  }
};

//    createConstructor : TypeDefinition -> Constructor -> (a -> TypedValue)
const createConstructor = typeDef => ({ name, arity }) => {
  const sharedProto = {
    toString: function() {
      return `${this[$$type]}.${this[$$constructor]}${
        arity > 0 ? `(${map(toString, this[$$value])})` : ''
      }`;
    },
  };

  const constructor = {
    [name]: (...args) => {
      checkArity(typeDef.typeName, name, arity, args);

      const value = getValueByArity(arity, args);

      const typedValue = {
        // Internal value and type information
        [$$value]: value,
        [$$type]: typeDef.typeName,
        [$$constructor]: name,

        /* eslint-disable no-proto */
        // Extend typed values with shared functionality
        // __proto__: sharedProto,
        /* eslint-enable no-proto */

        // @TODO: Redux does not let us have actions with prototypes?!
        toString: sharedProto.toString,

        // @TODO: Redux dislikes anonymous symbol keyed properties in actions
        // [Symbol.toStringTag]: `${typeDef.typeName}.${name}`,

        // Added for redux and redux-dev-tools compatibility
        payload: value,
        type: `${typeDef.typeName}.${name}${
          arity > 0 && !isNil(value) && value.type ? `(${value.type})` : ''
        }`,
      };

      return Object.freeze(typedValue);
    },
  };

  constructor[name].label = name;
  constructor[name].is = value => value[$$constructor] === name;
  constructor[name].arity = arity;

  return Object.freeze(constructor);
};

//    createConstructors : TypeDefinition -> [ Constructor ]
const createConstructors = typeDef =>
  map(createConstructor(typeDef), typeDef.constructors);

//    createMatcher : TypeDefinition -> TypeDefinition
const createMatcher = typeDef => branches => {
  const constructorNames = typeDef.constructors.map(({ name }) => name);

  checkBranchesIsObject(typeDef.typeName, constructorNames, branches);
  const branchNames = Object.keys(branches);

  checkBranchNamesNotEmpty(typeDef.typeName, constructorNames, branchNames);
  checkMatcherNames(typeDef.typeName, constructorNames, branchNames);
  checkMatcherBranchesNotNil(typeDef.typeName, branches);

  return matchingValue => {
    const type = matchingValue[$$type];
    const constructor = matchingValue[$$constructor];
    const value = matchingValue[$$value];

    if (matchingValue[$$type] !== typeDef.typeName) {
      err(`
        Matcher for ${typeDef.typeName} found object of type ${type ||
        typeof matchingValue}.
        `);
    }

    const f = branches[constructor];

    if (is(Function, f)) return f(value);
    return f;
  };
};

/******************************************************************************
 *
 * API
 *
 ******************************************************************************/

//    Type : TypeDefinition -> TypeObject
const Type = typeDefinition => {
  checkNotNil(typeDefinition);
  checkValidConstructors(typeDefinition);
  checkValidName(typeDefinition);

  const match = createMatcher(typeDefinition);
  const constructors = createConstructors(typeDefinition);

  const type = {
    [Symbol.toStringTag]: 'Type',
    [$$type]: typeDefinition.typeName,
    is: value => value[$$type] === typeDefinition.typeName,
    match: match,
    toString: () => {
      const labels = constructors
        .map(toPairs)
        .map(([[name]]) => name)
        .sort();

      const printableLabels =
        labels.length > 3
          ? `\n${labels.map(name => `\t | ${name}`).join('\n')}`
          : labels.join(' | ');

      return `type ${typeDefinition.typeName} = ${printableLabels}`;
    },
  };

  // Assign all constructors to the Type object
  constructors.map(toPairs).forEach(([[name, f]]) => {
    type[name] = f;
  });

  return type;
};

export default Type;
