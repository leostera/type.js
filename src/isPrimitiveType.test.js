import isPrimitiveType from './isPrimitiveType';
import { $$type } from './symbols';

import Type from './type';

describe('Type: isPrimitiveType', () => {
  // Sample types for test purposes
  const Bool = Type({
    typeName: 'Bool',
    constructors: [{ name: 'True', arity: 0 }, { name: 'False', arity: 0 }],
  });

  it('types defined with Type are not Primitive Types', () => {
    expect(isPrimitiveType(Bool)).toBe(false);
  });
  it('values of a Type are not Primitive Types', () => {
    expect(isPrimitiveType(Bool.True())).toBe(false);
  });
  it('constructors of a Type are not Primitive Types', () => {
    expect(isPrimitiveType(Bool.True)).toBe(false);
  });

  it('primitive constructors are Primitive Types', () => {
    expect(isPrimitiveType(Array)).toBe(true);
    expect(isPrimitiveType(Boolean)).toBe(true);
    expect(isPrimitiveType(Number)).toBe(true);
    expect(isPrimitiveType(Object)).toBe(true);
    expect(isPrimitiveType(Promise)).toBe(true);
    expect(isPrimitiveType(String)).toBe(true);
    expect(isPrimitiveType(Symbol)).toBe(true);
    expect(isPrimitiveType(Function)).toBe(true);
  });
  it('primitive values are not Primitive Types', () => {
    expect(isPrimitiveType([])).toBe(false);
    expect(isPrimitiveType(true)).toBe(false);
    expect(isPrimitiveType(1)).toBe(false);
    expect(isPrimitiveType({})).toBe(false);
    expect(isPrimitiveType('')).toBe(false);
    expect(isPrimitiveType(Promise.resolve())).toBe(false);
    expect(isPrimitiveType(Symbol())).toBe(false);
    expect(isPrimitiveType(() => {})).toBe(false);
  });

  it('handcrafted types are not Primitive Types', () => {
    expect(isPrimitiveType({ [$$type]: 'What!' })).toBe(false);
  });
});
