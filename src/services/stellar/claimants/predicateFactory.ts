import { xdr } from 'stellar-sdk';

interface IUnconditionalPredicate {
  predicate: 'unconditional';
}

interface ITimePredicate {
  predicate: 'time';
  timeType: 'relative' | 'absolute';
  value: xdr.Int64;
}

interface IAndPredicate {
  predicate: 'and';
  firstPredicate: PredicateType;
  secondPredicate: PredicateType;
}

interface IOrPredicate {
  predicate: 'or';
  firstPredicate: PredicateType;
  secondPredicate: PredicateType;
}

interface INotPredicate {
  predicate: 'not';
  firstPredicate: PredicateType;
}

type PredicateType =
  | { predicate: undefined }
  | IUnconditionalPredicate
  | ITimePredicate
  | IAndPredicate
  | IOrPredicate
  | INotPredicate;

function createPredicate(claimant: PredicateType): xdr.ClaimPredicate {
  let predicate: xdr.ClaimPredicate;

  if (claimant.predicate === undefined) {
    throw new Error('Predicate is undefined');
  }

  switch (claimant.predicate) {
    case 'time':
      if (claimant.timeType === 'absolute') {
        predicate = xdr.ClaimPredicate.claimPredicateBeforeAbsoluteTime(claimant.value);
      } else {
        predicate = xdr.ClaimPredicate.claimPredicateBeforeRelativeTime(claimant.value);
      }
      break;
    case 'and':
      predicate = xdr.ClaimPredicate.claimPredicateAnd([
        createPredicate(claimant.firstPredicate),
        createPredicate(claimant.secondPredicate)
      ]);
      break;
    case 'or':
      predicate = xdr.ClaimPredicate.claimPredicateOr([
        createPredicate(claimant.firstPredicate),
        createPredicate(claimant.secondPredicate)
      ]);
      break;
    case 'not':
      predicate = xdr.ClaimPredicate.claimPredicateNot(createPredicate(claimant.firstPredicate));
      break;
    default:
      predicate = xdr.ClaimPredicate.claimPredicateUnconditional();
  }

  return predicate;
}

export type { PredicateType, ITimePredicate, IAndPredicate, INotPredicate, IOrPredicate };
export default createPredicate;
