import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { addCart } from "../redux/action";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import { Brain, Filter, Search, Zap } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const Products = () => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAISearch, setIsAISearch] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);

  const dispatch = useDispatch();

  const addProduct = (product) => {
    dispatch(addCart(product));
  };

  useEffect(() => {
    const getProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch("https://fakestoreapi.com/products/");
        const products = await response.json();
        setData(products);
        setFilter(products);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };

    getProducts();
  }, []);

  // NLP processing function for queries
  const processNaturalLanguageQuery = (query) => {
    const lowerQuery = query.toLowerCase();
    
    // Extract price filters with multiple formats
    let maxPrice = null;
    let minPrice = null;
    
    // Price extraction patterns
    // "show me phones under 200"
    const underMatches = lowerQuery.match(/under\s+\$?(\d+)/);
    const belowMatches = lowerQuery.match(/below\s+\$?(\d+)/);
    const lessMatches = lowerQuery.match(/less\s+than\s+\$?(\d+)/);
    const maxMatches = lowerQuery.match(/max\s+\$?(\d+)/);
    
    if (underMatches || belowMatches || lessMatches || maxMatches) {
      maxPrice = parseInt(
        (underMatches && underMatches[1]) ||
        (belowMatches && belowMatches[1]) ||
        (lessMatches && lessMatches[1]) ||
        (maxMatches && maxMatches[1])
      );
    }
    
    const overMatches = lowerQuery.match(/over\s+\$?(\d+)/);
    const aboveMatches = lowerQuery.match(/above\s+\$?(\d+)/);
    const moreMatches = lowerQuery.match(/more\s+than\s+\$?(\d+)/);
    const minMatches = lowerQuery.match(/min\s+\$?(\d+)/);
    
    if (overMatches || aboveMatches || moreMatches || minMatches) {
      minPrice = parseInt(
        (overMatches && overMatches[1]) ||
        (aboveMatches && aboveMatches[1]) ||
        (moreMatches && moreMatches[1]) ||
        (minMatches && minMatches[1])
      );
    }

    // Price range extraction
    const rangeMatches = lowerQuery.match(/between\s+\$?(\d+)\s+and\s+\$?(\d+)/);
    if (rangeMatches) {
      minPrice = parseInt(rangeMatches[1]);
      maxPrice = parseInt(rangeMatches[2]);
    }
    
    // Extract rating filters
    let minRating = null;
    if (lowerQuery.includes('good rating') || lowerQuery.includes('well rated') || lowerQuery.includes('good reviews')) {
      minRating = 4.0;
    }
    if (lowerQuery.includes('excellent') || lowerQuery.includes('best rated') || lowerQuery.includes('top rated') || lowerQuery.includes('5 star')) {
      minRating = 4.5;
    }
    if (lowerQuery.includes('highly rated') || lowerQuery.includes('popular') || lowerQuery.includes('recommended')) {
      minRating = 4.2;
    }
    if (lowerQuery.includes('decent') || lowerQuery.includes('okay') || lowerQuery.includes('average')) {
      minRating = 3.5;
    }
    
    // Extract categories
    let categories = [];
    if (lowerQuery.includes('men') || lowerQuery.includes('mens') || lowerQuery.includes("men's") || lowerQuery.includes('male')) {
      categories.push("men's clothing");
    }
    if (lowerQuery.includes('women') || lowerQuery.includes('womens') || lowerQuery.includes("women's") || lowerQuery.includes('ladies') || lowerQuery.includes('female')) {
      categories.push("women's clothing");
    }
    if (lowerQuery.includes('jewelry') || lowerQuery.includes('jewelery') || lowerQuery.includes('jewellery') || 
        lowerQuery.includes('ring') || lowerQuery.includes('necklace') || lowerQuery.includes('earring') ||
        lowerQuery.includes('bracelet') || lowerQuery.includes('accessories')) {
      categories.push('jewelery');
    }
    if (lowerQuery.includes('electronics') || lowerQuery.includes('electronic') || lowerQuery.includes('tech') || 
        lowerQuery.includes('gadget') || lowerQuery.includes('device') || lowerQuery.includes('computer') ||
        lowerQuery.includes('phone') || lowerQuery.includes('laptop') || lowerQuery.includes('digital')) {
      categories.push('electronics');
    }
    
    // Extract specific product keywords
    let keywords = [];
    const productKeywords = [
      'shirt', 'jacket', 'bag', 'backpack', 'dress', 'top', 'jeans', 'pants', 'shoes', 'sneakers',
      'watch', 'ring', 'necklace', 'bracelet', 'earring', 'phone', 'laptop', 'tablet',
      'headphone', 'speaker', 'camera', 'monitor', 'keyboard', 'mouse', 'charger',
      'cotton', 'leather', 'gold', 'silver', 'wireless', 'bluetooth', 'casual', 'formal'
    ];
    
    productKeywords.forEach(keyword => {
      if (lowerQuery.includes(keyword)) {
        keywords.push(keyword);
      }
    });

    // Extract color preferences
    let colors = [];
    const colorKeywords = ['black', 'white', 'red', 'blue', 'green', 'yellow', 'pink', 'purple', 'brown', 'gray', 'grey'];
    colorKeywords.forEach(color => {
      if (lowerQuery.includes(color)) {
        colors.push(color);
      }
    });

    // Extract size preferences
    let sizes = [];
    const sizeKeywords = ['small', 'medium', 'large', 'xl', 'xxl', 's', 'm', 'l'];
    sizeKeywords.forEach(size => {
      if (lowerQuery.includes(size)) {
        sizes.push(size);
      }
    });

    // Calculate confidence score
    let confidence = 0;
    // "men's leather jacket under $200"
    if (maxPrice || minPrice) confidence += 30;
    if (categories.length > 0) confidence += 25;
    if (keywords.length > 0) confidence += 20;
    if (query.length > 10) confidence += 15;
    if (query.split(' ').length > 2) confidence += 10;
    confidence = Math.min(100, confidence);
    
    return {
      maxPrice,
      minPrice,
      minRating,
      categories,
      keywords,
      colors,
      sizes,
      originalQuery: query,
      confidence
    };
  };

  const handleAISearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsAISearch(true);
    // Simulate API processing delay
    setTimeout(() => {
      const filters = processNaturalLanguageQuery(searchQuery);
      setIsAISearch(false);
      setShowAIPanel(true);
      
      // Apply AI filters to products
      applyAIFilters(filters);
    }, 1500);
  };

  const applyAIFilters = (filters) => {
    let filtered = [...data]; // Copy original data

    // Price filters
    if (filters.maxPrice) {
      filtered = filtered.filter(p => p.price <= filters.maxPrice);
    }
    if (filters.minPrice) {
      filtered = filtered.filter(p => p.price >= filters.minPrice);
    }
    
    // Rating filter
    if (filters.minRating) {
      filtered = filtered.filter(p => {
        // Use actual rating if available, otherwise simulate based on price
        const rating = p.rating?.rate || Math.min(5.0, 3.0 + (p.price / 100));
        return rating >= filters.minRating;
      });
    }
    
    // Category filters
    if (filters.categories.length > 0) {
      filtered = filtered.filter(p => 
        filters.categories.some(cat => p.category.toLowerCase() === cat.toLowerCase())
      );
    }
    
    // Keyword filters
    if (filters.keywords.length > 0) {
      filtered = filtered.filter(p => 
        filters.keywords.some(keyword => 
          p.title.toLowerCase().includes(keyword) || 
          p.description.toLowerCase().includes(keyword)
        )
      );
    }

    // Color filters
    if (filters.colors && filters.colors.length > 0) {
      filtered = filtered.filter(p => 
        filters.colors.some(color => 
          p.title.toLowerCase().includes(color) || 
          p.description.toLowerCase().includes(color)
        )
      );
    }

    // Size filters
    if (filters.sizes && filters.sizes.length > 0) {
      filtered = filtered.filter(p => 
        filters.sizes.some(size => 
          p.title.toLowerCase().includes(size) || 
          p.description.toLowerCase().includes(size)
        )
      );
    }

    setFilter(filtered); // Update filtered products
  };

  const clearAIFilters = () => {
    setSearchQuery('');
    setShowAIPanel(false);
    setFilter(data);
  };

  const Loading = () => {
    return (
      <>
        <div className="col-12 py-5 text-center">
          <Skeleton height={40} width={560} />
        </div>
        <div className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
          <Skeleton height={592} />
        </div>
        <div className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
          <Skeleton height={592} />
        </div>
        <div className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
          <Skeleton height={592} />
        </div>
        <div className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
          <Skeleton height={592} />
        </div>
        <div className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
          <Skeleton height={592} />
        </div>
        <div className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
          <Skeleton height={592} />
        </div>
      </>
    );
  };

  const filterProduct = (cat) => {
    // Clear AI filters when using traditional filtering
    setShowAIPanel(false);
    setSearchQuery('');
    
    if (cat === 'all') {
      setFilter(data);
    } else {
      const updatedList = data.filter((item) => item.category === cat);
      setFilter(updatedList);
    }
  };

  const ShowProducts = () => {
    return (
      <>
        {/* Traditional Category Buttons */}
        {!showAIPanel && (
          <div className="col-12">
            <div className="text-center py-4">
              <h6 className="text-muted mb-3 fw-bold">FILTER BY CATEGORY</h6>
              <div className="d-flex flex-wrap justify-content-center gap-3">
                <button
                  className="btn btn-outline-primary rounded-pill px-4 py-2 shadow-sm"
                  onClick={() => filterProduct('all')}
                  style={{
                    background: 'linear-gradient(45deg, #f8f9fa, #ffffff)',
                    border: '2px solid #667eea',
                    color: '#667eea',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Filter size={16} className="me-2" />
                  All Products
                </button>
                <button
                  className="btn btn-outline-info rounded-pill px-4 py-2 shadow-sm"
                  onClick={() => filterProduct("men's clothing")}
                  style={{
                    background: 'linear-gradient(45deg, #e3f2fd, #ffffff)',
                    border: '2px solid #2196f3',
                    color: '#2196f3',
                    fontWeight: '600'
                  }}
                >
                  👔 Men's Clothing
                </button>
                <button
                  className="btn btn-outline-danger rounded-pill px-4 py-2 shadow-sm"
                  onClick={() => filterProduct("women's clothing")}
                  style={{
                    background: 'linear-gradient(45deg, #fce4ec, #ffffff)',
                    border: '2px solid #e91e63',
                    color: '#e91e63',
                    fontWeight: '600'
                  }}
                >
                  👗 Women's Clothing
                </button>
                <button
                  className="btn btn-outline-warning rounded-pill px-4 py-2 shadow-sm"
                  onClick={() => filterProduct("jewelery")}
                  style={{
                    background: 'linear-gradient(45deg, #fff8e1, #ffffff)',
                    border: '2px solid #ff9800',
                    color: '#ff9800',
                    fontWeight: '600'
                  }}
                >
                  💎 Jewelery
                </button>
                <button
                  className="btn btn-outline-success rounded-pill px-4 py-2 shadow-sm"
                  onClick={() => filterProduct("electronics")}
                  style={{
                    background: 'linear-gradient(45deg, #e8f5e8, #ffffff)',
                    border: '2px solid #4caf50',
                    color: '#4caf50',
                    fontWeight: '600'
                  }}
                >
                  📱 Electronics
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {filter.length > 0 ? filter.map((product) => {
          return (
            <div
              id={product.id}
              key={product.id}
              className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4"
            >
              <div className="card h-100 border-0 shadow-lg position-relative overflow-hidden" 
                   style={{
                     borderRadius: '20px',
                     background: 'linear-gradient(145deg, #ffffff, #f8f9fa)'
                   }}>

                {/* Product Image with Rating Badge */}
                <div className="position-relative" style={{ height: '250px', overflow: 'hidden' }}>
                  {/* Rating Badge on top of image */}
                  <div className="position-absolute top-0 end-0 m-3" style={{ zIndex: 1 }}>
                    <span className="badge bg-primary rounded-pill px-3 py-2 shadow-sm">
                      ⭐ {product.rating?.rate || '4.0'}
                    </span>
                  </div>
                  
                  <img
                    className="card-img-top p-4"
                    src={product.image}
                    alt={product.title}
                    style={{
                      height: '100%',
                      objectFit: 'contain'
                    }}
                  />
                  <div className="position-absolute bottom-0 start-0 end-0 bg-gradient-to-t from-black/10 to-transparent h-25"></div>
                </div>

                <div className="card-body text-center px-4 pb-2">
                  <h5 className="card-title fw-bold mb-2" style={{ color: '#333333' }}>
                    {product.title.length > 50 ? product.title.substring(0, 50) + '...' : product.title}
                  </h5>
                  <p className="card-text text-muted small mb-3" style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                    {product.description.substring(0, 80)}...
                  </p>
                </div>

                {/* Price Section */}
                <div className="card-body pt-0 text-center">
                  <div className="bg-success bg-opacity-10 rounded-pill py-2 px-3 mb-3 d-inline-block">
                    <h4 className="mb-0 fw-bold text-success">
                      ${product.price}
                    </h4>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="card-body pt-0 pb-4">
                  <div className="d-grid gap-2">
                    <Link
                      to={"/product/" + product.id}
                      className="btn btn-primary rounded-pill fw-bold shadow-sm"
                      style={{
                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                        border: 'none',
                        padding: '12px 24px'
                      }}
                    >
                      🛍️ Buy Now
                    </Link>
                    <button
                      className="btn btn-outline-primary rounded-pill fw-bold"
                      style={{ padding: '10px 24px' }}
                      onClick={() => {
                        toast.success("Added to cart! 🛒", {
                          duration: 2000,
                          style: {
                            background: '#10b981',
                            color: 'white',
                            borderRadius: '20px'
                          }
                        });
                        addProduct(product);
                      }}
                    >
                      🛒 Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="col-12 text-center py-5">
            <div className="card border-0 shadow-lg rounded-4 py-5" style={{ background: 'linear-gradient(145deg, #f8f9fa, #ffffff)' }}>
              <div className="card-body">
                <div className="mb-4">
                  <div className="bg-light rounded-circle p-4 d-inline-block">
                    <Search size={48} className="text-muted" />
                  </div>
                </div>
                <h4 className="text-dark mb-3">No Products Found</h4>
                <p className="text-muted mb-4">
                  We couldn't find any products matching your criteria.<br />
                  Try adjusting your search or browse our categories.
                </p>
                {showAIPanel && (
                  <button 
                    className="btn btn-primary btn-lg rounded-pill px-5"
                    style={{
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      border: 'none'
                    }}
                    onClick={clearAIFilters}
                  >
                    <Filter className="me-2" size={18} />
                    Clear Search & Show All Products
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <div className="container my-3 py-3">
        <div className="row">
          <div className="col-12 text-center mb-5">
            <h1 className="display-4 fw-bold mb-3" style={{
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Latest Products
            </h1>
            <p className="lead text-muted">Discover amazing products with our AI-powered search</p>
            <div className="bg-primary mx-auto rounded-pill" style={{width: '100px', height: '4px'}}></div>
          </div>
        </div>

        {/* AI Search Panel */}
        <div className="row justify-content-center">
          <div className="col-12 mb-4">
            <div className="card shadow-lg border-0" style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '20px'
            }}>
              <div className="card-body text-white p-4">
                <div className="d-flex align-items-center mb-4">
                  <div className="bg-white bg-opacity-20 rounded-circle p-2 me-3">
                    <Brain size={28} className="text-black" />
                  </div>
                  <div>
                    <h4 className="mb-1 fw-bold">Search your product with AI</h4>
                  </div>
                </div>
                
                <div className="row align-items-end">
                  <div className="col-md-9 mb-3 mb-md-0">
                    <div className="position-relative">
                      <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={20} />
                      <input
                        type="text"
                        className="form-control form-control-lg ps-5 border-0 shadow-sm"
                        style={{
                          borderRadius: '15px',
                          backgroundColor: 'rgba(255,255,255,0.95)',
                          backdropFilter: 'blur(10px)'
                        }}
                        placeholder="Search your product here..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAISearch()}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <button
                      onClick={handleAISearch}
                      disabled={isAISearch || !searchQuery.trim()}
                      className="btn btn-light btn-lg w-100 d-flex align-items-center justify-content-center shadow-sm"
                      style={{
                        fontWeight: '600',
                        borderRadius: '15px',
                        background: 'linear-gradient(45deg, #ffffff, #f8f9fa)',
                        border: 'none',
                        color: '#667eea'
                      }}
                    >
                      {isAISearch ? (
                        <>
                          <div className="spinner-border spinner-border-sm me-2" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Zap size={18} className="me-2" />
                          AI Search
                        </>
                      )}
                    </button>
                  </div>
                </div>


              </div>
            </div>
          </div>
        </div>

        <div className="row justify-content-center">
          {loading ? <Loading /> : <ShowProducts />}
        </div>
      </div>
    </>
  );
};

export default Products;