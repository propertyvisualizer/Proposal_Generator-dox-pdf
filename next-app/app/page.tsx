"use client";
import React, { useState, useEffect } from 'react';

// Configuration
const CONFIG = {
  projectTypes: [
    'Einfamilienhaus',
    'Mehrfamilienhaus',
    'Wohnanlage',
    'Gewerbeimmobilie',
    'Bürogebäude',
    'Hotel',
    'Einzelhandel',
    'Industriegebäude',
    'Mixed-Use',
    'Custom'
  ],
  deliveryTimeRules: {
    'exterior-ground': { baseTime: 7, additionalPerUnit: 2 },
    'exterior-bird': { baseTime: 3, additionalPerUnit: 1 },
    'interior': { baseTime: 5, additionalPerUnit: 2 },
    'terrace': { baseTime: 5, additionalPerUnit: 0 },
    '3d-floorplan': { baseTime: 3, additionalPerUnit: 1 },
    '3d-complete-floor': { baseTime: 5, additionalPerUnit: 2 },
    '2d-floorplan': { baseTime: 2, additionalPerUnit: 1 },
    'home-staging': { baseTime: 3, additionalPerUnit: 1 },
    'renovation': { baseTime: 3, additionalPerUnit: 1 },
    '360-interior': { baseTime: 10, additionalPerUnit: 0 },
    '360-exterior': { baseTime: 14, additionalPerUnit: 0 },
    'slideshow': { baseTime: 7, additionalPerUnit: 0 },
    'site-plan': { baseTime: 5, additionalPerUnit: 0 },
    'social-media': { baseTime: 3, additionalPerUnit: 0 }
  },
  offerValidityDays: 7
};

// Pricing functions
const pricing = {
  'exterior-ground': (qty, buildingType) => {
    if (qty === 0 || !buildingType) return 0;
    const priceMatrix = {
      'EFH': [499, 349, 299, 229, 199],
      'DHH': [599, 399, 359, 329, 299],
      'MFH-6-10': [699, 499, 399, 349, 329],
      'MFH-11-15': [799, 599, 499, 399, 349]
    };
    const prices = priceMatrix[buildingType] || [0, 0, 0, 0, 0];
    return qty <= 5 ? prices[qty - 1] : prices[4];
  },
  'exterior-bird': () => 12,
  '3d-floorplan': (projectType, areaSize) => {
    if (projectType === 'commercial') {
      const commercialPrices = { '100': 99, '250': 199, '500': 299, '1000': 399, '1500': 499 };
      return commercialPrices[areaSize] || 0;
    }
    return 69;
  },
  '3d-complete-floor': () => 199,
  '2d-floorplan': (projectType, areaSize) => {
    if (projectType === 'commercial') {
      const commercialPrices = { '100': 39, '250': 79, '500': 119, '1000': 159, '1500': 199 };
      return commercialPrices[areaSize] || 0;
    }
    return 49;
  },
  'home-staging': () => 99,
  'renovation': () => 139,
  '360-interior': (apartmentSize) => {
    if (!apartmentSize) return 0;
    const prices = {
      '30': 999, '40': 1299, '50': 1499, '60': 1699,
      '70': 1799, '80': 1899, '90': 1999, '100': 2299, 'EFH': 2499
    };
    return prices[apartmentSize] || 0;
  },
  '360-exterior': (buildingType) => {
    if (!buildingType) return 0;
    const prices = {
      'EFH-DHH': 1299, 'MFH-3-5': 1299, 'MFH-6-10': 1699, 'MFH-11-15': 1999
    };
    return prices[buildingType] || 0;
  },
  'slideshow': () => 499,
  'site-plan': () => 99,
  'social-media': () => 299,
  'interior': (qty) => {
    if (qty === 0) return 0;
    const tiers = [399, 299, 289, 269, 259, 249, 239, 229, 219];
    return qty <= 9 ? tiers[qty - 1] : 199;
  },
  'terrace': () => 0
};

