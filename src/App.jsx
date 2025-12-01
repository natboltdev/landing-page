import { useState } from 'react'
import './App.css'
import { supabase, isSupabaseConfigured } from './supabase'

const services = [
  { id: 'general', name: 'General Service', icon: '🔧', desc: 'Oil change, filter cleaning & checkup', price: 499 },
  { id: 'tyre', name: 'Tyre Service', icon: '🛞', desc: 'Puncture repair & replacement', price: 199 },
  { id: 'battery', name: 'Battery Service', icon: '🔋', desc: 'Battery check & replacement', price: 299 },
  { id: 'brake', name: 'Brake Service', icon: '🛑', desc: 'Brake pad & fluid service', price: 199 },
  { id: 'engine', name: 'Engine Repair', icon: '⚙️', desc: 'Engine tuning & repair', price: 999 },
  { id: 'wash', name: 'Wash & Clean', icon: '🚿', desc: 'Complete wash & polish', price: 149 },
]

function App() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    vehicleType: '',
    brand: '',
    model: '',
    regNumber: '',
    serviceDate: '',
    selectedServices: [],
    address: '',
    pickupTime: '',
    customProblem: '',
    notes: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [bookingId, setBookingId] = useState('')
  const [loading, setLoading] = useState(false)
  const [showBill, setShowBill] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleServiceToggle = (serviceId) => {
    setFormData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceId)
        ? prev.selectedServices.filter(id => id !== serviceId)
        : [...prev.selectedServices, serviceId]
    }))
  }

  const getTotalPrice = () => {
    return formData.selectedServices.reduce((total, id) => {
      const service = services.find(s => s.id === id)
      return total + (service?.price || 0)
    }, 0)
  }

  const getSelectedServices = () => {
    const regularServices = formData.selectedServices.map(id => services.find(s => s.id === id)).filter(Boolean)

    // Add custom "Others" service if selected
    if (formData.selectedServices.includes('others')) {
      regularServices.push({
        id: 'others',
        name: 'Others',
        price: 0,
        customProblem: formData.customProblem
      })
    }

    return regularServices
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const id = 'BK' + Date.now().toString(36).toUpperCase()

    // Save to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('bookings').insert({
          booking_id: id,
          name: formData.name,
          phone: formData.phone,
          vehicle_type: formData.vehicleType,
          brand: formData.brand,
          model: formData.model,
          reg_number: formData.regNumber,
          services: formData.selectedServices,
          total_price: getTotalPrice(),
          address: formData.address,
          service_date: formData.serviceDate,
          pickup_time: formData.pickupTime,
          notes: formData.notes,
          status: 'pending'
        })
        if (error) console.error('Supabase error:', error)
      } catch (err) {
        console.error('Failed to save:', err)
      }
    }

    setBookingId(id)
    setSubmitted(true)
    setLoading(false)
  }

  const resetForm = () => {
    setFormData({
      name: '', phone: '', vehicleType: '', brand: '', model: '',
      regNumber: '', serviceDate: '', selectedServices: [], address: '', pickupTime: '', notes: ''
    })
    setSubmitted(false)
    setBookingId('')
    setShowBill(false)
  }

  const printBill = () => {
    window.print()
  }

  const shareWhatsApp = () => {
    const selectedSvcs = getSelectedServices()
    const servicesList = selectedSvcs.map(s => {
      if (s.id === 'others') {
        return `- ${s.name}: ${s.customProblem}`
      }
      return `- ${s.name}: ₹${s.price}`
    }).join('\n')
    const message = `*NatBolt Service Booking*

Booking ID: ${bookingId}

*Customer:* ${formData.name}
*Phone:* ${formData.phone}

*Vehicle:* ${formData.brand} ${formData.model}
*Reg No:* ${formData.regNumber}

*Services:*
${servicesList}

*Total:* ₹${getTotalPrice()}

*Pickup:* ${formData.serviceDate} (${formData.pickupTime})
*Address:* ${formData.address}

Thank you for choosing NatBolt!`

    const url = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  return (
    <>
      {/* Navigation */}
      <nav className="navbar">
        <div className="container">
          <div className="logo">
            <img src="/icon_orange.png" alt="NatBolt" className="logo-icon" />
            <span className="logo-text">NatBolt</span>
          </div>
          <ul className="nav-links">
            <li><a href="#services">Services</a></li>
            <li><a href="#how-it-works">How It Works</a></li>
            <li><a href="#booking">Book Now</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Two Wheeler Service at Your Doorstep</h1>
            <p>Book service for your bike or scooter with free pickup & drop. Trusted garages near you.</p>
            <a href="#booking" className="btn btn-primary">Book Service Now</a>
          </div>
          <div className="hero-image">
            <svg className="hero-illustration" viewBox="0 0 400 300" fill="none">
              <ellipse cx="200" cy="270" rx="180" ry="20" fill="#FFF5F0"/>
              <circle cx="120" cy="220" r="45" stroke="#F26122" strokeWidth="8" fill="white"/>
              <circle cx="280" cy="220" r="45" stroke="#F26122" strokeWidth="8" fill="white"/>
              <path d="M120 220 L160 160 L240 160 L280 220" stroke="#0C0C0C" strokeWidth="6" fill="none"/>
              <path d="M160 160 L180 100 L220 100 L200 160" stroke="#0C0C0C" strokeWidth="6" fill="none"/>
              <circle cx="200" cy="90" r="15" fill="#F26122"/>
              <rect x="175" y="155" width="50" height="25" rx="5" fill="#F26122"/>
            </svg>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="services">
        <div className="container">
          <h2>Our Services</h2>
          <p className="section-subtitle">Quality service for all two-wheelers</p>
          <div className="services-grid">
            {services.map(service => (
              <div key={service.id} className="service-card">
                <div className="service-icon">{service.icon}</div>
                <h3>{service.name}</h3>
                <p>{service.desc}</p>
                <span className="price">Starting ₹{service.price}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <p className="section-subtitle">Simple 4-step process</p>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Book Online</h3>
              <p>Fill the booking form</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>We Pickup</h3>
              <p>From your location</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Service Done</h3>
              <p>By expert mechanics</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>We Deliver</h3>
              <p>Back to you</p>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section id="booking" className="booking">
        <div className="container">
          <h2>Book Your Service</h2>
          <p className="section-subtitle">Fill in the details below</p>

          {submitted ? (
            <div className="booking-form">
              {showBill ? (
                <div className="bill" id="bill">
                  <div className="bill-header">
                    <h2>NatBolt</h2>
                    <p>Service Estimate</p>
                  </div>
                  <div className="bill-info">
                    <div className="bill-row">
                      <span>Booking ID:</span>
                      <strong>{bookingId}</strong>
                    </div>
                    <div className="bill-row">
                      <span>Date:</span>
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                  <hr />
                  <div className="bill-section">
                    <h4>Customer Details</h4>
                    <p><strong>{formData.name}</strong></p>
                    <p>{formData.phone}</p>
                    <p>{formData.address}</p>
                  </div>
                  <div className="bill-section">
                    <h4>Vehicle</h4>
                    <p>{formData.brand} {formData.model} ({formData.vehicleType})</p>
                    <p>Reg: {formData.regNumber}</p>
                  </div>
                  <div className="bill-section">
                    <h4>Services</h4>
                    <table className="bill-table">
                      <thead>
                        <tr>
                          <th>Service</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getSelectedServices().map(svc => (
                          <tr key={svc.id}>
                            <td>
                              {svc.name}
                              {svc.id === 'others' && svc.customProblem && (
                                <div style={{fontSize: '0.9em', color: '#666', marginTop: '4px'}}>
                                  {svc.customProblem}
                                </div>
                              )}
                            </td>
                            <td>{svc.id === 'others' ? 'Quote on request' : `₹${svc.price}`}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td><strong>Total</strong></td>
                          <td><strong>₹{getTotalPrice()}</strong></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  <div className="bill-section">
                    <h4>Pickup Schedule</h4>
                    <p>{formData.serviceDate} | {formData.pickupTime}</p>
                  </div>
                  {formData.notes && (
                    <div className="bill-section">
                      <h4>Notes</h4>
                      <p>{formData.notes}</p>
                    </div>
                  )}
                  <div className="bill-footer">
                    <p>Thank you for choosing NatBolt!</p>
                    <p>For queries: +91 9738007523</p>
                  </div>
                  <div className="bill-actions no-print">
                    <button className="btn btn-secondary" onClick={printBill}>Print</button>
                    <button className="btn btn-success" onClick={shareWhatsApp}>Share WhatsApp</button>
                    <button className="btn btn-primary" onClick={() => setShowBill(false)}>Back</button>
                  </div>
                </div>
              ) : (
                <div className="success-message">
                  <div className="success-icon">✅</div>
                  <h3>Booking Confirmed!</h3>
                  <p>Your booking has been received. We will contact you shortly.</p>
                  <div className="booking-id">Booking ID: {bookingId}</div>
                  <p><strong>Total:</strong> ₹{getTotalPrice()}</p>
                  <div className="success-actions">
                    <button className="btn btn-secondary" onClick={() => setShowBill(true)}>View Bill</button>
                    <button className="btn btn-success" onClick={shareWhatsApp}>Share WhatsApp</button>
                  </div>
                  <button className="btn btn-primary" onClick={resetForm} style={{ marginTop: '16px' }}>Book Another Service</button>
                </div>
              )}
            </div>
          ) : (
            <form className="booking-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter your name" />
                </div>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="Enter phone number" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Vehicle Type *</label>
                  <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} required>
                    <option value="">Select vehicle type</option>
                    <option value="bike">Bike</option>
                    <option value="scooter">Scooter</option>
                    <option value="electric">Electric Two Wheeler</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Brand *</label>
                  <input type="text" name="brand" value={formData.brand} onChange={handleChange} required placeholder="e.g., Honda, TVS" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Model *</label>
                  <input type="text" name="model" value={formData.model} onChange={handleChange} required placeholder="e.g., Activa, Apache" />
                </div>
                <div className="form-group">
                  <label>Registration Number *</label>
                  <input type="text" name="regNumber" value={formData.regNumber} onChange={handleChange} required placeholder="TS 01 AB 1234" />
                </div>
              </div>

              <div className="form-group">
                <label>Select Services *</label>
                <div className="services-checkbox">
                  {services.map(service => (
                    <label key={service.id} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={formData.selectedServices.includes(service.id)}
                        onChange={() => handleServiceToggle(service.id)}
                      />
                      <span>{service.name}</span>
                    </label>
                  ))}
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={formData.selectedServices.includes('others')}
                      onChange={() => handleServiceToggle('others')}
                    />
                    <span>Others</span>
                  </label>
                </div>
                {formData.selectedServices.includes('others') && (
                  <div className="form-group" style={{marginTop: '10px'}}>
                    <label>Describe your problem *</label>
                    <textarea
                      name="customProblem"
                      value={formData.customProblem}
                      onChange={handleChange}
                      placeholder="Please describe the specific problem or service you need"
                      required
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Pickup Address *</label>
                <textarea name="address" value={formData.address} onChange={handleChange} required placeholder="Enter complete address for pickup" />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Preferred Date *</label>
                  <input type="date" name="serviceDate" value={formData.serviceDate} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Pickup Time *</label>
                  <select name="pickupTime" value={formData.pickupTime} onChange={handleChange} required>
                    <option value="">Select time slot</option>
                    <option value="9-11 AM">9:00 AM - 11:00 AM</option>
                    <option value="11-1 PM">11:00 AM - 1:00 PM</option>
                    <option value="2-4 PM">2:00 PM - 4:00 PM</option>
                    <option value="4-6 PM">4:00 PM - 6:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Additional Notes</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Any specific issues?" />
              </div>

              {formData.selectedServices.length > 0 && (
                <p style={{ textAlign: 'right', fontWeight: 600, color: 'var(--primary)' }}>
                  Estimated Total: ₹{getTotalPrice()}
                </p>
              )}

              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Booking...' : 'Book Service'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="contact">
        <div className="container">
          <h2>Contact Us</h2>
          <p className="section-subtitle">Have questions? Get in touch!</p>
          <div className="contact-grid">
            <div className="contact-item">
              <div className="contact-icon">📞</div>
              <h3>Phone</h3>
              <p>+91 9738007523</p>
            </div>
            <div className="contact-item">
              <div className="contact-icon">📧</div>
              <h3>Email</h3>
              <p>hello@natbolt.com</p>
            </div>
            <div className="contact-item">
              <div className="contact-icon">📍</div>
              <h3>Location</h3>
              <p>Hyderabad, Telangana</p>
            </div>
            <div className="contact-item">
              <div className="contact-icon">⏰</div>
              <h3>Hours</h3>
              <p>Mon-Sat: 9AM - 7PM</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="logo">
                <img src="/icon_orange.png" alt="NatBolt" className="logo-icon" />
                <span className="logo-text">NatBolt</span>
              </div>
              <p>Your trusted partner for two-wheeler services</p>
            </div>
            <div className="footer-links">
              <a href="#services">Services</a>
              <a href="#booking">Book Now</a>
              <a href="#contact">Contact</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 NatBolt. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  )
}

export default App
