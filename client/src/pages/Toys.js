import React from 'react';
import { motion } from 'framer-motion';
import './Toys.css';

const Toys = () => {
  // Placeholder data for toys/collectibles
  const collections = [
    {
      id: 1,
      category: 'Action Figures',
      items: [
        { id: 1, name: 'Figure Name', brand: 'Brand', year: '2024' },
        { id: 2, name: 'Another Figure', brand: 'Brand', year: '2023' },
      ]
    },
    {
      id: 2,
      category: 'Models & Kits',
      items: [
        { id: 1, name: 'Model Kit', brand: 'Brand', scale: '1:100' },
        { id: 2, name: 'Another Model', brand: 'Brand', scale: '1:72' },
      ]
    },
    {
      id: 3,
      category: 'Collectibles',
      items: [
        { id: 1, name: 'Collectible Item', brand: 'Brand', edition: 'Limited' },
        { id: 2, name: 'Another Collectible', brand: 'Brand', edition: 'Standard' },
      ]
    }
  ];

  return (
    <motion.div 
      className="toys-page page-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="page-title">Toys & Collectibles</h1>

      <div className="toys-content">
        <motion.p 
          className="toys-intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Welcome to my collection showcase. Here you'll find my favorite toys, 
          action figures, models, and collectibles that I've gathered over the years.
        </motion.p>

        {collections.map((collection, collectionIndex) => (
          <motion.section 
            key={collection.id}
            className="collection-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + collectionIndex * 0.1 }}
          >
            <h2 className="section-title">{collection.category}</h2>
            <div className="toys-grid">
              {collection.items.map((item) => (
                <div key={item.id} className="toy-card">
                  <div className="toy-image">
                    <div className="toy-placeholder"></div>
                  </div>
                  <div className="toy-info">
                    <h3>{item.name}</h3>
                    <p className="toy-brand">{item.brand}</p>
                    <div className="toy-meta">
                      {item.year && <span className="toy-tag">{item.year}</span>}
                      {item.scale && <span className="toy-tag">{item.scale}</span>}
                      {item.edition && <span className="toy-tag edition">{item.edition}</span>}
                    </div>
                  </div>
                </div>
              ))}
              <div className="add-toy-card">
                <span>+ Add Item</span>
              </div>
            </div>
          </motion.section>
        ))}

        {/* Wishlist Section */}
        <motion.section 
          className="collection-section wishlist"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h2 className="section-title">Wishlist</h2>
          <p className="wishlist-description">
            Items I'm hoping to add to my collection someday.
          </p>
          <div className="wishlist-grid">
            <div className="wishlist-item">
              <span>Add wishlist items here</span>
            </div>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
};

export default Toys;
