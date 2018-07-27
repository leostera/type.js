import Type from './type';

describe('Type: Type', () => {
  // Sample types for test purposes
  const A = Type({
    typeName: 'A',
    constructors: [{ name: 'B', arity: 3 }, { name: 'C', arity: 0 }],
  });

  const B = Type({
    typeName: 'B',
    constructors: [{ name: 'D', arity: 0 }],
  });

  describe('Value Creation Sanity Checks', () => {
    it('Fails to create value if the arity mismatches', () => {
      const f = () => A.B(0, 1);
      const g = () => A.B();
      expect(f).toThrow();
      expect(g).toThrow();
    });

    it('Creates values with a constructor', () => {
      const value = A.B(1, 2, 3);
      expect(A.is(value)).toBe(true);
      expect(A.B.is(value)).toBe(true);
    });

    it('Creates a value with an toString method', () => {
      const b = A.B(1, 2, 3).toString();
      expect(b).toEqual('A.B(1,2,3)');

      const c = A.C().toString();
      expect(c).toEqual('A.C');
    });
  });

  describe('Matcher pattern matching', () => {
    it('Passes the value into the branch function', () => {
      const f = A.match({
        B: x => [...x, 4],
        C: true,
      });

      expect(f(A.B(1, 2, 3))).toEqual([1, 2, 3, 4]);
      expect(f(A.C())).toEqual(true);
    });
  });

  describe('Matcher Sanity Checks', () => {
    it('Fails to create matcher with invalid branches', () => {
      const f = () => A.match();
      expect(f).toThrow();
    });

    it('Fails to create matcher without branches', () => {
      const f = () => A.match({});
      expect(f).toThrow();
    });

    it('Fails to create matcher with wrong branches', () => {
      const f = () => A.match({ D: x => x });
      expect(f).toThrow();
    });

    it('Fails to create matcher with missing branches', () => {
      const f = () => A.match({ B: x => x });
      expect(f).toThrow();
    });

    it('Fails to create matcher with Nil branches', () => {
      const f = () =>
        A.match({
          B: null,
          C: x => x,
        });

      expect(f).toThrow();
    });

    it('Fails to run with other types', () => {
      const f = () =>
        A.match({
          B: x => x,
          C: x => x,
        })(B.D());

      expect(f).toThrow();
    });
  });

  describe('Type Creation Sanity Checks', () => {
    it('Fails on null definition', () => {
      expect(Type).toThrow();
    });

    it('Fails on undefined type name', () => {
      const f = () => Type({});
      expect(f).toThrow();
    });

    it('Fails on invalid type name', () => {
      const f = () => Type({ typeName: '' });
      expect(f).toThrow();
    });

    it('Fails on undefined constructors', () => {
      const f = () =>
        Type({
          typeName: 'A',
        });
      expect(f).toThrow();
    });

    it('Fails on no constructors', () => {
      const f = () =>
        Type({
          typeName: 'A',
          constructors: [],
        });
      expect(f).toThrow();
    });

    it('Fails on undefined constructor name', () => {
      const f = () =>
        Type({
          typeName: 'A',
          constructors: [{}],
        });
      expect(f).toThrow();
    });

    it('Fails on non-number constructor arity ', () => {
      const f = () =>
        Type({
          typeName: 'A',
          constructors: [
            {
              name: 'A',
              arity: false,
            },
          ],
        });
      expect(f).toThrow();
    });

    it('Fails on negative constructor arity ', () => {
      const f = () =>
        Type({
          typeName: 'A',
          constructors: [
            {
              name: 'A',
              arity: -1,
            },
          ],
        });
      expect(f).toThrow();
    });

    it('Arity of 1 with false values should return the values', () => {
      const Arity = Type({
        typeName: 'Arity',
        constructors: [
          {
            name: 'One',
            arity: 1,
          },
        ],
      });

      const falsy = Arity.One(false);
      const undefinedy = Arity.One(undefined);
      const nully = Arity.One(null);
      const emptyStringy = Arity.One('');
      const nany = Arity.One(NaN);
      const zeroy = Arity.One(0);
      const assertion = expectation =>
        Arity.match({
          One: x => expect(x).toEqual(expectation),
        });

      assertion(false)(falsy);
      assertion(undefined)(undefinedy);
      assertion(null)(nully);
      assertion('')(emptyStringy);
      assertion(NaN)(nany);
      assertion(0)(zeroy);
    });
  });
});
