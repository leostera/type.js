import isType from './isType';
import { $$type } from './symbols';

import Type from './type';

describe('Type: isType', () => {
  // Sample types for test purposes
  const Bool = Type({
    typeName: 'Bool',
    constructors: [{ name: 'True', arity: 0 }, { name: 'False', arity: 0 }],
  });

  it('types defined with Type are Types', () => {
    expect(isType(Bool)).toBe(true);
  });
  it('values of a Type are not Types', () => {
    expect(isType(Bool.True())).toBe(false);
  });
  it('constructors of a Type are not Types', () => {
    expect(isType(Bool.True)).toBe(false);
  });

  it('primitive constructors are not Types', () => {
    expect(isType(Array)).toBe(false);
    expect(isType(Boolean)).toBe(false);
    expect(isType(Number)).toBe(false);
    expect(isType(Object)).toBe(false);
    expect(isType(Promise)).toBe(false);
    expect(isType(String)).toBe(false);
    expect(isType(Symbol)).toBe(false);
  });
  it('primitive values are not Types', () => {
    expect(isType(null)).toBe(false);
    expect(isType(undefined)).toBe(false);
    expect(isType([])).toBe(false);
    expect(isType(true)).toBe(false);
    expect(isType(1)).toBe(false);
    expect(isType({})).toBe(false);
    expect(isType('')).toBe(false);
    expect(isType(Promise.resolve())).toBe(false);
    expect(isType(Symbol())).toBe(false);
  });

  it('handcrafted types are types if the name is not empty', () => {
    expect(isType({ [$$type]: 'What!' })).toBe(true);
    expect(isType({ [$$type]: '' })).toBe(false);
  });
});
