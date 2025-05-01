describe('Portfolio', ()=> {
    Cypress.on('uncaught:exception', (err) => {
        if (
          err.message.includes('Hydration failed') ||
          err.message.includes('Minified React error #418')
        ) {
          return false;
        }
      });

      it('Create, edit, delete a portfolio', () => {
        cy.visit('/login');

        cy.get('input[name="email"]').type('shanti@gmail.com');
        cy.get('input[name="password"]').type('Password12!');
        cy.get('button[type="submit"]').click();

        cy.url().should('include', '/user');

        cy.get('a[href="/user/portfolios"]').click();
        cy.url().should('include', '/user/portfolios');

        cy.contains('button', 'Create New').click();

        cy.get('input[placeholder="Enter Portfolio Name"]').type('My Portfolio');
        cy.get('input[placeholder="Enter Initial Deposit"]').type('100000');
        cy.get('.custom-date-picker').type('2025-05-15').trigger('change');
        cy.get('input[type="color"]').invoke('val', '#FF5733').trigger('change');  
        cy.get('input[type="range"]').invoke('val', '5').trigger('change');
        cy.contains('label', 'Bitcoin Focus').find('input[type="checkbox"]').check();
        cy.contains('label', 'Value Focus').find('input[type="checkbox"]').check();

        cy.contains('button', 'Next').click();
        cy.contains('button', 'Confirm').click();

        cy.url().should('include', '/user/portfolios');

        cy.contains('h3', 'My Portfolio').should('exist');

        cy.contains('.cursor-pointer h3', 'My Portfolio').parents('.cursor-pointer').click();

        cy.contains('button', 'Edit').click();
        cy.contains('label', 'Name:').next('input').type('My Portfolio Name');
        cy.contains('button', 'Save').click();

        cy.contains('.cursor-pointer h3', 'My Portfolio Name').parents('.cursor-pointer').click();
        cy.contains('button', 'Edit').click();
        cy.contains('button', 'Delete').click();

        cy.url().should('include', '/user/portfolios');
      });


      it('Creates a portfolio with negative balance', () => {
        cy.visit('/login');

        cy.get('input[name="email"]').type('shanti@gmail.com');
        cy.get('input[name="password"]').type('Password12!');
        cy.get('button[type="submit"]').click();

        cy.url().should('include', '/user');

        cy.get('a[href="/user/portfolios"]').click();
        cy.url().should('include', '/user/portfolios');

        cy.contains('button', 'Create New').click();

        cy.get('input[placeholder="Enter Portfolio Name"]').type('My Portfolio Name');
        cy.get('input[placeholder="Enter Initial Deposit"]').type('-10000');
        cy.get('.custom-date-picker').type('2025-05-15').trigger('change');
        cy.get('input[type="color"]').invoke('val', '#FF5733').trigger('change');  
        cy.get('input[type="range"]').invoke('val', '5').trigger('change');
        cy.contains('label', 'Bitcoin Focus').find('input[type="checkbox"]').check();
        cy.contains('label', 'Value Focus').find('input[type="checkbox"]').check();

        cy.contains('button', 'Next').click();

        cy.contains('Initial deposit must be greater than 0').should('be.visible')
      });
});
