import type { xdr } from 'stellar-sdk';

interface IPredicate {
  type: string;
  predicates?: IPredicate[];
  time?: {
    type?: 'relative' | 'absolute';
    value?: xdr.Int64;
  };
}

interface IClaimant {
  destination: string;
  predicate: IPredicate;
}

export type { IClaimant, IPredicate };
