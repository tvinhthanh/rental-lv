# rental-lv

Multi-tenant vehicle rental platform. Covers the whole commercial lifecycle of a
rental — from the moment a customer asks for a car to the moment the damage
surcharge is settled — plus the marketing surface that brings them in.

pnpm monorepo: **NestJS + Prisma + MongoDB** behind a **Next.js App Router**
frontend. 38 backend modules, 39 data models, three role-scoped interfaces.

## The lifecycle is the architecture

Most rental software models a booking and bolts everything else onto it. This
one gives every step its own record, because each step is a different legal and
financial fact and they must be able to disagree:

```
Booking      the customer's intent — dates, vehicle class, branch
   ▼
Contract     the agreement actually signed, with its own terms
   ▼
Deposit      money held, with DepositDetail tracking each movement
   ▼
Handover     the vehicle's condition at the moment keys change hands
   ▼
ReturnReport the condition when it comes back
   ▼
Invoice ─> Payment ─> Surcharge   damage, fuel, late return
```

**`Handover` and `ReturnReport` are the point of the whole system.** Vehicle
rental disputes are almost never about the rate — they are about whether that
scratch was already there. Two dated condition records, captured separately by
different people at different times, are what makes that argument resolvable.
Collapsing them into fields on the booking destroys the evidence.

Similarly, `Deposit` is separate from `Payment`: money held is not money earned,
and a system that cannot express the difference will eventually recognise revenue
it has to give back.

## Multi-tenancy

`Tenant` and `SubscriptionPlan` make this a product rather than an installation.
Each rental company operates its own `Branch` set, fleet, pricing and staff
within one deployment, and plan tier gates what a tenant can reach.

## Pricing

Rates are not a column on the vehicle:

- **`PriceList`** — seasonal and per-category base rates
- **`PricingRule`** — conditional adjustments layered on top
- **`Promotion`** — campaign discounts with their own validity
- **`Surcharge`** — post-return additions, which is the only place a price is
  allowed to move after the fact

## Retention

`CustomerSegment` groups customers by behaviour; `MarketingCampaign` targets
those segments; `LoyaltyProgram` defines earning rules and `LoyaltyTransaction`
records every point movement as its own row rather than mutating a balance —
so a customer's point total can always be explained.

`NotificationTemplate` and `Notification` keep message copy out of the code, so
changing what a booking-confirmation email says is not a deploy.

## Fleet operations

`Vehicle` carries `VehicleCategory` and `VehicleBrand`; `VehicleDocument` tracks
registration and insurance with their expiry, and `Maintenance` records service
history. A vehicle whose insurance lapsed is a vehicle that must not be rentable,
and that can only be enforced if the document is modelled.

## Three interfaces, three route groups

```
frontends/app/
├── (admin-group)/     29 admin surfaces — fleet, pricing, staff, marketing, audit
├── (employee-group)/  counter staff — bookings, contracts, deposits, handover, returns
└── (auth-group)/      authentication, isolated layout
```

Employee screens are deliberately narrower than admin ones: someone handing over
a car needs six actions, not twenty-nine.

Public marketing pages, blog and SEO redirects are modelled server-side
(`Page`, `BlogPost`, `BlogCategory`, `SeoRedirect`) — a rental business is found
through search, so content is part of the product, not a separate site.

## Accountability

`AuditLog` records sensitive operations. In a business where staff can discount a
rate, waive a surcharge or alter a return report, an unlogged admin panel is a
liability.

## Repository

```
backend/     NestJS · Prisma · MongoDB
frontends/   Next.js App Router · React · Tailwind
car_rental_erd_full.dbml    the full ERD, versioned alongside the code
```

The ERD is committed as a `.dbml` file rather than living in a diagramming tool,
so the data model is reviewed in pull requests like everything else.

## Running it

```bash
pnpm install
cd backend && cp .env.example .env    # Mongo URI, JWT secret, Cloudinary
pnpm prisma generate && pnpm start:dev
cd ../frontends && pnpm dev
```

## Note on authorship

Team project. I authored the majority of the codebase — 57 of 85 commits,
including the rental lifecycle model and the admin surface. Commit history is
unmodified and shows exactly who wrote what.
