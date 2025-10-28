# Revamply - Complete CSS Architecture
## Unique Classes for Every Element

This document maps every element on the page to a unique class for precise styling control.

---

## Header Section
```
.header-wrapper - Header container
.header-logo - Logo image
.nav-solutions - "Solutions" nav link
.nav-process - "Process" nav link
.nav-about - "About" nav link
.nav-contact - "Contact" nav link
.header-cta-btn - "Get Started" button
```

## Hero Section
```
.hero-wrapper - Hero section container
.hero-icon - Lightning bulb icon
.hero-title-line1 - "AI Solutions That"
.hero-title-line2 - "Save Time, Cut Costs"
.hero-title-line3 - "& Grow Revenue"
.hero-description - Main hero paragraph
.hero-cta-btn - Main CTA button
```

## Why Trust Revamply Section
```
.why-trust-wrapper - Section container
.why-trust-title - Section heading
.why-trust-subtitle - Section subheading

.efficiency-card - Card 1
.efficiency-icon - Icon in card 1
.efficiency-title - "Intelligent Efficiency"
.efficiency-text - Description

.overhead-card - Card 2
.overhead-icon - Icon in card 2
.overhead-title - "Reduce Overhead"
.overhead-text - Description

.growth-card - Card 3
.growth-icon - Icon in card 3
.growth-title - "Accelerate Growth"
.growth-text - Description
```

## Transformation Process Section
```
.process-wrapper - Section container
.process-title - "Our Proven AI Transformation Process"
.process-subtitle - Description paragraph

.discover-card - Step 1 card
.discover-icon - Icon
.discover-title - "Discover"
.discover-text - Description

.blueprint-card - Step 2 card
.blueprint-icon - Icon
.blueprint-title - "Blueprint"
.blueprint-text - Description

.build-card - Step 3 card
.build-icon - Icon
.build-title - "Build"
.build-text - Description

.optimize-card - Step 4 card
.optimize-icon - Icon
.optimize-title - "Optimize"
.optimize-text - Description
```

## Expectations Section
```
.expectations-wrapper - Section container
.expectations-title - "What You Can Expect"
.expectations-timeline - "3-5" large number
.expectations-timeline-text - "From Start to Launch"

.expect-item-1 - Weekly progress updates
.expect-item-2 - Direct access to AI team
.expect-item-3 - Hands-on training
.expect-item-4 - 30-day optimization
.expect-item-5 - Ongoing support
```

## Advanced AI Capabilities Section
```
.capabilities-wrapper - Section container (dark card)
.capabilities-title - "Advanced AI Capabilities"
.capabilities-description - Description text
```

## Metrics Section (Risk Assessment)
```
.metrics-wrapper - Section container
.metrics-title - "Risk assessment automation"

.metric-conversion - Lead Conversion card
.metric-conversion-value - "+85%"
.metric-conversion-label - "Lead Conversion Rate"

.metric-response - Response Time card
.metric-response-value - "< 30s"
.metric-response-label - "Response Time"

.metric-satisfaction - Customer Satisfaction card
.metric-satisfaction-value - "94%"
.metric-satisfaction-label - "Customer Satisfaction"
```

## AI That Pays Section
```
.roi-wrapper - Section container
.roi-title - "AI That Pays for Itself"
.roi-description - Description paragraph
.roi-cta-card - Quote request card
.roi-cta-text - Card text
.roi-cta-btn - "Get Custom Pricing Quote" button
```

## Business Bottlenecks Section
```
.bottlenecks-wrapper - Section container
.bottlenecks-title-part1 - "Your Business Bottlenecks"
.bottlenecks-title-part2 - "End Here"
.bottlenecks-description - Description text
.bottlenecks-cta-btn - "Get My Free AI Solution Blueprint"

.guarantee-icon - Green checkmark icon
.guarantee-text - "30-day satisfaction guarantee"

.launch-icon - Blue lightning icon
.launch-text - "3-5 weeks to launch"

.partner-icon - Pink headphones icon
.partner-text - "We're your long-term partner"
```

## Footer Section
```
.footer-wrapper - Footer container
.footer-tagline - "We design, build, and maintain..." text

.footer-nav-title - "Agentic AI"
.footer-nav-item-1 - "Agents"
.footer-nav-item-2 - "AI Chatbots"
.footer-nav-item-3 - "Process Automation"
.footer-nav-item-4 - "Predictive Analytics"
.footer-nav-item-5 - "Custom AI Platforms"

.footer-about-title - "About Us"
.footer-about-item-1 - "Case Studies"
.footer-about-item-2 - "Careers"
.footer-about-item-3 - "Contact"

.footer-copyright - Copyright text
```

## Form Section
```
.form-wrapper - Form section container
.form-title - "Get Your Free AI Solution Blueprint"
.form-description - Description text

.form-field-name - Name input
.form-label-name - "Your Name" label
.form-field-email - Email input
.form-label-email - "Business Email" label

.form-field-company - Company input
.form-label-company - "Company Name" label

.form-field-role - Role input
.form-label-role - "Your Role" label

.form-field-employees - Employees select
.form-label-employees - "Company Size" label

.form-field-industry - Industry select
.form-label-industry - "Industry" label

.form-field-challenges - Challenges textarea
.form-label-challenges - "Business Challenges" label

.form-field-phone - Phone input
.form-label-phone - "Phone Number" label

.form-submit-btn - Submit button
```

---

## CSS File Structure

Each CSS file will style these unique classes according to:
- **dark-desktop.css** - Dark mode styles for desktop (min-width: 769px)
- **dark-mobile.css** - Dark mode styles for mobile (max-width: 768px)
- **light-desktop.css** - Light mode styles for desktop (min-width: 769px)
- **light-mobile.css** - Light mode styles for mobile (max-width: 768px)

---

## Loading Strategy

```html
<!-- Base styles (reset, layout, animations) -->
<link rel="stylesheet" href="css/base.css">

<!-- Dark Mode Styles -->
<link rel="stylesheet" href="css/dark-desktop.css" media="(prefers-color-scheme: dark) and (min-width: 769px)">
<link rel="stylesheet" href="css/dark-mobile.css" media="(prefers-color-scheme: dark) and (max-width: 768px)">

<!-- Light Mode Styles -->
<link rel="stylesheet" href="css/light-desktop.css" media="(prefers-color-scheme: light) and (min-width: 769px)">
<link rel="stylesheet" href="css/light-mobile.css" media="(prefers-color-scheme: light) and (max-width: 768px)">
```

This ensures:
- ✅ No cascade conflicts
- ✅ Clean separation of concerns  
- ✅ Easy maintenance
- ✅ Admin panel can override specific classes
- ✅ No !important needed
