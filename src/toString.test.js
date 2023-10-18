import Type from './type';
import toString from './toString';

describe('Type: toString', () => {
  const type = Type({
    typeName: 'A',
    constructors: [{ name: 'A', arity: 0 }],
  });

  it('returns Nil or Nil values', () => {
    expect(toString(null)).toBe('Nil');
    expect(toString(undefined)).toBe('Nil');
  });
  it("maps over an array's elements", () => {
    const array = [null, 1, { a: 1 }];
    expect(toString(array)).toBe('[Nil, 1, {"a":1}]');
  });
  it('works with Primitive Types', () => {
    expect(toString(Array)).toBe('Array');
    expect(toString(Boolean)).toBe('Boolean');
    expect(toString(Number)).toBe('Number');
    expect(toString(Object)).toBe('Object');
    expect(toString(Promise)).toBe('Promise');
    expect(toString(String)).toBe('String');
    expect(toString(Symbol)).toBe('Symbol');
  });
  it('works with primitive values', () => {
    expect(toString([])).toBe('[]');
    expect(toString(true)).toBe('true');
    expect(toString(1)).toBe('1');
    expect(toString({})).toBe('{}');
    expect(toString(Promise.resolve())).toBe('{}');
    expect(toString('test')).toBe('test');
    expect(toString(Symbol())).toBe('Symbol()');
    expect(toString(Symbol.for('test'))).toBe('Symbol(test)');
  });
  it('works with Types', () => {
    expect(toString(type)).toBe('type A = A');
  });
  it('works with Typed Values', () => {
    expect(toString(type.A())).toBe('A.A');
  });
  it('stringifies an object', () => {
    const object = {
      a: 1,
      b: 2,
      c: 3,
    };
    expect(toString(object)).toBe('{"a":1,"b":2,"c":3}');
  });
});
