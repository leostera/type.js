import isTypedValue from './isTypedValue';
import { $$type, $$value, $$constructor } from './symbols';

import Type from './type';

describe('Type: isTypedValue', () => {
  // Sample types for test purposes
  const Bool = Type({
    typeName: 'Bool',
    constructors: [{ name: 'True', arity: 0 }, { name: 'False', arity: 0 }],
  });

  it('types defined with Type are not Typed Values', () => {
    expect(isTypedValue(Bool)).toBe(false);
  });
  it('values of a Type are Typed Values', () => {
    expect(isTypedValue(Bool.True())).toBe(true);
  });
  it('constructors of a Type are not Typed Values', () => {
    expect(isTypedValue(Bool.True)).toBe(false);
  });

  it('primitive constructors are not Types', () => {
    expect(isTypedValue(Array)).toBe(false);
    expect(isTypedValue(Boolean)).toBe(false);
    expect(isTypedValue(Number)).toBe(false);
    expect(isTypedValue(Object)).toBe(false);
    expect(isTypedValue(Promise)).toBe(false);
    expect(isTypedValue(String)).toBe(false);
    expect(isTypedValue(Symbol)).toBe(false);
  });
  it('primitive values are not Types', () => {
    expect(isTypedValue(null)).toBe(false);
    expect(isTypedValue(undefined)).toBe(false);
    expect(isTypedValue([])).toBe(false);
    expect(isTypedValue(true)).toBe(false);
    expect(isTypedValue(1)).toBe(false);
    expect(isTypedValue({})).toBe(false);
    expect(isTypedValue('')).toBe(false);
    expect(isTypedValue(Promise.resolve())).toBe(false);
    expect(isTypedValue(Symbol())).toBe(false);
  });

  it('handcrafted types are types if the name is not empty', () => {
    expect(
      isTypedValue({
        [$$type]: 'irrelevant-type-name',
        [$$constructor]: 'irrelevant-constructor-name',
        [$$value]: 'irrelevant-value',
      }),
    ).toBe(true);
  });
});
