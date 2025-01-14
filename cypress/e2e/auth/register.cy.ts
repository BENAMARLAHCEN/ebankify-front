describe('Register Page', () => {
  beforeEach(() => {
    cy.visit('/auth/register');
    cy.intercept('POST', '/api/auth/register').as('registerRequest');
  });

  it('should display register form with all elements', () => {
    cy.get('h2').should('contain', 'Register');

    cy.get('input[formControlName="username"]').should('be.visible');
    cy.get('input[formControlName="email"]').should('be.visible');
    cy.get('input[formControlName="password"]').should('be.visible');
    cy.get('input[formControlName="birthday"]').should('be.visible');
    cy.get('input[formControlName="monthlyIncome"]').should('be.visible');
    cy.get('input[formControlName="collateralAvailable"]').should('be.visible');
    cy.get('input[formControlName="customerSince"]').should('be.visible');
    cy.get('select[formControlName="role"]').should('be.visible');

    cy.get('button[type="submit"]').should('be.visible');
    
    cy.get('a[routerLink="/auth/login"]').should('be.visible')
      .and('contain', 'Already have an account? Login here');
  });

  describe('Form Validation', () => {
    it('should show validation errors when submitting empty form', () => {
      cy.get('input[formControlName="username"]').click({ force: true });
      cy.get('input[formControlName="email"]').click({ force: true });
      cy.get('input[formControlName="password"]').click({ force: true });
      cy.get('input[formControlName="birthday"]').click({ force: true });
      cy.get('input[formControlName="monthlyIncome"]').click({ force: true });
      

      cy.get('div.text-red-600').should('have.length.at.least', 4);
      cy.contains('Username is required').should('be.visible');
      cy.contains('Email is required').should('be.visible');
      cy.contains('Password is required').should('be.visible');
      cy.contains('Birthday is required').should('be.visible');
    });

    describe('Username Validation', () => {
      it('should validate username format', () => {
        const testCases = [
          { input: 'ab', error: 'Username must be at least 3 characters' },
          { input: 'user@name', error: 'Username can only contain letters, numbers, underscores, and hyphens' },
          { input: 'valid_user_123', error: null }
        ];

        testCases.forEach(test => {
          cy.get('input[formControlName="username"]').clear().type(test.input).blur();
          if (test.error) {
            cy.contains(test.error).should('be.visible');
          } else {
            cy.get('div.text-red-600').should('not.exist');
          }
        });
      });
    });

    describe('Password Validation', () => {
      it('should validate password requirements', () => {
        const testCases = [
          { 
            input: 'short', 
            error: 'Password must be at least 8 characters' 
          },
          { 
            input: 'Password123!', 
            error: null 
          }
        ];

        testCases.forEach(test => {
          cy.get('input[formControlName="password"]').clear().type(test.input);
          cy.get('input[formControlName="username"]').click();
          if (test.error) {
            cy.contains(test.error).should('be.visible');
          } 
        });
      });

      it('should toggle password visibility', () => {
        cy.get('input[formControlName="password"]')
          .should('have.attr', 'type', 'password');
        
        cy.get('button.text-gray-400').click();
        
        cy.get('input[formControlName="password"]')
          .should('have.attr', 'type', 'text');
      });
    });

    describe('Date Fields Validation', () => {
      it('should validate birthday is in the past and user is over 18', () => {
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        
        cy.get('input[formControlName="birthday"]')
          .type(futureDate.toISOString().split('T')[0]);
        
        cy.get('button[type="submit"]').click({ force: true });
        
        cy.contains('You must be at least 18 years old').should('be.visible');

        const underageDate = new Date();
        underageDate.setFullYear(underageDate.getFullYear() - 17);
        
        cy.get('input[formControlName="birthday"]')
          .clear()
          .type(underageDate.toISOString().split('T')[0]);
        
        cy.contains('You must be at least 18 years old').should('be.visible');
      });
    });
  });

  describe('Registration Functionality', () => {
    it('should handle successful registration', () => {
      cy.intercept('POST', '/api/auth/register', {
        statusCode: 200,
        body: {
          message: 'Registration successful'
        }
      }).as('registerRequest');

      const validDate = new Date();
      validDate.setFullYear(validDate.getFullYear() - 20);

      cy.get('input[formControlName="username"]').type('testuser');
      cy.get('input[formControlName="email"]').type('test@example.com');
      cy.get('input[formControlName="password"]').type('Password123!');
      cy.get('input[formControlName="birthday"]')
        .type(validDate.toISOString().split('T')[0]);
      cy.get('input[formControlName="monthlyIncome"]').type('5000');
      cy.get('input[formControlName="collateralAvailable"]').type('House and Car');
      cy.get('input[formControlName="customerSince"]')
        .type(validDate.toISOString().split('T')[0]);
      cy.get('select[formControlName="role"]').select('USER');

      cy.get('button[type="submit"]').click();

      cy.wait('@registerRequest');

      cy.url().should('include', '/auth/login');
    });

    it('should handle username already exists error', () => {
      cy.intercept('POST', '/api/auth/register', {
        statusCode: 409,
        body: {
          message: 'Username already exists'
        }
      }).as('registerRequest');

      fillValidRegistrationForm('existinguser');

      cy.get('button[type="submit"]').click();

      cy.wait('@registerRequest');

      cy.get('.bg-red-50').should('be.visible')
        .and('contain', 'Username already exists');
    });

    it('should handle email already exists error', () => {
      cy.intercept('POST', '/api/auth/register', {
        statusCode: 409,
        body: {
          message: 'Email already exists'
        }
      }).as('registerRequest');

      fillValidRegistrationForm('newuser', 'existing@example.com');

      cy.get('button[type="submit"]').click();

      cy.wait('@registerRequest');

      cy.get('.bg-red-50').should('be.visible')
        .and('contain', 'Email already exists');
    });

    it('should handle server error during registration', () => {
      cy.intercept('POST', '/api/auth/register', {
        statusCode: 500,
        body: {
          message: 'Internal server error'
        }
      }).as('registerRequest');

      fillValidRegistrationForm();

      cy.get('button[type="submit"]').click();

      cy.wait('@registerRequest');

      cy.get('.bg-red-50').should('be.visible')
        .and('contain', 'An unexpected error occurred');
    });

    it('should handle network error during registration', () => {
      cy.intercept('POST', '/api/auth/register', {
        forceNetworkError: true
      }).as('registerRequest');

      fillValidRegistrationForm();

      cy.get('button[type="submit"]').click();

      cy.get('.bg-red-50').should('be.visible')
        .and('contain', 'Unable to connect to the server');
    });
  });

  function fillValidRegistrationForm(username = 'testuser', email = 'test@example.com') {
    const validDate = new Date();
    validDate.setFullYear(validDate.getFullYear() - 20);

    cy.get('input[formControlName="username"]').type(username);
    cy.get('input[formControlName="email"]').type(email);
    cy.get('input[formControlName="password"]').type('Password123!');
    cy.get('input[formControlName="birthday"]')
      .type(validDate.toISOString().split('T')[0]);
    cy.get('input[formControlName="monthlyIncome"]').type('5000');
    cy.get('input[formControlName="collateralAvailable"]').type('House and Car');
    cy.get('input[formControlName="customerSince"]')
      .type(validDate.toISOString().split('T')[0]);
    cy.get('select[formControlName="role"]').select('USER');
  }

  describe('Loading State', () => {
    it('should show loading state during registration', () => {
      cy.intercept('POST', '/api/auth/register', {
        delay: 1000,
        statusCode: 200,
        body: {
          message: 'Registration successful'
        }
      }).as('registerRequest');

      fillValidRegistrationForm();
      
      cy.get('button[type="submit"]').click();

      cy.get('button[type="submit"]').should('be.disabled');
      cy.get('button[type="submit"] .animate-spin').should('be.visible');
      cy.contains('Registering...').should('be.visible');

      cy.wait('@registerRequest');
    });
  });
});