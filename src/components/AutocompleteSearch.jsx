import React, { useState, useEffect, useRef } from 'react';

const AutocompleteSearch = ({ options, value, onChange, placeholder, displayKey = 'label', valueKey = 'value', emptyMessage = 'לא נמצאו תוצאות' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Initialize search term based on current value
  useEffect(() => {
    if (value) {
      const selectedOption = options.find(opt => opt[valueKey] === value);
      if (selectedOption) {
        setSearchTerm(selectedOption[displayKey]);
      } else {
        setSearchTerm('');
      }
    } else {
      setSearchTerm('');
    }
  }, [value, options, valueKey, displayKey]);

  // Handle outside clicks to close the dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        // Reset search term if not fully selected
        const selectedOption = options.find(opt => opt[valueKey] === value);
        if (selectedOption) {
          setSearchTerm(selectedOption[displayKey]);
        } else {
          setSearchTerm('');
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef, value, options, valueKey, displayKey]);

  // Filter options based on search term
  // Only filter if the user is actively typing (the searchTerm doesn't perfectly match the selected value)
  const isTyping = value ? options.find(o => o[valueKey] === value)?.[displayKey] !== searchTerm : true;
  
  const filteredOptions = (isTyping && searchTerm)
    ? options.filter(opt => 
        opt[displayKey].toLowerCase().includes(searchTerm.toLowerCase()) || 
        (opt.searchTerms && opt.searchTerms.some(term => term.toLowerCase().includes(searchTerm.toLowerCase())))
      )
    : options;

  const handleSelect = (option) => {
    setSearchTerm(option[displayKey]);
    setIsOpen(false);
    onChange(option[valueKey]);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
    if (value) {
       // if typing changes, clear the actual value until they select again
       onChange('');
    }
  };

  const handleFocus = () => {
    // Only open if they haven't selected a final value yet, or if they click to change
    setIsOpen(true);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        className="input-field"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onClick={(e) => {
          if (value) e.target.select(); // Select text so they can overwrite easily
        }}
        style={{ width: '100%' }}
      />
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 1000,
          background: 'var(--background-dark)',
          border: '1px solid var(--glass-border)',
          borderRadius: '0 0 10px 10px',
          maxHeight: '200px',
          overflowY: 'auto',
          boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
        }}>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, index) => (
              <div
                key={opt[valueKey] || index}
                onClick={() => handleSelect(opt)}
                style={{
                  padding: '10px 15px',
                  cursor: 'pointer',
                  borderBottom: index < filteredOptions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  background: 'transparent',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {opt[displayKey]}
              </div>
            ))
          ) : (
            <div style={{ padding: '10px 15px', color: 'var(--text-muted)' }}>
              {emptyMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AutocompleteSearch;
