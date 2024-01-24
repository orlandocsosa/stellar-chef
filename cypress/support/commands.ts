Cypress.Commands.add('getByDataTestAttribute', (selector: string) => {
  return cy.get(`[data-cy="${selector}"]`);
});
