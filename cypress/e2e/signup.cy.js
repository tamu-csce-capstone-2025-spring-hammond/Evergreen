describe('Signup Page', () => {
    beforeEach(() => {
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
  
    it('displays the signup form', () => {
      cy.get('form').should('exist');
    });

    it('user can signup', () =>{
        const uniqueEmail = `testuser+${Date.now()}@example.com`;

        cy.visit('/signup')
        cy.get('input[name="name"]').type("test")
        cy.get('input[name="email"]').type(uniqueEmail);
        cy.get('input[name="password"]').type('Password12!');
        cy.get('input[name="confirmPassword"]').type('Password12!');
        cy.get('button[type="submit"]').click();

        cy.url().should('include', '/dashboard');
    });

    it('fails to signup with incorrect password format', () => {
        cy.visit('/signup');
        cy.get('input[name="name"]').type("test")
        cy.get('input[name="email"]').type("test@email.com");
        cy.get('input[name="password"]').type('password');
        cy.get('input[name="confirmPassword"]').type('password');
        cy.get('button[type="submit"]').click();
        // Expect some kind of error
        cy.contains('Password must have at least 1 upper case letter, 1 lower case latter, 1 number and 1 symbol').should('be.visible');
      });

      it('fails to signup with non-matching password format', () => {
        cy.visit('/signup');
        cy.get('input[name="name"]').type("test")
        cy.get('input[name="email"]').type("test@email.com");
        cy.get('input[name="password"]').type('password');
        cy.get('input[name="confirmPassword"]').type('password1');
        cy.get('button[type="submit"]').click();
        // Expect some kind of error
        cy.contains('Passwords do not match').should('be.visible');
      });

      it('fails to signup with short username format', () => {
        cy.visit('/signup');
        cy.get('input[name="name"]').type("t")
        cy.get('input[name="email"]').type("test@email.com");
        cy.get('input[name="password"]').type('Password12!');
        cy.get('input[name="confirmPassword"]').type('Password12!');
        cy.get('button[type="submit"]').click();
        // Expect some kind of error
        cy.contains('user_name must be at least 4 characters long').should('be.visible');
      });
      
      it('fails to signup with short username format', () => {
        cy.visit('/signup');
        cy.get('input[name="name"]').type("t")
        cy.get('input[name="email"]').type("test@email.com");
        cy.get('input[name="password"]').type('Password12!');
        cy.get('input[name="confirmPassword"]').type('Password12!');
        cy.get('button[type="submit"]').click();
        // Expect some kind of error
        cy.contains('user_name must be at least 4 characters long').should('be.visible');
      });
  });
  