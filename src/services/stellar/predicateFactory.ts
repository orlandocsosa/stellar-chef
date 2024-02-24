import { xdr } from 'stellar-sdk';
import type { IClaimant } from './types';

function createPredicate(predicate: IClaimant['predicate']): xdr.ClaimPredicate {
  let createdPredicate: xdr.ClaimPredicate;

  if (predicate.type === '') {
    throw new Error('Predicate is undefined');
  }

  switch (predicate.type) {
    case 'time':
      if (predicate.time?.type === undefined || predicate.time.value === undefined) {
        throw new Error('Time type and value are undefined');
      }

      if (predicate.time.type === 'absolute') {
        createdPredicate = xdr.ClaimPredicate.claimPredicateBeforeAbsoluteTime(predicate.time.value);
      } else {
        createdPredicate = xdr.ClaimPredicate.claimPredicateBeforeRelativeTime(predicate.time.value);
      }
      break;
    case 'and':
      if (predicate.predicates === undefined) {
        throw new Error('Predicates are undefined');
      }

      createdPredicate = xdr.ClaimPredicate.claimPredicateAnd([
        createPredicate(predicate.predicates[0]),
        createPredicate(predicate.predicates[1])
      ]);
      break;
    case 'or':
      if (predicate.predicates === undefined) {
        throw new Error('Predicates are undefined');
      }

      createdPredicate = xdr.ClaimPredicate.claimPredicateOr([
        createPredicate(predicate.predicates[0]),
        createPredicate(predicate.predicates[1])
      ]);
      break;
    case 'not':
      if (predicate.predicates === undefined) {
        throw new Error('Predicates are undefined');
      }

      createdPredicate = xdr.ClaimPredicate.claimPredicateNot(createPredicate(predicate.predicates[0]));
      break;
    default:
      createdPredicate = xdr.ClaimPredicate.claimPredicateUnconditional();
  }

  return createdPredicate;
}

export default createPredicate;
