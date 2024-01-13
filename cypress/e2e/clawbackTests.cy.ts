describe('Test Asset Page', () => {
  beforeEach(() => {
    cy.intercept(
      'GET',
      'https://horizon-testnet.stellar.org/accounts/GANFMU7SHOFXUM6OF32BGKADD6QSEEP25E2ZVJ6PTJUKI4WORZY6Y6SI',
      { fixture: 'issuerAccount.json' }
    ).as('load Issuer Account request');

    cy.intercept('POST', '**/transactions', { fixture: 'transaction.json' }).as('performClawback');
    cy.intercept(
      'GET',
      'https://horizon-testnet.stellar.org/accounts/GDAM4TVOXH5RA36KIQLG6JZBM5LB2LMWTTHHJMXCZIPVORNHV4AFPQW3',
      { fixture: 'clawbackAccount.json' }
    ).as('clawbackAccount request');

    cy.visit('http://localhost:5173/recipe/clawback');
  });

  it('Should performs clawback when button is clicked, and verifies the status', () => {
    cy.get('#asset-code').should('be.visible').type('testCoin');
    cy.get('#issuer-secret-key').should('be.visible').type('SB2RZHC7JIUBYHYV45VEHEYVANDY5AWHYS3IJYZHPVNJ6TJ5YPEK7OQE');
    cy.get('#clawback-account').should('be.visible').type('GDAM4TVOXH5RA36KIQLG6JZBM5LB2LMWTTHHJMXCZIPVORNHV4AFPQW3');
    cy.get('#is-clawback-all-enabled').should('be.visible').uncheck();
    cy.get('#amount').should('be.visible').type('100');

    cy.get('#clawback-button').click();

    cy.get('#status').within(() => {
      cy.contains('Transaction successful');
      cy.get('div.flex.items-center').within(() => {
        cy.contains('See details').should(
          'have.attr',
          'href',
          'https://stellar.expert/explorer/testnet/tx/9fa82582516534232e7a9a2ccc391908790d9a2d7da6cce0a13c34e457d381dd'
        );
      });
    });
  });

  it('Should try to perform clawback when button is clicked, but fails because the available balance is less than the amount', () => {
    cy.get('#asset-code').should('be.visible').type('testCoin');
    cy.get('#issuer-secret-key').should('be.visible').type('SB2RZHC7JIUBYHYV45VEHEYVANDY5AWHYS3IJYZHPVNJ6TJ5YPEK7OQE');
    cy.get('#clawback-account').should('be.visible').type('GDAM4TVOXH5RA36KIQLG6JZBM5LB2LMWTTHHJMXCZIPVORNHV4AFPQW3');
    cy.get('#is-clawback-all-enabled').should('be.visible').uncheck();
    cy.get('#amount').should('be.visible').type('10000000');

    cy.get('#clawback-button').click();

    cy.get('#status').should(
      'contain',
      'Error: Error: The amount for clawback (10000000) is greater than the available balance (999900.0000000)'
    );
  });
});
