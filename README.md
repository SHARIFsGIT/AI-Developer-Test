# E-commerce Product Search with NPL model

## How to Run
1. Clone the repository: `git clone https://github.com/SHARIFsGIT/AI-Developer-Test.git`
2. Install dependencies: `npm install --legacy-peer-deps`
3. Install Lucide React: `npm install lucide-react --legacy-peer-deps`
4. Start the application: `npm start`
5. Open http://localhost:3000

## AI Feature Chosen
**Smart Product Search (NLP)**

Natural language processing that understands queries like:
- "mens clothing under $50"
- "electronics between $100 and $200"
- "black items with good reviews"

## Features
- AI-powered natural language search with real-time filter extraction
- Traditional category filtering (All, Men's, Women's, Jewelry, Electronics)
- Confidence scoring for AI analysis
- Price range detection (under, over, between)
- Color and size preference detection
- Rating-based filtering
- Responsive Bootstrap design
- Redux cart management with toast notifications

## Tools/Libraries Used
- React.js with Hooks for component logic
- Redux for state management
- Bootstrap for responsive styling
- Fake Store API for product data (20 products)
- Custom NLP processing engine
- React Loading Skeleton for loading states

## Notable Assumptions
- NLP processing simulates OpenAI API functionality for demonstration
- Rating filters use product's actual rating data when available
- Price extraction supports multiple formats: "under/over/below/above/between"
- AI confidence scoring based on query complexity and matched filters
- Compatible with existing Redux store structure

## Blockchain Integration Potential
This AI search system could be enhanced with blockchain features such as token-gated pricing where premium members receive AI-recommended discounts. Smart contracts could also enable loyalty rewards based on AI-driven purchase patterns.