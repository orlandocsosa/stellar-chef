import { xdr } from 'stellar-sdk';

interface IUnconditionalPredicate {
  type: 'unconditional';
}

interface ITimePredicate {
  type: 'time';
  timeType: 'relative' | 'absolute' | undefined;
  value: xdr.Int64 | undefined;
}

interface IAndPredicate {
  type: 'and';
  firstPredicate: PredicateType;
  secondPredicate: PredicateType;
}

interface IOrPredicate {
  type: 'or';
  firstPredicate: PredicateType;
  secondPredicate: PredicateType;
}

interface INotPredicate {
  type: 'not';
  firstPredicate: PredicateType;
}

interface IUndefinedPredicate {
  type: undefined;
}

type PredicateType =
  | IUndefinedPredicate
  | IUnconditionalPredicate
  | ITimePredicate
  | IAndPredicate
  | IOrPredicate
  | INotPredicate;

function createPredicate(predicate: PredicateType): xdr.ClaimPredicate {
  let createdPredicate: xdr.ClaimPredicate;

  if (predicate.type === undefined) {
    throw new Error('Predicate is undefined');
  }

  switch (predicate.type) {
    case 'time':
      if (predicate.timeType === undefined || predicate.value === undefined) {
        throw new Error('Time type and value are undefined');
      }
      if (predicate.timeType === 'absolute') {
        createdPredicate = xdr.ClaimPredicate.claimPredicateBeforeAbsoluteTime(predicate.value);
      } else {
        createdPredicate = xdr.ClaimPredicate.claimPredicateBeforeRelativeTime(predicate.value);
      }
      break;
    case 'and':
      createdPredicate = xdr.ClaimPredicate.claimPredicateAnd([
        createPredicate(predicate.firstPredicate),
        createPredicate(predicate.secondPredicate)
      ]);
      break;
    case 'or':
      createdPredicate = xdr.ClaimPredicate.claimPredicateOr([
        createPredicate(predicate.firstPredicate),
        createPredicate(predicate.secondPredicate)
      ]);
      break;
    case 'not':
      createdPredicate = xdr.ClaimPredicate.claimPredicateNot(createPredicate(predicate.firstPredicate));
      break;
    default:
      createdPredicate = xdr.ClaimPredicate.claimPredicateUnconditional();
  }

  return createdPredicate;
}

export type { PredicateType, ITimePredicate, IAndPredicate, INotPredicate, IOrPredicate, IUndefinedPredicate };
export default createPredicate;
