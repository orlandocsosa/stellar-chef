describe('Clawback Asset Page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/recipe/clawback');
  });

  it('should render the form', () => {
    cy.get('#asset-code').should('exist');
    cy.get('#issuer-secret-key').should('exist');
    cy.get('#clawback-account').should('exist');
    cy.get('#is-clawback-all-enabled').should('exist');
    cy.get('#amount').should('exist');
    cy.get('#clawback-button').should('exist');
  });

  it('should fill out the form with invalid data and show an error', () => {
    cy.get('#asset-code').type('wrongAssetCode');
    cy.get('#issuer-secret-key').type('WrongSecretKey');
    cy.get('#clawback-account').type('WrongClawbackAccount');

    cy.get('#clawback-button').click();

    cy.get('#status').should('contain', 'Error: Error: invalid encoded string');
  });
});
