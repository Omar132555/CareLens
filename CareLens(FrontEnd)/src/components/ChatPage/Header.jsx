import React from 'react'

function Header() {
  return (
    <header className="d-flex align-items-center justify-content-between tw-px-6 tw-py-4 border-bottom border-custom backdrop-blur-md sticky-top z-index-10">
      <div className="d-flex align-items-center tw-gap-4">
        <div className="position-relative">
          <div className="bg-ai-header bg-center bg-no-repeat bg-cover rounded-pill size-10 border border-custom"></div>
          <div className="position-absolute bottom-0 end-0 size-3 bg-primary-custom rounded-pill border-2-white border-solid"></div>
        </div>
        <div>
          <h2 className="text-charcoal text-base fw-bold leading-tight mb-0">CareLens AI Assistant</h2>
        </div>
      </div>

    </header>
  )
}

export default Header
