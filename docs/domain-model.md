# Domain Model

The Prisma schema is the source of truth for Swapy Campus entities. It starts from the provided UML and extends it for transactions, trust scoring, recommendations, and sustainability dashboards.

```mermaid
erDiagram
    USER ||--o{ LISTING : publishes
    USER ||--o{ REPAIR_TICKET : initiates
    USER ||--o{ FEEDBACK : writes
    USER ||--o{ MARKETPLACE_TRANSACTION : requests
    USER ||--o{ TRUST_SCORE_SNAPSHOT : receives
    CATEGORY ||--o{ LISTING : classifies
    LISTING ||--o{ FEEDBACK : receives
    LISTING ||--o{ MARKETPLACE_TRANSACTION : fulfills
    LISTING ||--o{ RECOMMENDATION_EVENT : appears_in
    MARKETPLACE_TRANSACTION ||--o{ SUSTAINABILITY_IMPACT_EVENT : creates

    USER {
        string id PK
        string firstName
        string lastName
        string email
        string passwordHash
        string imageUrl
        enum campus
        decimal reputationScore
        int totalPoints
        enum role
    }

    CATEGORY {
        string id PK
        string name
        string slug
    }

    LISTING {
        string id PK
        string userId FK
        string categoryId FK
        string title
        string description
        enum condition
        enum listingType
        decimal price
        enum status
        string imageUrl
        string location
    }

    REPAIR_TICKET {
        string id PK
        string userId FK
        string deviceName
        string problemDescription
        string aiRecommendation
        decimal estimatedRepairCost
        decimal estimatedResaleValue
        decimal estimatedReplacementCost
        enum status
    }

    FEEDBACK {
        string id PK
        string listingId FK
        string reviewerId FK
        int rating
        string comment
    }
```

## Core Entities

- `User`: student/admin identity, campus, reputation, points, and credentials.
- `Category`: classifies listings.
- `Listing`: marketplace item or repair service published by a user.
- `RepairTicket`: AI-assisted repair request and cost prediction.
- `Feedback`: rating and review for a listing.
- `MarketplaceTransaction`: sale, donation, exchange, or repair-service workflow.
- `TrustScoreSnapshot`: historical trust score predictions for fraud/reliability tracking.
- `RecommendationEvent`: stores recommendation impressions/clicks for future AI tuning.
- `SustainabilityImpactEvent`: measurable CO2, e-waste, water, and money-saved impact.