const ProposalForm = () => {
  // Client Info State
  const [clientInfo, setClientInfo] = useState({
    clientNumber: '',
    companyName: '',
    street: '',
    postalCode: '',
    city: '',
    country: 'Deutschland'
  });

  // Project Info State
  const [projectInfo, setProjectInfo] = useState({
    projectNumber: '',
    projectName: '',
    projectType: '',
    customProjectType: '',
    deliveryTime: '',
    offerValidUntil: ''
  });

  // Services State
  const [services, setServices] = useState({});

  // Discount State
  const [discount, setDiscount] = useState({
    type: '',
    value: 0,
    description: ''
  });

  // Images State
  const [images, setImages] = useState([]);

  // Calculations State
  const [totals, setTotals] = useState({
    subtotalNet: 0,
    discountAmount: 0,
    totalNet: 0,
    totalVat: 0,
    totalGross: 0
  });

  // Auto-save indicator
  const [saveStatus, setSaveStatus] = useState('saved');

  // Initialize offer valid until date
  useEffect(() => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + CONFIG.offerValidityDays);
    setProjectInfo(prev => ({
      ...prev,
      offerValidUntil: futureDate.toISOString().split('T')[0]
    }));
  }, []);

  // Auto-save functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      saveFormData();
    }, 2000);

    return () => clearTimeout(timer);
  }, [clientInfo, projectInfo, services, discount, images]);

  // Calculate totals whenever services or discount changes
  useEffect(() => {
    calculateTotals();
  }, [services, discount]);

  const saveFormData = () => {
    setSaveStatus('saving');
    try {
      const data = {
        clientInfo,
        projectInfo,
        services,
        discount,
        images: images.map(img => ({
          title: img.title,
          description: img.description,
          fileName: img.fileName
        }))
      };
      localStorage.setItem('proposalFormData', JSON.stringify(data));
      setSaveStatus('saved');
    } catch (error) {
      console.error('Error saving:', error);
      setSaveStatus('error');
    }
  };

  const loadSavedData = () => {
    try {
      const saved = localStorage.getItem('proposalFormData');
      if (saved) {
        const data = JSON.parse(saved);
        setClientInfo(data.clientInfo || {});
        setProjectInfo(data.projectInfo || {});
        setServices(data.services || {});
        setDiscount(data.discount || { type: '', value: 0, description: '' });
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  };

  useEffect(() => {
    loadSavedData();
  }, []);

  const calculateTotals = () => {
    let subtotalNet = 0;

    Object.entries(services).forEach(([serviceId, serviceData]) => {
      if (!serviceData.enabled || !serviceData.quantity) return;

      const priceFunc = pricing[serviceId];
      if (!priceFunc) return;

      let unitPrice;
      if (serviceData.customPrice > 0) {
        unitPrice = serviceData.customPrice;
      } else {
        // Calculate price based on service type
        if (serviceId === 'exterior-ground') {
          unitPrice = priceFunc(serviceData.quantity, serviceData.buildingType);
        } else if (serviceId === '360-interior') {
          unitPrice = priceFunc(serviceData.apartmentSize);
        } else if (serviceId === '360-exterior') {
          unitPrice = priceFunc(serviceData.buildingType);
        } else if (serviceId === '3d-floorplan' || serviceId === '2d-floorplan') {
          unitPrice = priceFunc(serviceData.projectType, serviceData.areaSize);
        } else if (serviceId === 'interior') {
          unitPrice = priceFunc(serviceData.quantity);
        } else {
          unitPrice = priceFunc();
        }
      }

      subtotalNet += unitPrice * serviceData.quantity;
    });

    let discountAmount = 0;
    if (discount.type && discount.value > 0) {
      if (discount.type === 'percentage') {
        discountAmount = subtotalNet * (discount.value / 100);
      } else {
        discountAmount = discount.value;
      }
    }

    const totalNet = subtotalNet - discountAmount;
    const totalVat = totalNet * 0.19;
    const totalGross = totalNet + totalVat;

    setTotals({
      subtotalNet,
      discountAmount,
      totalNet,
      totalVat,
      totalGross
    });

    // Calculate delivery time
    calculateDeliveryTime();
  };

  const calculateDeliveryTime = () => {
    let maxDays = 0;

    Object.entries(services).forEach(([serviceId, serviceData]) => {
      if (!serviceData.enabled || !serviceData.quantity) return;

      const rule = CONFIG.deliveryTimeRules[serviceId];
      if (rule) {
        const serviceDays = rule.baseTime + (rule.additionalPerUnit * Math.max(0, serviceData.quantity - 1));
        maxDays = Math.max(maxDays, serviceDays);
      }
    });

    const minDays = maxDays || 7;
    const maxDeliveryDays = (maxDays || 7) + 3;

    setProjectInfo(prev => ({
      ...prev,
      deliveryTime: `${minDays} - ${maxDeliveryDays} Werktage`
    }));
  };

  const updateService = (serviceId, updates) => {
    setServices(prev => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        ...updates
      }
    }));
  };

  const formatPrice = (price) => {
    return price.toFixed(2).replace('.', ',') + ' €';
  };

  const handleClientLookup = async () => {
    // Placeholder for API call
    console.log('Looking up client:', clientInfo.clientNumber);
  };

  const resetForm = () => {
    if (confirm('Are you sure you want to reset the form?')) {
      setClientInfo({
        clientNumber: '',
        companyName: '',
        street: '',
        postalCode: '',
        city: '',
        country: 'Deutschland'
      });
      setProjectInfo({
        projectNumber: '',
        projectName: '',
        projectType: '',
        customProjectType: '',
        deliveryTime: '',
        offerValidUntil: ''
      });
      setServices({});
      setDiscount({ type: '', value: 0, description: '' });
      setImages([]);
      localStorage.removeItem('proposalFormData');
    }
  };

  const generateJSON = () => {
    const data = {
      clientInfo,
      projectInfo,
      services: Object.entries(services)
        .filter(([_, data]) => data.enabled && data.quantity > 0)
        .map(([id, data]) => ({
          id,
          ...data
        })),
      images,
      pricing: totals,
      discount: discount.type ? discount : null
    };

    console.log('Generated JSON:', data);
    alert('JSON generated! Check console for output.');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-12 text-white">
          <h1 className="text-3xl font-semibold mb-2">Proposal Generator</h1>
          <p className="text-slate-200">Client Proposal Generation Form</p>
        </div>

        <div className="p-8">
          {/* Client Information */}
          <section className="mb-10 pb-8 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-slate-800 mb-6">👤 Client Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Client Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={clientInfo.clientNumber}
                    onChange={(e) => setClientInfo(prev => ({ ...prev, clientNumber: e.target.value }))}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                    placeholder="e.g. 12345"
                  />
                  <button
                    onClick={handleClientLookup}
                    className="px-4 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition"
                  >
                    ✓
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Enter 5-digit client number and click ✓</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={clientInfo.companyName}
                  onChange={(e) => setClientInfo(prev => ({ ...prev, companyName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                  placeholder="Company name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  value={clientInfo.street}
                  onChange={(e) => setClientInfo(prev => ({ ...prev, street: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                  placeholder="e.g. Sample Street 123"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Postal Code *
                </label>
                <input
                  type="text"
                  value={clientInfo.postalCode}
                  onChange={(e) => setClientInfo(prev => ({ ...prev, postalCode: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                  placeholder="e.g. 12345"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={clientInfo.city}
                  onChange={(e) => setClientInfo(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                  placeholder="e.g. Berlin"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Country *
                </label>
                <select
                  value={clientInfo.country}
                  onChange={(e) => setClientInfo(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                  required
                >
                  <option value="Deutschland">Deutschland</option>
                  <option value="Österreich">Österreich</option>
                  <option value="Schweiz">Schweiz</option>
                  <option value="Frankreich">Frankreich</option>
                </select>
              </div>
            </div>
          </section>

          {/* Summary */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-slate-800 mb-6">💰 Summary</h2>
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white p-8 rounded-xl">
              <div className="space-y-4">
                <div className="flex justify-between text-lg">
                  <span>Subtotal Net:</span>
                  <span className="font-semibold">{formatPrice(totals.subtotalNet)}</span>
                </div>
                {discount.type && discount.value > 0 && (
                  <div className="flex justify-between text-lg">
                    <span>Discount ({discount.type === 'percentage' ? discount.value + '%' : 'Fixed'}):</span>
                    <span className="font-semibold">- {formatPrice(totals.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg">
                  <span>Total Net:</span>
                  <span className="font-semibold">{formatPrice(totals.totalNet)}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span>VAT (19%):</span>
                  <span className="font-semibold">{formatPrice(totals.totalVat)}</span>
                </div>
                <div className="flex justify-between text-2xl font-bold pt-4 border-t-2 border-white/30">
                  <span>Total Gross:</span>
                  <span>{formatPrice(totals.totalGross)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={resetForm}
              className="px-8 py-3 bg-gray-200 text-slate-800 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              🔄 Reset
            </button>
            <button
              onClick={generateJSON}
              className="px-8 py-3 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-700 transition shadow-lg"
            >
              📋 Generate JSON
            </button>
          </div>

          {/* Auto-save Indicator */}
          {saveStatus !== 'saved' && (
            <div className="fixed bottom-4 right-4 bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg">
              {saveStatus === 'saving' ? '⏳ Saving...' : '✅ Saved'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProposalForm;