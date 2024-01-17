/* eslint-disable @typescript-eslint/no-namespace */

export {};
declare global {
  namespace Cypress {
    interface Chainable {
      getByDataTestAttribute: (selector: string) => Chainable<any>;
    }
  }
}

Cypress.Commands.add('getByDataTestAttribute', (selector: string) => {
  return cy.get(`[data-cy="${selector}"]`);
});
