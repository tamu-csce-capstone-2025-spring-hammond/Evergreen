describe('Login Page', () => {
    beforeEach(() => {
      // Ignore hydration + 418 React errors
      Cypress.on('uncaught:exception', (err) => {
        if (
          err.message.includes('Hydration failed') ||
          err.message.includes('Minified React error #418')
        ) {
          return false;
        }
      });
  
      cy.visit('/login');
    });
  
    it('displays the login form', () => {
      cy.get('form').should('exist');
    });

    it('user can login', () =>{
        cy.get('input[name="email"]').type('scpanakin@gmail.com');
        cy.get('input[name="password"]').type('Password12!');
        cy.get('button[type="submit"]').click();

        cy.url().should('include', '/dashboard');
    });

    it('fails to login with wrong password', () => {
        cy.visit('/login');
        cy.get('input[name="email"]').type('scpanakin@gmail.com');
        cy.get('input[name="password"]').type('wrongpassword');
        cy.get('button[type="submit"]').click();
      
        // Expect some kind of error
        cy.contains('Invalid password').should('be.visible');
      });
  });
  