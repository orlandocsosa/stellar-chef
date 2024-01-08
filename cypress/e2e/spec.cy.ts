const baseUrl = Cypress.config('baseUrl');

const visitAssetIssuancePage = (): void => {
  cy.visit(`${baseUrl}/recipe/asset-issuance`);
};

const createAsset = (assetCode: string): void => {
  cy.get('#asset-code').as('assetCodeInput').type(assetCode);
  cy.get('#prepare-button').click();
};

const checkPublicKeyAndSecretKey = (publicKeyElement: string, secretKeyElement: string): void => {
  cy.get(publicKeyElement).should('not.be.empty').invoke('text').should('match', /^G/).and('have.length', 56);
  cy.get(secretKeyElement).should('not.be.empty').invoke('text').should('match', /^S/).and('have.length', 56);
};

const checkCoinInfoLink = (assetCode: string): void => {
  let issuerPublicKey: string;

  cy.get('#issuerPublicKey')
    .invoke('text')
    .then((text) => {
      issuerPublicKey = text;
    })
    .then(() => {
      cy.get('#coinInfo')
        .find('a')
        .should('have.attr', 'href')
        .and('equal', `https://stellar.expert/explorer/testnet/asset/${assetCode}-${issuerPublicKey}`);
    });
};

const checkAccountInfoLink = (accountForCheckDivId: string, linkDetailsId: string): void => {
  cy.get(`#${accountForCheckDivId}`)
    .invoke('text')
    .then((accountId) => {
      cy.get(`#${linkDetailsId}`)
        .should('have.attr', 'href')
        .and('equal', `https://stellar.expert/explorer/testnet/account/${accountId}`);
    });
};
describe('Asset Creation', () => {
  beforeEach(visitAssetIssuancePage);

  it('creates a new asset', () => {
    createAsset('testAsset');

    cy.get('#status', { timeout: 30000 }).should(
      'contain',
      'Transaction successful. Distributor account balance: 1000000.0000000 testAsset'
    );

    checkCoinInfoLink('testAsset');
    checkPublicKeyAndSecretKey('#issuerPublicKey', '#issuerSecretKey');
    checkPublicKeyAndSecretKey('#distributorPublicKey', '#distributorSecretKey');
    checkAccountInfoLink('issuerPublicKey', 'issuerDetailsLink');
  });
});

describe('Asset Creation with Frozen and Clawback', () => {
  beforeEach(visitAssetIssuancePage);

  it('creates a new asset with frozen and clawback options', () => {
    createAsset('testAsset');

    cy.get('#frozen-asset').check();
    cy.get('#clawback-enabled').check();

    cy.get('#status', { timeout: 30000 }).should(
      'contain',
      'Transaction successful. Distributor account balance: 1000000.0000000 testAsset'
    );

    checkPublicKeyAndSecretKey('#issuerPublicKey', '#issuerSecretKey');
    checkPublicKeyAndSecretKey('#distributorPublicKey', '#distributorSecretKey');
    checkCoinInfoLink('testAsset');
  });
});

describe('Asset Creation with Frozen, Clawback, Freeze, and 1 holder', () => {
  beforeEach(visitAssetIssuancePage);

  it('creates a new asset with frozen and clawback options, and 1 holder', () => {
    createAsset('testAsset');

    cy.get('#frozen-asset').check();
    cy.get('#clawback-enabled').check();
    cy.get('#create-holders').check();

    cy.get('#status', { timeout: 30000 }).should(
      'contain',
      'Transaction successful. Distributor account balance: 999900.0000000 testAsset'
    );

    checkPublicKeyAndSecretKey('#issuerPublicKey', '#issuerSecretKey');
    checkPublicKeyAndSecretKey('#distributorPublicKey', '#distributorSecretKey');
    checkCoinInfoLink('testAsset');

    cy.get('#toggle-holders-button').click();

    checkPublicKeyAndSecretKey('#holder1PublicKey', '#holder1SecretKey');
    checkAccountInfoLink('holder1PublicKey', 'holder1DetailsLink');
  });
});

describe('Asset Creation Failure', () => {
  beforeEach(() => {
    visitAssetIssuancePage();
  });

  it('handles asset creation failure with blank asset name', () => {
    cy.get('#prepare-button').click();

    cy.get('#status', { timeout: 30000 }).should(
      'contain',
      'Error: Error: Asset code is invalid (maximum alphanumeric, 12 characters at max)'
    );
  });

  it('handles asset creation failure with zero balance for holder', () => {
    cy.get('#create-holders').check();
    cy.get('#balance-value').clear().type('0');
    createAsset('testAsset');

    cy.get('#status', { timeout: 30000 }).should(
      'contain',
      'Error: TypeError: amount argument must be of type String, represent a positive number and have at most 7 digits after the decimal'
    );
  });
});
