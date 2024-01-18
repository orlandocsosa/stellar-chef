/* eslint-disable @typescript-eslint/no-namespace */

import type { dataCy } from './typings/data-cy';
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Get a DOM element by data-cy attribute
       */
      getByDataTestAttribute: (selector: dataCy) => Chainable<any>;
    }
  }
}

Cypress.Commands.add('getByDataTestAttribute', (selector: dataCy) => {
  Cypress.log({
    displayName: 'getByDataTestAttribute',
    message: [selector],
    consoleProps: () => {
      return {
        'data-cy': selector
      };
    }
  });
  return cy.get(`[data-cy="${selector}"]`);
});
