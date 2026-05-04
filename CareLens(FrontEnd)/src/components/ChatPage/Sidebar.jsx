import React from 'react'

function Sidebar() {
  return (
    <aside className="d-none d-md-flex flex-column border-end border-custom bg-sidebar flex-shrink-0 z-index-20 w-300px h-100">
      <div className="tw-p-5 tw-pb-2">
        <div className="d-flex align-items-center tw-gap-3 tw-mb-8">
          <div className="bg-primary-custom aspect-square rounded-circle size-9 d-flex align-items-center justify-content-center shadow-lg-custom shadow-primary-20 text-white">
            <span className="material-symbols-outlined text-20px">medical_services</span>
          </div>
          <h1 className="text-charcoal text-lg fw-bold tracking-tight mb-0">CareLens AI</h1>
        </div>

        <button className="d-flex w-100 cursor-pointer align-items-center tw-gap-3 rounded-pill tw-h-12 tw-px-4 bg-primary-custom hover-bg-primary-hover transition-colors text-white tw-mb-6 shadow-lg-custom shadow-primary-10 group border-0">
          <span className="material-symbols-outlined transition-transform group-hover-rotate-90">add</span>
          <span className="text-sm fw-bold leading-normal tracking-015">New Consultation</span>
        </button>
      </div>

      <div className="flex-grow-1 overflow-y-auto tw-px-3 space-y-6">
        <div className="d-flex flex-column tw-gap-2">
          <h3 className="tw-px-3 text-secondary-custom text-xs fw-semibold text-uppercase tracking-wider mb-0">Today</h3>
          <a className="d-flex align-items-center tw-gap-3 tw-px-3 tw-py-3 rounded-xl bg-white border border-custom hover-border-primary-50 transition-all group shadow-sm-custom text-decoration-none" href="#">
            <span className="material-symbols-outlined text-primary-custom text-20px">chat_bubble</span>
            <p className="text-charcoal text-sm fw-medium leading-normal text-truncate group-hover-text-primary transition-colors mb-0">Abdominal pain check</p>
          </a>
        </div>

        <div className="d-flex flex-column tw-gap-2">
          <h3 className="tw-px-3 text-secondary-custom text-xs fw-semibold text-uppercase tracking-wider mb-0">Previous 7 Days</h3>
          <a className="d-flex align-items-center tw-gap-3 tw-px-3 tw-py-3 rounded-xl hover-bg-primary-5 transition-colors group text-decoration-none" href="#">
            <span className="material-symbols-outlined text-secondary-custom text-20px group-hover-text-primary">favorite</span>
            <p className="text-secondary-custom text-sm fw-medium leading-normal text-truncate group-hover-text-primary mb-0">Chest pain inquiry</p>
          </a>
          <a className="d-flex align-items-center tw-gap-3 tw-px-3 tw-py-3 rounded-xl hover-bg-primary-5 transition-colors group text-decoration-none" href="#">
            <span className="material-symbols-outlined text-secondary-custom text-20px group-hover-text-primary">trending_up</span>
            <p className="text-secondary-custom text-sm fw-medium leading-normal text-truncate group-hover-text-primary mb-0">Diabetes trends</p>
          </a>
          <a className="d-flex align-items-center tw-gap-3 tw-px-3 tw-py-3 rounded-xl hover-bg-primary-5 transition-colors group text-decoration-none" href="#">
            <span className="material-symbols-outlined text-secondary-custom text-20px group-hover-text-primary">description</span>
            <p className="text-secondary-custom text-sm fw-medium leading-normal text-truncate group-hover-text-primary mb-0">Post-op summary</p>
          </a>
        </div>
      </div>

      <div className="tw-p-4 mt-auto border-top border-custom">
        <button className="d-flex align-items-center tw-gap-3 w-100 tw-p-2 rounded-xl hover-bg-primary-5 transition-colors text-start group border-0 bg-transparent">
          <div className="bg-user-profile bg-center bg-no-repeat aspect-square bg-cover rounded-pill size-10 ring-2-primary-20"></div>
          <div className="d-flex flex-column flex-grow-1 min-w-0">
            <span className="text-charcoal text-sm fw-bold text-truncate group-hover-text-primary">James Anderson</span>
            <span className="text-secondary-custom text-xs text-truncate">Premium Plan</span>
          </div>
          <span className="material-symbols-outlined text-secondary-custom text-20px group-hover-text-primary">settings</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
