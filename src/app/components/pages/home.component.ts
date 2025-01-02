import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../home/layouts/header/header.component';
import { HeroComponent } from '../home/hero/hero.component';
import { FeaturesComponent } from '../home/features/features.component';
import { StepsComponent } from '../home/steps/steps.component';
import { PricingComponent } from '../home/pricing/pricing.component';
import { CtaComponent } from '../home/cta/cta.component';
import { FooterComponent } from '../home/layouts/footer/footer.component';

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
