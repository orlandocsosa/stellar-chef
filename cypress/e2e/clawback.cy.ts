const ASSET_CODE_FOR_CLAWBACK = 'testCoin';
const ISSUER_PUBLIC_KEY = 'GANFMU7SHOFXUM6OF32BGKADD6QSEEP25E2ZVJ6PTJUKI4WORZY6Y6SI';
const ISSUER_SECRET_KEY = 'SB2RZHC7JIUBYHYV45VEHEYVANDY5AWHYS3IJYZHPVNJ6TJ5YPEK7OQE';
const CLAWBACK_ACCOUNT_PUBLIC_KEY = 'GDAM4TVOXH5RA36KIQLG6JZBM5LB2LMWTTHHJMXCZIPVORNHV4AFPQW3';
const TRANSACTION_ID = '9fa82582516534232e7a9a2ccc391908790d9a2d7da6cce0a13c34e457d381dd';
const HORIZON_SERVER = 'https://horizon-testnet.stellar.org';
const STELLAR_EXPERT_TESTNET_EXPLORER_SERVER = 'https://stellar.expert/explorer/testnet';

describe('Test Clawback Page', () => {
  beforeEach(() => {
    cy.intercept('GET', `${HORIZON_SERVER}/accounts/${ISSUER_PUBLIC_KEY}`, {
      fixture: 'issuerAccount.json'
    }).as('loadIssuerAccountRequest');

    cy.intercept('POST', `${HORIZON_SERVER}/transactions`, { fixture: 'transaction.json' }).as('performClawback');
    cy.intercept('GET', `${HORIZON_SERVER}/accounts/${CLAWBACK_ACCOUNT_PUBLIC_KEY}`, {
      fixture: 'clawbackAccount.json'
    }).as('loadClawbackAccountRequest');

    cy.visit('/recipe/clawback');
  });

  it('Should performs clawback of 100 testCoin when button is clicked, and verifies the status', () => {
    cy.get('#asset-code').should('be.visible').type(ASSET_CODE_FOR_CLAWBACK);
    cy.get('#issuer-secret-key').should('be.visible').type(ISSUER_SECRET_KEY);
    cy.get('#clawback-account').should('be.visible').type(CLAWBACK_ACCOUNT_PUBLIC_KEY);
    cy.get('#is-clawback-all-enabled').should('be.visible').uncheck();
    cy.get('#amount').should('be.visible').type('100');

    cy.get('#clawback-button').click();

    cy.get('#status').within(() => {
      cy.contains('Transaction successful');
      cy.contains('See details').should(
        'have.attr',
        'href',
        `${STELLAR_EXPERT_TESTNET_EXPLORER_SERVER}/tx/${TRANSACTION_ID}`
      );
    });
  });

  it('Should perform a full clawback when checkbox is ticked', () => {
    cy.get('#asset-code').should('be.visible').type(ASSET_CODE_FOR_CLAWBACK);
    cy.get('#issuer-secret-key').should('be.visible').type(ISSUER_SECRET_KEY);
    cy.get('#clawback-account').should('be.visible').type(CLAWBACK_ACCOUNT_PUBLIC_KEY);
    cy.get('#is-clawback-all-enabled').should('be.visible').check();

    cy.get('#clawback-button').click();

    cy.get('#status').within(() => {
      cy.contains('Transaction successful');
      cy.contains('See details').should(
        'have.attr',
        'href',
        `${STELLAR_EXPERT_TESTNET_EXPLORER_SERVER}/tx/${TRANSACTION_ID}`
      );
    });
  });

  it('Should try to perform clawback when button is clicked, but fails because the available balance is less than the amount', () => {
    cy.get('#asset-code').should('be.visible').type(ASSET_CODE_FOR_CLAWBACK);
    cy.get('#issuer-secret-key').should('be.visible').type(ISSUER_SECRET_KEY);
    cy.get('#clawback-account').should('be.visible').type(CLAWBACK_ACCOUNT_PUBLIC_KEY);
    cy.get('#is-clawback-all-enabled').should('be.visible').uncheck();
    cy.get('#amount').should('be.visible').type('10000000');

    cy.get('#clawback-button').click();

    cy.get('#status').should(
      'contain',
      'Error: Error: The amount for clawback (10000000) is greater than the available balance (999900.0000000)'
    );
  });
});

it('Should show an error message when transaction fails', () => {
  cy.intercept('GET', `${HORIZON_SERVER}/accounts/${ISSUER_PUBLIC_KEY}`, {
    fixture: 'issuerAccount.json'
  }).as('loadIssuerAccountRequest');

  cy.intercept('POST', '**/transactions', { fixture: 'transactionFail.json' }).as('performClawback');
  cy.intercept('GET', `${HORIZON_SERVER}/accounts/${CLAWBACK_ACCOUNT_PUBLIC_KEY}`, {
    fixture: 'clawbackAccount.json'
  }).as('loadClawbackAccountRequest');

  cy.visit('/recipe/clawback');
  cy.get('#asset-code').should('be.visible').type(ASSET_CODE_FOR_CLAWBACK);
  cy.get('#issuer-secret-key').should('be.visible').type(ISSUER_SECRET_KEY);
  cy.get('#clawback-account').should('be.visible').type(CLAWBACK_ACCOUNT_PUBLIC_KEY);
  cy.get('#is-clawback-all-enabled').should('be.visible').check();

  cy.get('#clawback-button').click();

  cy.get('#status').should('contain', 'Error: Error: Clawback of 999900.0000000 testCoin failed.');
});
