import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../layouts/header/header.component';
import { HeroComponent } from '../hero/hero.component';
import { FeaturesComponent } from '../features/features.component';
import { StepsComponent } from '../steps/steps.component';
import { PricingComponent } from '../pricing/pricing.component';
import { CtaComponent } from '../cta/cta.component';
import { FooterComponent } from '../layouts/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    HeaderComponent,
    HeroComponent,
    FeaturesComponent,
    StepsComponent,
    PricingComponent,
    CtaComponent,
    FooterComponent
  ],
  template: `
    <app-header />
    <app-hero />
    <app-features />
    <app-steps />
    <app-pricing />
    <app-cta />
    <app-footer />
  `
})
export class HomeComponent {}