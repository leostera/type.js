import isType from './isType';
import { $$type, $$value } from './symbols';

import Type from './type';
import Record from './record';

import is from 'ramda/src/is';
import view from 'ramda/src/view';
import over from 'ramda/src/over';
import set from 'ramda/src/set';

describe('Type: Record', () => {
  // Sample types for test purposes
  const Bool = Type({
    typeName: 'Bool',
    constructors: [{ name: 'True', arity: 0 }, { name: 'False', arity: 0 }],
  });

  const Point = Record({
    recordName: 'Point',
    shape: {
      x: Number,
      y: Number,
      visible: Bool,
    },
  });

  const Vector = Record({
    recordName: 'Point',
    shape: {
      values: [Number],
    },
  });

  describe('List Syntax', () => {
    it('Fails creation with an attribute is a list of values', () => {
      const f = () => Record({ recordName: 'Record', shape: { a: [1, 2, 3] } });
      expect(f).toThrow();
    });
    it('Fails creation with an attribute is a list of more than one type', () => {
      const f = () =>
        Record({ recordName: 'Record', shape: { a: [Bool, Number] } });
      expect(f).toThrow();
    });
    it('Succeeds creation with an attribute is a list of one type', () => {
      const f = () => Record({ recordName: 'Record', shape: { a: [Bool] } });
      expect(f).not.toThrow();
    });
    it("Fails if list attribute's values do not match the shape type", () => {
      const f = () => Vector.of({ values: [1, 2, true, 4, 5] });
      expect(f).toThrow();
    });
    it("Succeeds if list attribute's values match the shape type", () => {
      const f = () => Vector.of({ values: [1, 2, 3, 4, 5] });
      expect(f).not.toThrow();
    });
  });

  describe('Record creation Sanity Checks', () => {
    it('Fails creation without params', () => {
      const f = () => Record();
      expect(f).toThrow();
    });
    it('Fails creation without name', () => {
      const f = () => Record({ shape: { a: Boolean } });
      expect(f).toThrow();
    });
    it('Fails creation with empty name', () => {
      const f = () => Record({ recordName: '', shape: { a: Boolean } });
      expect(f).toThrow();
    });
    it('Fails creation with uncapitalized name', () => {
      const f = () => Record({ recordName: 'record', shape: { a: Boolean } });
      expect(f).toThrow();
    });
    it('Succeeds creation with non-empty, capitalized name', () => {
      const f = () => Record({ recordName: 'Record', shape: { a: Boolean } });
      expect(f).not.toThrow();
    });
    it('Fails creation without shape', () => {
      const f = () => Record({ recordName: 'Record' });
      expect(f).toThrow();
    });
    it('Fails creation with empty shape', () => {
      const f = () => Record({ recordName: 'Record', shape: {} });
      expect(f).toThrow();
    });
    it('Fails creation with non-primitive, non-user-defined shape attribute types', () => {
      const f = () => Record({ recordName: 'Record', shape: { a: 1234 } });
      const g = () => Record({ recordName: 'Record', shape: { a: null } });
      const h = () => Record({ recordName: 'Record', shape: { a: undefined } });
      expect(f).toThrow();
      expect(g).toThrow();
      expect(h).toThrow();
    });
    it('Succeeds creation with non-empty, primitive-types attributes shape', () => {
      const f = () =>
        Record({
          recordName: 'Record',
          shape: { a: Number, b: Boolean, c: String },
        });
      expect(f).not.toThrow();
    });
    it('Succeeds creation with non-empty, user-defined-types attributes shape', () => {
      const f = () =>
        Record({
          recordName: 'Record',
          shape: { a: Bool },
        });
      expect(f).not.toThrow();
    });
    it('Succeeds creation with non-empty, mixed attributes shape', () => {
      const f = () =>
        Record({
          recordName: 'Record',
          shape: { a: Bool, b: Number },
        });
      expect(f).not.toThrow();
    });
  });

  describe('Created Record', () => {
    it('is a valid type', () => {
      expect(isType(Point)).toBe(true);
      expect(Point[$$type]).toEqual('Point');
    });
    it('has a point-constructor .of', () => {
      expect(is(Function, Point.of)).toBe(true);
    });
    it("has a function to check if values are of it's type", () => {
      const sampleValue = Point.of({ x: 1, y: 1, visible: Bool.True() });
      expect(is(Function, Point.is)).toBe(true);
      expect(Point.is(sampleValue)).toBe(true);
    });
  });

  describe('Value Creation Sanity Checks', () => {
    it('Fails to create value if it is null/undefined', () => {
      const f = () => Point.of(null);
      const g = () => Point.of(undefined);
      expect(f).toThrow();
      expect(g).toThrow();
    });
    it('Fails to create value if it is empty', () => {
      const f = () => Point.of({});
      expect(f).toThrow();
    });
    it('Fails to create value if there are missing attributes', () => {
      const f = () => Point.of({ x: 1 });
      const g = () => Point.of({ y: 1 });
      const h = () => Point.of({ x: 1, y: 1, visible: Bool.True() });
      expect(f).toThrow();
      expect(g).toThrow();
      expect(h).not.toThrow();
    });
    it('Fails to create value if there are mismatching types', () => {
      const f = () => Point.of({ x: 1, y: 'bad-value' });
      const g = () => Point.of({ x: 'bad-value', y: 1 });
      const h = () => Point.of({ x: 'bad-value', y: 'bad-value' });
      expect(f).toThrow();
      expect(g).toThrow();
      expect(h).toThrow();
    });
    it('Succeeds creating value if all attributes match their types', () => {
      const f = () => Point.of({ x: 1, y: 1, visible: Bool.True() });
      expect(f).not.toThrow();
    });
  });

  describe('Created Value', () => {
    it('is an object of the type of the Record that created it', () => {
      const point = Point.of({ x: 1, y: 1, visible: Bool.True() });
      expect(point[$$type]).toBe(Point[$$type]);
      expect(Point.is(point)).toBe(true);
    });
    it('can be turned into a string', () => {
      const point = Point.of({ x: 1, y: 1, visible: Bool.True() });
      expect(point.toString()).toBe(
        'Point { visible : Bool.True, x : 1, y : 1 }',
      );
    });
    it('lets you access its values directly', () => {
      const point = Point.of({ x: 1, y: 1, visible: Bool.True() });
      expect(point[$$value]).toMatchObject({
        x: 1,
        y: 1,
        visible: Bool.True(),
      });
    });
  });

  describe('Lenses', () => {
    it('creates a set of lenses based on the attributes of the shape', () => {
      const { x, y, visible } = Point.lenses;
      const point = Point.of({ x: 1, y: 1, visible: Bool.True() });

      expect(Object.keys(Point.lenses)).toEqual(['x', 'y', 'visible']);
      expect(view(x, point)).toBe(1);
      expect(view(y, point)).toBe(1);
      expect(view(visible, point)).toMatchObject(Bool.True());

      const point2 = Point.of({ x: 1, y: 2, visible: Bool.True() });
      expect(over(y, v => v + 1, point)).toMatchObject(point2);
      expect(set(y, 2, point)).toMatchObject(point2);
    });
  });
});
