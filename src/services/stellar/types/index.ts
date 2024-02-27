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

interface ICreateClaimableBalanceRequest {
  code: string;
  issuer: string;
  amount: string;
  secret: string;
}

interface IOfferRequest {
  buyingCode: string;
  buyingIssuer: string;
  sellingCode: string;
  sellingIssuer: string;
  amount: string;
  price: string;
  offerID: string;
  source: string;
  sponsor: string;
}

interface IOfferRecord {
  id: number | string;
  seller: string;
  selling: { code: string; issuer: string };
  buying: { code: string; issuer: string };
  amount: string;
  price: string;
}

export type { IClaimant, IPredicate, IOfferRequest, IOfferRecord, ICreateClaimableBalanceRequest };
