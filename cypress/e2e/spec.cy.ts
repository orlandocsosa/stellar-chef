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

describe('Asset Creation', () => {
  beforeEach(visitAssetIssuancePage);

  it('creates a new asset', () => {
    createAsset('testAsset');

    cy.get('#status', { timeout: 30000 }).should(
      'contain',
      'Transaction successful. Distributor account balance: 1000000.0000000 testAsset'
    );

    checkPublicKeyAndSecretKey('#issuerPublicKey', '#issuerSecretKey');
    checkPublicKeyAndSecretKey('#distributorPublicKey', '#distributorSecretKey');
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
  });
});

describe('Asset Creation with Frozen, Clawback, and Freeze', () => {
  beforeEach(visitAssetIssuancePage);

  it('creates a new asset with frozen and clawback options', () => {
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

    cy.get('#toggle-holders-button').click();

    // Check the holder's public key
    checkPublicKeyAndSecretKey('#holder1PublicKey', '#holder1SecretKey');
  });
});
