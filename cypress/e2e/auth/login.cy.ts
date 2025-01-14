describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/auth/login');
    cy.intercept('POST', '/api/auth/login').as('loginRequest');
  });

  it('should display login form with all elements', () => {
    cy.get('h2').should('contain', 'Login');

    cy.get('input[formControlName="username"]').should('be.visible');
    cy.get('input[formControlName="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
    
    cy.get('a[routerLink="/auth/register"]').should('be.visible')
      .and('contain', "Don't have an account? Register here");
  });

  describe('Form Validation', () => {
    it('should show validation errors when submitting empty form', () => {
      cy.get('input[formControlName="username"]').click({ force: true });
      cy.get('input[formControlName="password"]').click({ force: true });
      cy.get('button[type="submit"]').click({ force: true });

      cy.get('div.text-red-600').should('have.length', 2);
      cy.contains('Username is required').should('be.visible');
      cy.contains('Password is required').should('be.visible');
    });

    it('should show validation error for invalid username format', () => {
      cy.get('input[formControlName="username"]').type('user@name!');
      cy.get('input[formControlName="username"]').blur();

      cy.contains('Username can only contain letters, numbers, underscores, and hyphens')
        .should('be.visible');
    });

    it('should show validation error for short username', () => {
      cy.get('input[formControlName="username"]').type('us');
      cy.get('input[formControlName="username"]').blur();

      cy.contains('Username must be at least 3 characters')
        .should('be.visible');
    });

    it('should show validation error for short password', () => {
      cy.get('input[formControlName="password"]').type('pass');
      cy.get('input[formControlName="password"]').blur();

      cy.contains('Password must be at least 6 characters')
        .should('be.visible');
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should toggle password visibility', () => {
      cy.get('input[formControlName="password"]')
        .should('have.attr', 'type', 'password');

      cy.get('button.text-gray-400').click();
      
      cy.get('input[formControlName="password"]')
        .should('have.attr', 'type', 'text');

      cy.get('button.text-gray-400').click();
      
      cy.get('input[formControlName="password"]')
        .should('have.attr', 'type', 'password');
    });
  });

  describe('Login Functionality', () => {
    it('should handle successful login', () => {
      cy.intercept('POST', '/api/auth/login', (req) => {
        req.reply((res) => {
          expect(res.body).to.have.property('accessToken').and.to.be.a('string');
          expect(res.body).to.have.property('refreshToken').and.to.be.a('string');
          expect(res.body).to.have.property('user').and.to.be.an('object');
          return res;
        });
      }).as('loginRequest');

      cy.get('input[formControlName="username"]').type('testuser');
      cy.get('input[formControlName="password"]').type('password123');
      
      cy.get('button[type="submit"]').click();

      cy.wait('@loginRequest');

      cy.url().should('include', '/dashboard');
    });

    it('should handle failed login with invalid credentials', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 401,
        body: {
          message: 'Invalid username or password'
        }
      }).as('loginRequest');

      cy.get('input[formControlName="username"]').type('wronguser');
      cy.get('input[formControlName="password"]').type('wrongpass');
      
      cy.get('button[type="submit"]').click();

      cy.wait('@loginRequest');

      cy.get('.bg-red-50').should('be.visible')
        .and('contain', 'Invalid username or password');

      cy.url().should('include', '/auth/login');
    });

    it('should handle network error during login', () => {
      cy.intercept('POST', '/api/auth/login', {
        forceNetworkError: true
      }).as('loginRequest');

      cy.get('input[formControlName="username"]').type('testuser');
      cy.get('input[formControlName="password"]').type('password123');
      
      cy.get('button[type="submit"]').click();

      cy.get('.bg-red-50').should('be.visible')
        .and('contain', 'Unable to connect to the server');
    });
  });

  describe('Loading State', () => {
    it('should show loading state during login', () => {
      cy.intercept('POST', '/api/auth/login', {
        delay: 1000,
        statusCode: 200,
        body: {
          accessToken: 'fake-token',
          user: {
            id: 1,
            username: 'testuser',
            role: 'USER'
          }
        }
      }).as('loginRequest');

      cy.get('input[formControlName="username"]').type('testuser');
      cy.get('input[formControlName="password"]').type('password123');
      
      cy.get('button[type="submit"]').click();

      cy.get('button[type="submit"]').should('be.disabled');
      cy.get('button[type="submit"] .animate-spin').should('be.visible');
      cy.contains('Logging in...').should('be.visible');

      cy.wait('@loginRequest');
    });
  });
});